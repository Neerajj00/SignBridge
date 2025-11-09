import { useState } from "react";
import { Hand, MicIcon, Square } from "lucide-react";
import { ParticipantCard } from "../components/ParticipantCard";
import { MessageDisplay } from "../components/MessageDisplay";
import { Button } from "../components/Button";
import { ASLGifDisplay } from "../components/ASLGifDisplay";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { GoogleGenAI } from "@google/genai";

const availableGifs = [
  "ANGRY", "BAD", "BYE", "COME-GO", "CONGRATULATIONS", "DAY", "DRINK", "EAT",
  "EXCITED", "FAMILY", "FRIEND", "GOOD-MORNING", "GOOD", "HAPPY", "HAVE", "HELLO",
  "HELP", "HUNGRY", "I-LOVE-YOU", "KNOW", "LATER", "LEARN", "LIKE", "MAYBE",
  "MORNING", "MY", "NEED", "NIGHT", "NO", "NOT-LIKE", "NOW", "PLAY", "PLEASE",
  "SAD", "SEE-YOU-LATER", "SEE", "SIT", "SLEEP", "SORRY", "STAND", "STOP", "SURPRISE",
  "THANKYOU", "TIRED", "TOMORROW", "UNDERSTAND", "WAIT", "WANT", "WE", "WELCOME",
  "WORK", "YES", "YOU", "YOUR",
];

function SpeechToSign() {
  const [finalText, setFinalText] = useState("");
  const [aslConcept, setAslConcept] = useState("");

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
    resetTranscript();
    setFinalText("");
    setAslConcept("");
    SpeechRecognition.startListening({ continuous: true, interimResults: true });
  };

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  async function fetchASLConcept(transcript) {
    const prompt = `
You are an ASL translation assistant.

Translate the following English phrase into one or more ASL gloss keywords.
ONLY use these available glosses:
${availableGifs.join(", ")}.
If a word isn't in the list, choose the closest concept.
Respond ONLY with the gloss keywords separated by spaces or dashes.

Sentence: "${transcript}"
`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const output = result.output_text || result.text;
      return output.trim().toUpperCase();
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
    SpeechRecognition.stopListening();
    resetTranscript();
    setFinalText("");
    setAslConcept("");

    if (listening) {
      setTimeout(() => SpeechRecognition.abortListening(), 200);
    }
  };

  return (
    <div className="h-full px-2 sm:px-4">
      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ParticipantCard
          name="You"
          icon={<MicIcon className="w-10 h-10 text-neutral-300" />}
          isAI={false}
          isSpeaking={listening}
        />

        {aslConcept ? (
          <ASLGifDisplay text={aslConcept} />
        ) : (
          <ParticipantCard
            name="Deaf User"
            icon={<Hand className="w-10 h-10 text-neutral-300" />}
            isAI={true}
          />
        )}
      </div>

      {/* Message Display */}
      <div className="flex flex-col items-center gap-4 text-center mt-6">
        {transcript && !finalText ? (
          <MessageDisplay message={transcript} />
        ) : finalText ? (
          <MessageDisplay message={finalText} />
        ) : (
          <MessageDisplay message="🎙️ Ready to go when you are..." />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Button
          variant="green"
          size="lg"
          onClick={startListening}
          disabled={listening}
          className={`${listening ? "opacity-50 cursor-not-allowed" : ""} w-full sm:w-auto`}
        >
          <MicIcon className="mr-2" /> Start
        </Button>

        <Button
          variant="yellow"
          size="lg"
          onClick={stopListening}
          disabled={!listening}
          className={`${!listening ? "opacity-50 cursor-not-allowed" : ""} w-full sm:w-auto`}
        >
          <Square className="mr-2" /> Stop
        </Button>

        <Button
          variant="coral"
          size="lg"
          onClick={reset}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

export default SpeechToSign;
