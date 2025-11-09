import React, { useEffect, useRef, useState } from "react";

// SIMPLE SIGN → TEXT → VOICE (no Gemini / no backend)
const MODEL_URL = "/my_models/"; // model folder in public/

export default function SignToSpeech() {
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const webcamRef = useRef(null);
  const animationRef = useRef(null);
  const [liveLabel, setLiveLabel] = useState("");
  const [sentence, setSentence] = useState("");
  const lastAddedRef = useRef({ label: "", time: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Load teachable machine pose library
      if (!window.tmPose) {
        alert("Teachable Machine pose library not loaded. Add script in index.html");
        return;
      }

      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";
      modelRef.current = await window.tmPose.load(modelURL, metadataURL);
      const size = 300;
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

    async function loop() {
      if (!webcamRef.current || !modelRef.current) return;
      webcamRef.current.update();
      await predict();
      animationRef.current = requestAnimationFrame(loop);
    }

    async function predict() {
      const webcamCanvas = webcamRef.current.canvas;
      const { pose, posenetOutput } = await modelRef.current.estimatePose(webcamCanvas);
      const prediction = await modelRef.current.predict(posenetOutput);

      let top = { className: "", probability: 0 };
      for (let p of prediction) {
        if (p.probability > top.probability) top = p;
      }

      // Update live label
      setLiveLabel(`${top.className} (${top.probability.toFixed(2)})`);

      // Draw pose
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(webcamCanvas, 0, 0);
      if (pose) {
        const minPartConfidence = 0.5;
        window.tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        window.tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }

      // Append to sentence if confidence high
      const now = Date.now();
      if (top.probability > 0.75 && top.className.toLowerCase() !== "neutral") {
        if (lastAddedRef.current.label !== top.className || now - lastAddedRef.current.time > 1200) {
          setSentence((prev) => (prev ? prev + " " + top.className : top.className));
          lastAddedRef.current = { label: top.className, time: now };
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

  // Text to speech
  function speak(text) {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function resetSentence() {
    setSentence("");
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>🖐 Sign to Text & Voice</h2>
      <canvas ref={canvasRef} style={{ background: "#111", borderRadius: 10 }} />

      <div style={{ marginTop: 12 }}>
        <strong>Detected:</strong>
        <div style={{ background: "#222", padding: 8, borderRadius: 6 }}>{liveLabel}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Sentence:</strong>
        <div style={{ background: "#333", padding: 8, borderRadius: 6, minHeight: 50 }}>
          {sentence || "Start signing..."}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button onClick={() => speak(sentence)} disabled={!sentence || isSpeaking}>
          🔊 Speak
        </button>
        <button onClick={resetSentence}>Reset</button>
      </div>
    </div>
  );
}
