import { useState } from "react";
import { Header } from "./components/Header";
import SpeechToSign from './pages/SpeechToSign';
import SignToSpeech from "./pages/SignToSpeech";

const App = () => {
  const [mode, setMode] = useState("speech2sign"); // speech2sign | sign2speech

  const toggleMode = () => {
    setMode((prev) => (prev === "speech2sign" ? "sign2speech" : "speech2sign"));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Header />

      <main className="h-full max-w-6xl mx-auto px-6 py-8">
        <div className="bg-pink-500 flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">
            {mode === "speech2sign" ? "Speech 2 Sign" : "Sign 2 Speech"}
          </h1>

          {/* Toggle Button */}
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600 transition"
          >
            Switch to {mode === "speech2sign" ? "Sign 2 Speech" : "Speech 2 Sign"}
          </button>
        </div>

        {/* Render Based on Mode */}
        <div className="h-full bg-slate-500 w-full">
        {mode === "speech2sign" ? <SpeechToSign /> : <SignToSpeech />}

        </div>
      </main>
    </div>
  );
};

export default App;
