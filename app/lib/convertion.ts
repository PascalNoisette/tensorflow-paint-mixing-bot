
import { ApplicationColor } from '../types'
import mixbox from 'mixbox';

function rgb2hsv(r: number, g: number, b: number): { h: number, s: number, v: number } {
    let computedH = 0;
    let computedS = 0;
    let computedV = 0;

    if (r == null || g == null || b == null ||
        isNaN(r) || isNaN(g) || isNaN(b)) {
        return { h: 0, s: 0, v: 0 };
    }
    if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
        return { h: 0, s: 0, v: 0 };
    }
    r = r / 255; g = g / 255; b = b / 255;
    const minRGB = Math.min(r, Math.min(g, b));
    const maxRGB = Math.max(r, Math.max(g, b));

    // Black-gray-white
    if (minRGB == maxRGB) {
        computedV = minRGB * 100;
        return { h: 0, s: 0, v: computedV };
    }

    // Colors other than black-gray-white:
    const d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
    const h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
    computedH = 60 * (h - d / (maxRGB - minRGB));
    if (computedH < 0) computedH += 360;
    computedS = 100 * (maxRGB - minRGB) / maxRGB;
    computedV = 100 * maxRGB;
    return { h: computedH, s: computedS, v: computedV };
}


function rgbNumToKm(val255: number) {
    let R = val255 / 255.0;
    if (R < 0.001) R = 0.001;
    if (R > 0.999) R = 0.999;
    return Math.pow(1 - R, 2) / (2 * R);
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToCmyk(r: number, g: number, b: number) {
    const R = r / 255;
    const G = g / 255;
    const B = b / 255;

    const k = 1 - Math.max(R, G, B);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };

    const c = (1 - R - k) / (1 - k);
    const m = (1 - G - k) / (1 - k);
    const y = (1 - B - k) / (1 - k);

    return { c, m, y, k };
}



export function alternativeCoordinate(color: ApplicationColor): ApplicationColor {

    const rgb = hexToRgb(color.css);
    return {
        ...color,
        latent: mixbox.rgbToLatent(color.css),
        cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
        rgb: rgb,
        hsv: rgb2hsv(rgb.r, rgb.g, rgb.b),
        ks: {
            r: rgbNumToKm(rgb.r),
            g: rgbNumToKm(rgb.g),
            b: rgbNumToKm(rgb.b)
        }
    };
}