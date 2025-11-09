import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

/*
  Requires:
  - <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>
    OR import via package if you installed it (this example uses the global `tmPose` added by that script).
  - Your model folder accessible from the client: e.g. public/my_model/
*/

const MODEL_URL = "/my_model/"; // adjust if needed (matching your original: "./my_model/")

export default function SignToSpeech() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const modelRef = useRef(null);
  const [labels, setLabels] = useState([]);       // class labels
  const [liveLabel, setLiveLabel] = useState(""); // top live label text
  const [sentence, setSentence] = useState("");   // assembled sentence
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [processingGrammar, setProcessingGrammar] = useState(false);

  // control repeated predictions (simple debounce)
  const lastAppendedRef = useRef({ label: null, time: 0 });

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // load model
      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";
      modelRef.current = await window.tmPose.load(modelURL, metadataURL);
      const maxPredictions = modelRef.current.getTotalClasses();
      // read labels
      const lbls = [];
      for (let i = 0; i < maxPredictions; i++) {
        lbls.push(modelRef.current.getClassMeta ? modelRef.current.getClassMeta(i)?.name ?? `class ${i}` : `class ${i}`);
      }
      if (!isMounted) return;
      setLabels(lbls);

      // setup webcam
      const size = 320;
      const flip = true;
      const webcam = new window.tmPose.Webcam(size, size, flip);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;

      // set canvas size
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = size;

      // start loop
      animationRef.current = requestAnimationFrame(loop);
    }

    async function loop() {
      if (!webcamRef.current || !modelRef.current) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      webcamRef.current.update();
      await predict();
      animationRef.current = requestAnimationFrame(loop);
    }

    async function predict() {
      const webcamCanvas = webcamRef.current.canvas;
      const { pose, posenetOutput } = await modelRef.current.estimatePose(webcamCanvas);
      const prediction = await modelRef.current.predict(posenetOutput);

      // find top prediction
      let top = {prob: 0, className: ""};
      for (let p of prediction) {
        if (p.probability > top.prob) {
          top = p;
        }
      }

      // draw webcam + pose on canvas
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(webcamCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
      if (pose) {
        const minPartConfidence = 0.5;
        window.tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        window.tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }

      // update live label
      const labelName = top.className || "";
      setLiveLabel(`${labelName} (${top.probability.toFixed(2)})`);

      // simple logic: if top.probability > threshold and label is not "neutral", append to sentence
      const THRESH = 0.75;
      const now = Date.now();
      if (top.probability > THRESH && labelName && labelName.toLowerCase() !== "neutral") {
        const last = lastAppendedRef.current;
        // avoid adding same label within 1200ms
        if (last.label !== labelName || (now - last.time) > 1200) {
          // append with a space
          setSentence(prev => (prev ? prev + " " + labelName : labelName));
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

  // speak the sentence (browser TTS)
  function speak(text) {
    if (!text) return;
    if (!("speechSynthesis" in window)) {
      alert("TTS not supported in this browser.");
      return;
    }
    const ut = new SpeechSynthesisUtterance(text);
    ut.onstart = () => setIsSpeaking(true);
    ut.onend = () => setIsSpeaking(false);
    // optionally set voice/rate/pitch:
    ut.rate = 1.0;
    window.speechSynthesis.cancel(); // cancel any previous
    window.speechSynthesis.speak(ut);
  }

  // clear sentence
  function resetSentence() {
    setSentence("");
  }

  // request grammar correction on the backend (backend calls Gemini / PaLM)
  async function correctGrammar() {
  if (!sentence) return;
  setProcessingGrammar(true);
  try {
    const apiKey = import.meta.env.VITE_GEMINI_KEY; // or process.env.REACT_APP_GEMINI_API_KEY if CRA
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const body = {
      contents: [
        {
          parts: [
            {
              text: `Correct the grammar, punctuation, and capitalization of the following sentence. Keep meaning the same.\n\nSentence: "${sentence}"\n\nCorrected:`
            }
          ]
        }
      ]
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    // Extract corrected text
    const corrected =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || sentence;
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
              // attach webcam video element to the tmPose webcam's internal video
              if (!el) return;
              if (webcamRef.current && webcamRef.current.webcam && webcamRef.current.webcam.video) {
                el.srcObject = webcamRef.current.webcam.video.srcObject || webcamRef.current.webcam.video.src;
                el.play().catch(()=>{});
              } else if (webcamRef.current && webcamRef.current.canvas) {
                // fallback: draw canvas into video-like element not critical
              }
            }}
            autoPlay
            muted
          />
          <canvas ref={canvasRef} style={{ position: "relative", left: 0, top: 0, marginTop: 8 }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Live label:</strong>
            <div style={{ padding: 8, background: "#111", color: "#fff", borderRadius: 6, marginTop: 6 }}>
              {liveLabel}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Assembled sentence:</strong>
            <div style={{ padding: 8, minHeight: 60, borderRadius: 6, background: "#0b0b0b", color: "#fff", marginTop: 6 }}>
              {sentence || <span style={{opacity:0.6}}>No words yet (show signs)</span>}
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

          <div style={{ marginTop: 12, color: "#888" }}>
            Tip: adjust threshold/cooldown in the code for fewer duplicates. Also consider mapping labels
            to lowercased words or a dictionary for punctuation.
          </div>
        </div>
      </div>
    </div>
  );
}
