import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

/*
  Make sure you have:
  public/my_models/model.json
  public/my_models/metadata.json
  public/my_models/weights.bin
*/
const MODEL_URL = "/my_models/";

export default function SignToSpeech() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const modelRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const [liveLabel, setLiveLabel] = useState("");
  const [sentence, setSentence] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [processingGrammar, setProcessingGrammar] = useState(false);

  const lastAppendedRef = useRef({ label: null, time: 0 });

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";
      modelRef.current = await window.tmPose.load(modelURL, metadataURL);
      const maxPredictions = modelRef.current.getTotalClasses();

      const lbls = [];
      for (let i = 0; i < maxPredictions; i++) {
        lbls.push(
          modelRef.current.getClassMeta
            ? modelRef.current.getClassMeta(i)?.name ?? `class ${i}`
            : `class ${i}`
        );
      }
      if (!isMounted) return;
      setLabels(lbls);

      const size = 320;
      const flip = true;
      const webcam = new window.tmPose.Webcam(size, size, flip);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;

      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = size;

      animationRef.current = requestAnimationFrame(loop);
    }

    const PREDICT_INTERVAL = 500; // slow down to every 0.5 seconds
    let lastPredictTime = 0;

    async function loop() {
      const now = Date.now();
      if (!webcamRef.current || !modelRef.current) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      webcamRef.current.update();

      if (now - lastPredictTime > PREDICT_INTERVAL) {
        await predict();
        lastPredictTime = now;
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    async function predict() {
      const webcamCanvas = webcamRef.current.canvas;
      const { pose, posenetOutput } = await modelRef.current.estimatePose(webcamCanvas);
      const prediction = await modelRef.current.predict(posenetOutput);

      let top = { prob: 0, className: "" };
      for (let p of prediction) if (p.probability > top.prob) top = p;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(webcamCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
      if (pose) {
        const minPartConfidence = 0.5;
        window.tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        window.tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }

      const labelName = top.className || "";
      setLiveLabel(`${labelName} (${top.probability.toFixed(2)})`);

      const THRESH = 0.75;
      const now = Date.now();
      if (top.probability > THRESH && labelName && labelName.toLowerCase() !== "neutral") {
        const last = lastAppendedRef.current;
        if (last.label !== labelName || now - last.time > 1200) {
          setSentence((prev) => (prev ? prev + " " + labelName : labelName));
          lastAppendedRef.current = { label: labelName, time: now };
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (webcamRef.current) webcamRef.current.stop();
    };
  }, []);

  // 🗣️ Text-to-speech
  function speak(text) {
    if (!text) return;
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }
    const ut = new SpeechSynthesisUtterance(text);
    ut.onstart = () => setIsSpeaking(true);
    ut.onend = () => setIsSpeaking(false);
    ut.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ut);
  }

  // Reset sentence
  function resetSentence() {
    setSentence("");
  }

  // Grammar correction (Gemini)
  async function correctGrammar() {
    if (!sentence) return;
    setProcessingGrammar(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_KEY;
      const endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const body = {
        contents: [
          {
            parts: [
              {
                text: `Correct grammar, punctuation, and capitalization of this sentence, keeping meaning same:\n"${sentence}"\nCorrected:`,
              },
            ],
          },
        ],
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const corrected = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || sentence;
      setSentence(corrected);
    } catch (err) {
      console.error("Gemini correction error:", err);
      alert("Gemini correction failed. Check console for details.");
    } finally {
      setProcessingGrammar(false);
    }
  }

  return (
    <div className="sign-to-speech">
      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <video
            style={{ width: 320, height: 320, transform: "scaleX(-1)" }}
            ref={(el) => {
              if (!el) return;
              if (webcamRef.current && webcamRef.current.webcam && webcamRef.current.webcam.video) {
                el.srcObject =
                  webcamRef.current.webcam.video.srcObject ||
                  webcamRef.current.webcam.video.src;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            muted
          />
          <canvas ref={canvasRef} style={{ marginTop: 8 }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Live label:</strong>
            <div style={{ padding: 8, background: "#111", color: "#fff", borderRadius: 6 }}>
              {liveLabel}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Sentence:</strong>
            <div
              style={{
                padding: 8,
                minHeight: 60,
                borderRadius: 6,
                background: "#0b0b0b",
                color: "#fff",
              }}
            >
              {sentence || <span style={{ opacity: 0.6 }}>Start signing...</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => speak(sentence)} disabled={!sentence || isSpeaking}>
              {isSpeaking ? "Speaking..." : "Speak"}
            </button>
            <button onClick={correctGrammar} disabled={!sentence || processingGrammar}>
              {processingGrammar ? "Checking..." : "Correct Grammar (Gemini)"}
            </button>
            <button onClick={resetSentence}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
