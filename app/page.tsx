'use client';

import Colorpicker from "./components/Colorpicker";
import Search from "./components/Search";
import { ApplicationContextProvider } from "./context-provider";
import { RunActionButtons } from "./components/RunActionButtons";
import { ReceipeList } from "./components/ReceipeList";
import { ProgressBar } from "./components/ProgressBar";
import { Palette } from "./components/Palette";

export default function Home() {
  return (
    <ApplicationContextProvider>
      <div className="container">
        <header>
          <h1>Acrylic Mixing Bot</h1>
          <span className="button-subtitle"><a href="https://www.tensorflow.org/">Tensorflow</a> powered.</span>
          <p>Find a good mix for your target color.</p>
        </header>
        <Search />
        <Palette />
        <section className="controls">
          <Colorpicker /><ProgressBar />
          <RunActionButtons />
        </section>
        <section className="controls">
          <div></div>
        </section>
        <ReceipeList />

      </div>
    </ApplicationContextProvider>
  );
}
