import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Volume2, Hand, Square, Camera } from "lucide-react";
import { ParticipantCard } from "../components/ParticipantCard";
import { MessageDisplay } from "../components/MessageDisplay";
import { Button } from "../components/Button";

const BACKEND_URL = "http://localhost:8000/api/sign-to-speech/";

function SignToSpeech() {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [ttsUrl, setTtsUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const captureSign = async () => {
    setCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setProcessing(true);

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const form = new FormData();
    form.append("frame", blob, "capture.jpg");

    const res = await fetch(BACKEND_URL, { method: "POST", body: form });
    const data = await res.json();

    setDetectedText(data.text || "No sign detected");
    setTtsUrl(
      data.tts_audio_url ? `http://localhost:8000${data.tts_audio_url}` : null
    );

    setProcessing(false);
    setCapturing(false);
  };

  const resetAll = () => {
    setCapturedImage(null);
    setDetectedText("");
    setTtsUrl(null);
    setCapturing(false);
  };

  return (
    <div className="h-full">
      <div className="grid md:grid-cols-2 gap-6 mb-8 h-full ">
        <div className=" w-full h-full rounded-xl overflow-hidden  bg-neutral-800 flex items-center justify-center">
          {capturing ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className=" w-full h-full object-cover"
            />
          ) : (
            <ParticipantCard
              name="You (Sign)"
              icon={<Hand className="w-12 h-12 text-neutral-300" />}
              isAI={false}
              className="w-full h-full"
            />
          )}
        </div>

        <ParticipantCard
          name="Hearing User"
          icon={<Volume2 className="w-12 h-12 text-neutral-300" />}
          isAI={true}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Webcam */}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="mt-4">
            <img
              src={capturedImage}
              alt="Captured sign"
              className="rounded-xl shadow-md max-w-xs"
            />
          </div>
        )}

        {/* Detected Text */}
        {detectedText && <MessageDisplay message={detectedText} />}

        {/* TTS Output */}
        {ttsUrl && (
          <div className="mt-4">
            <audio controls src={ttsUrl}></audio>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="green"
            size="lg"
            onClick={captureSign}
            disabled={processing}
          >
            <Camera className="mr-2" />{" "}
            {processing ? "Processing..." : "Capture"}
          </Button>
          <Button variant="coral" size="lg" onClick={resetAll}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignToSpeech;
