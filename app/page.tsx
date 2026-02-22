'use client';

import Colorpicker from "./components/Colorpicker";
import { ApplicationContextProvider } from "./context-provider";
import { SuggestionProvider } from "./suggestion-provider";
import { RunActionButtons } from "./components/RunActionButtons";
import { ReceipeList } from "./components/ReceipeList";
import { ProgressBar } from "./components/ProgressBar";
import { Palette } from "./components/Palette";
import { DropZone } from "./components/DropZone";
import { SearchInput } from './components/SearchInput';
import { Upload } from './components/Upload';
import { Autocomplete } from './components/Autocomplete';

export default function Home() {
  return (
    <ApplicationContextProvider>
      <SuggestionProvider>
        <div className="container">
          <header>
            <h1>Acrylic Mixing Bot</h1>
            <span className="button-subtitle"><a href="https://www.tensorflow.org/">Tensorflow</a> powered.</span>
            <p>Find a good mix for your target color.</p>
          </header>
          <div id="search" className="search-container">
            <div className="search-input-wrapper">
              <SearchInput />
              <Upload />
            </div>
            <Autocomplete />
          </div>
          <Palette />
          <section className="controls">
            <Colorpicker /><ProgressBar />
            <RunActionButtons />
          </section>
          <section className="controls">
            <div></div>
          </section>
          <DropZone>
            <ReceipeList />
          </DropZone>

        </div>
      </SuggestionProvider>
    </ApplicationContextProvider>
  );
}
