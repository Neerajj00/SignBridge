import { useState } from "react";
import { Header } from "./components/Header";
import SpeechToSign from "./pages/SpeechToSign";
import SignToSpeech from "./pages/SignToSpeech";

const App = () => {
  const [mode, setMode] = useState("speech2sign"); // speech2sign | sign2speech

  const toggleMode = () => {
    setMode((prev) => (prev === "speech2sign" ? "sign2speech" : "speech2sign"));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-center sm:text-left">
            {mode === "speech2sign" ? "Speech → Sign" : "Sign → Speech"}
          </h1>

          {/* Toggle Button */}
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600 transition w-full sm:w-auto"
          >
            Switch to{" "}
            {mode === "speech2sign" ? "Sign → Speech" : "Speech → Sign"}
          </button>
        </div>

        {/* Render Based on Mode */}
        <div className="w-full">
          {mode === "speech2sign" ? <SpeechToSign /> : <SignToSpeech />}
        </div>
      </main>
    </div>
  );
};

export default App;
