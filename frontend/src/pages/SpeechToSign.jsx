import { useState } from "react";
import { Hand, MicIcon, Square } from "lucide-react";

import { ParticipantCard } from "../components/ParticipantCard";
import { MessageDisplay } from "../components/MessageDisplay";
import { Button } from "../components/Button";

import { ASLGifDisplay } from "../components/ASLGifDisplay";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { GoogleGenAI } from "@google/genai";
function SpeechToSign() {
  const [finalText, setFinalText] = useState("");
  const [aslConcept, setAslConcept] = useState("");
  // const [ttsUrl, setTtsUrl] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <span className="text-red-400">
        Browser doesn&apos;t support Speech Recognition.
      </span>
    );
  }

  const startListening = () => {
    // Reset everything before starting a new session
  resetTranscript();
  setFinalText("");
  setAslConcept("");
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
    });
  };

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;

  // Create Gemini client
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  async function fetchASLConcept(transcript) {
    const prompt = `
    You are an ASL translation assistant.
    Convert this English sentence into a single ASL gloss or concept word.
    Example:
    "I am hungry" -> HUNGRY
    "Good morning" -> GOOD-MORNING
    "How are you" -> HOW-YOU
    Sentence: "${transcript}"
  `;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      // Depending on SDK version, result.text or result.output_text may apply
      const output = result.output_text || result.text;
      return output.trim().toLowerCase();
    } catch (err) {
      console.error("Gemini error:", err);
      return null;
    }
  }

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    const cleanedTranscript = transcript.trim();
    if (!cleanedTranscript) return;

    resetTranscript();
    setFinalText(cleanedTranscript);

    const concept = await fetchASLConcept(cleanedTranscript);
    setAslConcept(concept);
  };

  const reset = () => {
    // Stop speech recognition if it’s still running
    SpeechRecognition.stopListening();

    // Clear everything
    resetTranscript();
    setFinalText("");
    setAslConcept("");

    // Force listening state reset visually (optional)
    if (listening) {
      setTimeout(() => {
        SpeechRecognition.abortListening();
      }, 200);
    }
  };

  console.log("Transcript:", transcript);
  console.log("AslConcept:", aslConcept);

  return (
    <div className="h-full">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ParticipantCard
          name="You"
          icon={<MicIcon className="w-12 h-12 text-neutral-300" />}
          isAI={false}
          isSpeaking={listening}
        />
        <ParticipantCard
          name="Deaf User"
          icon={<Hand className="w-12 h-12 text-neutral-300" />}
          isAI={true}
        />
      </div>

      {/* Results */}
      <div className="flex flex-col items-center gap-4 mt-8">
        {transcript && finalText === "" ? (
          <MessageDisplay message={transcript} />
        ) : finalText ? (
          <MessageDisplay message={finalText} />
        ) : (
          <MessageDisplay message="🎙️ Ready to go when you are..." />
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="green"
          size="lg"
          onClick={startListening}
          disabled={listening}
          className={listening ? "opacity-50 cursor-not-allowed" : ""}
        >
          <MicIcon className="mr-2" /> Start
        </Button>

        <Button
          variant="yellow"
          size="lg"
          onClick={stopListening}
          disabled={!listening}
          className={!listening ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Square className="mr-2" /> Stop
        </Button>

        <Button variant="coral" size="lg" onClick={() => reset()}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default SpeechToSign;
