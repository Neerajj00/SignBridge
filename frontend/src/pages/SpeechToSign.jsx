import { useState } from "react";
import { Hand, MicIcon, Square } from "lucide-react";

import { ParticipantCard } from '../components/ParticipantCard';
import { MessageDisplay } from '../components/MessageDisplay';
import { Button } from '../components/Button';


import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";


function SpeechToSign() {
  const [finalText, setFinalText] = useState("")
  const [signUrl, setSignUrl] = useState(null);
  const [ttsUrl, setTtsUrl] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <span className="text-red-400">
        Browser doesn't support Speech Recognition.
      </span>
    );
  }

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
    });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();

    const cleanedTranscript = transcript.trim();
    if (!cleanedTranscript) return;

    const form = new FormData();
    form.append("transcript", cleanedTranscript);

    const res = await fetch(BACKEND_URL, { method: "POST", body: form });
    const data = await res.json();

    setFinalText(data.cleaned_text);
    setSignUrl(
      data.sign_video_url ? `http://localhost:8000${data.sign_video_url}` : null
    );
    setTtsUrl(
      data.tts_audio_url ? `http://localhost:8000${data.tts_audio_url}` : null
    );

    resetTranscript();
  };
  return (
    <div className="h-full">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ParticipantCard
          name="You"
          icon={<MicIcon className="w-12 h-12 text-neutral-300" />}
          isAI={false}
        />
        <ParticipantCard
          name="Deaf User"
          icon={<Hand className="w-12 h-12 text-neutral-300" />}
          isAI={true}
        />
      </div>


      {/* Sign Video */}
      {signUrl && (
        <div className="mt-6 flex justify-center">
          <video src={signUrl} autoPlay loop className="rounded-lg max-w-md" />
        </div>
      )}

      {/* TTS Audio */}
      {ttsUrl && (
        <div className="mt-4 flex justify-center">
          <audio controls src={ttsUrl}></audio>
        </div>
      )}

      {/* Control Section */}
      <div className="flex flex-col items-center gap-4 mt-8">
        {listening && (
          <div className="flex items-center gap-2 text-yellow-300 animate-pulse">
            <MicIcon className="w-5 h-5" />
            <span>Listening...</span>
          </div>
        )}

        <div className="flex gap-4">
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

          <Button variant="coral" size="lg" onClick={resetTranscript}>
            Reset
          </Button>
        </div>
      {/* Live Transcript */}
      {transcript && <MessageDisplay message={transcript} />}
    
      {/* Final Response */}
      {finalText && <MessageDisplay message={finalText} />}
      </div>
    </div>
  );
}

export default SpeechToSign;
