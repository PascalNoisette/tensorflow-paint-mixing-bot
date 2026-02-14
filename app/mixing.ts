
import { ApplicationContextType, ApplicationColor, ApplicationReceipe } from './types'
import mixbox from 'mixbox';
import * as tf from '@tensorflow/tfjs';
import { alternativeCoordinate } from './lib/convertion';



// Core Mix Calculation for an array of primitives and weights (Mixbox version)
export function calculateMix(colors: ApplicationColor[], weights: number[]) {
    if (colors.length === 0) return null;

    const totalW = weights.reduce((a, b) => a + b, 0);
    const latentMix = new Array(7).fill(0);

    for (let i = 0; i < colors.length; i++) {
        const latent = colors[i].latent || mixbox.rgbToLatent(colors[i].css) || [0, 0, 0, 0, 0, 0, 0];
        const w = weights[i] / totalW;
        for (let j = 0; j < 7; j++) {
            latentMix[j] += latent[j] * w;
        }
    }

    return mixbox.latentToRgb(latentMix);
}


function getDistance(state: any, targetRgb: any) {
    // Euclidean RGB distance
    // state can be a mix result or a primary
    const s = state.rgb || state;
    return Math.sqrt(
        Math.pow(s.r - targetRgb.r, 2) +
        Math.pow(s.g - targetRgb.g, 2) +
        Math.pow(s.b - targetRgb.b, 2)
    ) / 442; // Normalize by max possible distance
}

function getCmykDistance(cmyk1: { c: number, m: number, y: number, k: number }, cmyk2: { c: number, m: number, y: number, k: number }) {
    return Math.sqrt(
        Math.pow(cmyk1.c - cmyk2.c, 2) +
        Math.pow(cmyk1.m - cmyk2.m, 2) +
        Math.pow(cmyk1.y - cmyk2.y, 2) +
        Math.pow(cmyk1.k - cmyk2.k, 2)
    ) / 2; // Normalize by max distance in 4D space (sqrt(4)=2)
}

function getKmDistance(ks1: { r: number, g: number, b: number }, ks2: { r: number, g: number, b: number }) {
    // Normalization is tricky here as K/S values can be high.
    // However, for typical paint mixes, the relevant range is often 0-10.
    // We'll use a simple Euclidean distance in K/S space across 3 spectrum channels.
    return Math.sqrt(
        Math.pow(ks1.r - ks2.r, 2) +
        Math.pow(ks1.g - ks2.g, 2) +
        Math.pow(ks1.b - ks2.b, 2)
    );
}

// Helper to add if good
const evaluateCombinaison = (target: ApplicationColor, colors: ApplicationColor[], weights: number[]): ApplicationReceipe => {


    // normalize weights the smallest is 1 without causing rounding
    const minWeight = Math.min(...weights);
    const normalizedWeights = weights.map(w => Math.round(10 * w / minWeight));



    const [r, g, b] = calculateMix(colors, normalizedWeights);
    const mix = alternativeCoordinate({ css: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` });
    const dist = getDistance(mix.rgb, target.rgb);
    const cmykDist = target.cmyk && mix.cmyk ? getCmykDistance(mix.cmyk, target.cmyk) : 0;
    const kmDist = target.ks && mix.ks ? getKmDistance(mix.ks, target.ks) : 0;
    const sortedIndex = weights.map((_, index: number) => index).sort((a, b) => weights[b] - weights[a]);

    return {
        colors: sortedIndex.map(i => colors[i]),
        weights: sortedIndex.map(i => normalizedWeights[i]),
        finalMix: mix,
        finalDist: dist,
        finalDistCmyk: cmykDist,
        finalDistKm: kmDist,
        totalParts: normalizedWeights.reduce((a, b) => a + b, 0)
    };
};

async function* gradienDescent(primaries: ApplicationColor[], target: ApplicationColor, numRestarts: number, iterations: number, learningRate: number): AsyncGenerator<[ApplicationColor[], number[]], void, unknown> {
    if (primaries.length === 0) return;

    // Convert target and primaries to tensors
    const targetLatent = tf.tensor1d(Object.values(target.latent as any) as number[]);
    const primaryLatents = tf.tensor2d(primaries.map(p => Object.values(p.latent as any) as number[]));




    for (let restart = 0; restart < numRestarts; restart++) {
        // Use a different random initialization for each restart to find local minima
        const rawWeights = tf.variable(tf.randomNormal([primaries.length]));
        const optimizer = tf.train.adam(learningRate);

        for (let i = 0; i < iterations; i++) {
            optimizer.minimize(() => {
                // Use softmax to ensure weights are non-negative and sum to 1
                const weights = tf.softmax(rawWeights);
                const mixedLatent = tf.matMul(weights.expandDims(0), primaryLatents).squeeze();
                return tf.losses.meanSquaredError(targetLatent, mixedLatent);
            });

        }

        const weightsData = await tf.softmax(rawWeights).data();
        rawWeights.dispose();

        const selectedColors: ApplicationColor[] = [];
        const selectedWeights: number[] = [];

        weightsData.forEach((w, idx) => {
            if (w >= 8 / 100) { // Threshold for significant contribution 9 is good
                selectedColors.push(primaries[idx]);
                selectedWeights.push(w);
            }
        });

        if (selectedColors.length > 0) {
            yield [selectedColors, selectedWeights];
            await tf.nextFrame();
        }
    }

    // Clean up tensors
    targetLatent.dispose();
    primaryLatents.dispose();
}

export async function solveMixing(application: ApplicationContextType): Promise<void> {

    const numRestarts = 150;//50 is good
    const iterations = 150;//150 is good
    const learningRate = 0.01;//0.01 is good
    let i = 1;
    const recipes: ApplicationReceipe[] = application.recipes;
    for await (const [selectedColors, selectedWeights] of gradienDescent(application.allowedPrimaries.filter(p => p.checked == true), application.target, numRestarts, iterations, learningRate)) {

        if (application.target.hsv && application.target.hsv.s > 10 && selectedColors.reduce((a, c) => c.css == '#ffffff' || c.css == '#000000' ? a + 1 : a, 0) >= 2) {
            // gray is not allowed for colors with saturation > 10
            continue;
        }
        const recipe = evaluateCombinaison(application.target, selectedColors, selectedWeights);
        if (recipe.totalParts <= 250) {//250 is good
            recipes.push(recipe);
        }
        application.setComputation(i);
        application.setRecipes(recipes.sort((a, b) => a.finalDist - b.finalDist).slice(0, application.pageSize));


        i++;
    }


    // Group recipes by similarity and keep best ones
    const sortedRecipes = recipes.sort((a, b) => a.finalDist - b.finalDist);
    const bestUniqueRecipes: ApplicationReceipe[] = [];

    for (const recipe of sortedRecipes) {
        // Check if we already have a similar recipe
        const isDuplicate = bestUniqueRecipes.some(r => {
            if (r.colors.length !== recipe.colors.length) return false;
            const sameColors = r.colors.every((c, idx) => c.css === recipe.colors[idx].css);
            if (!sameColors) return false;
            const similarWeights = r.weights.every((w, idx) => Math.abs(w - recipe.weights[idx]) < 1);
            return similarWeights;
        });

        if (!isDuplicate) {
            bestUniqueRecipes.push(recipe);
        }
        if (bestUniqueRecipes.length >= 10) break;//10 is good enough
    }

    application.setRecipes(bestUniqueRecipes);
    application.setComputation(0);
}
