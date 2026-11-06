"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CircleHelp, Hand, LockKeyhole, ScanFace, Stars } from "lucide-react";
import { LanguageSelect } from "@/lib/locale";

type ScanMode = "face" | "palm";
type Point = { x: number; y: number };
type ScanResult = { mode: ScanMode; landmarks: number };
type LandmarkTask = { close: () => void };
type LandmarkResult = {
  faceLandmarks?: Point[][];
  handLandmarks?: Point[][];
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15],
  [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [17, 0],
];

export default function ScanLabPage() {
  const [mode, setMode] = useState<ScanMode>("palm");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const taskRef = useRef<LandmarkTask | null>(null);
  const animationRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);

  function stopScan() {
    scanningRef.current = false;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    taskRef.current?.close();
    taskRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  }

  useEffect(() => () => {
    scanningRef.current = false;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    taskRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function drawLandmarks(points: Point[], currentMode: ScanMode) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not create the local scan overlay.");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#ead0ff";
    context.fillStyle = "#fff8ff";
    context.lineWidth = Math.max(1.5, canvas.width / 360);

    if (currentMode === "palm") {
      for (const [from, to] of HAND_CONNECTIONS) {
        const start = points[from];
        const end = points[to];
        if (!start || !end) continue;
        context.beginPath();
        context.moveTo(start.x * canvas.width, start.y * canvas.height);
        context.lineTo(end.x * canvas.width, end.y * canvas.height);
        context.stroke();
      }
    }

    for (const point of points) {
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(1.5, canvas.width / 220), 0, Math.PI * 2);
      context.fill();
    }
  }

  async function startScan() {
    if (scanningRef.current || isLoading) return;
    setErrorMessage("");
    setScanResult(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Camera access is not available in this browser. Use a current browser on localhost or HTTPS.");
      return;
    }

    setIsLoading(true);
    try {
      const { FaceLandmarker, FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm",
      );
      const detector = mode === "face"
        ? await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/mediapipe/face_landmarker.task", delegate: "CPU" },
          runningMode: "VIDEO",
          numFaces: 1,
        })
        : await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/mediapipe/hand_landmarker.task", delegate: "CPU" },
          runningMode: "VIDEO",
          numHands: 1,
        });

      taskRef.current = detector;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: mode === "face" ? "user" : "environment", width: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("The camera preview could not be opened.");
      video.srcObject = stream;
      await video.play();

      scanningRef.current = true;
      lastVideoTimeRef.current = -1;
      setIsScanning(true);
      const detectFrame = () => {
        if (!scanningRef.current || !videoRef.current || !taskRef.current) return;
        const activeVideo = videoRef.current;
        if (activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          && activeVideo.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = activeVideo.currentTime;
          const result = (taskRef.current as typeof detector).detectForVideo(activeVideo, performance.now()) as LandmarkResult;
          const points = mode === "face" ? result.faceLandmarks?.[0] : result.handLandmarks?.[0];
          if (points?.length) {
            drawLandmarks(points, mode);
            setScanResult({ mode, landmarks: points.length });
            stopScan();
            return;
          }
        }
        animationRef.current = requestAnimationFrame(detectFrame);
      };
      animationRef.current = requestAnimationFrame(detectFrame);
    } catch (error) {
      stopScan();
      setErrorMessage(error instanceof Error
        ? `The on-device scan could not start: ${error.message}`
        : "The on-device scan could not start.");
    } finally {
      setIsLoading(false);
    }
  }

  const scanLabel = mode === "face" ? "face landmarks" : "hand landmarks";

  return (
    <main className="rashi-page chart-learning-page scan-lab-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> Back to your space
        </Link>
        <div className="rashi-header-actions">
          <Link className="rashi-brand" href="/"><Stars size={15} /> aster</Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="chart-learning-hero">
        <p className="rashi-kicker"><Stars size={13} /> ASTROPEDIA · ON-DEVICE SCAN LAB</p>
        <h1>Explore a scan, keep it yours.</h1>
        <p>
          Face and hand landmarks are detected in your browser. The camera feed
          is never uploaded or saved. This prototype does not infer character,
          health, or future events from images.
        </p>
      </section>

      <section className="scan-lab-layout" aria-label="On-device camera scan">
        <div className="scan-lab-controls">
          <div className="scan-mode-tabs" role="group" aria-label="Choose scan type">
            <button type="button" disabled={isLoading || isScanning} className={mode === "palm" ? "scan-mode-active" : ""} aria-pressed={mode === "palm"} onClick={() => { stopScan(); setMode("palm"); setScanResult(null); }}>
              <Hand size={16} /> Hand scan
            </button>
            <button type="button" disabled={isLoading || isScanning} className={mode === "face" ? "scan-mode-active" : ""} aria-pressed={mode === "face"} onClick={() => { stopScan(); setMode("face"); setScanResult(null); }}>
              <ScanFace size={16} /> Face scan
            </button>
          </div>
          <div className={`scan-camera-frame ${isScanning ? "scan-camera-live" : ""}`}>
            <video ref={videoRef} className={mode === "face" ? "scan-video scan-video-mirror" : "scan-video"} playsInline muted aria-label={`${mode} scan camera preview`} />
            <canvas ref={canvasRef} className={mode === "face" ? "scan-overlay scan-video-mirror" : "scan-overlay"} aria-hidden="true" />
            {!isScanning && (
              <div className="scan-camera-placeholder">
                <span>{mode === "face" ? <ScanFace size={32} /> : <Hand size={32} />}</span>
                <strong>{mode === "face" ? "Face framing" : "Palm framing"}</strong>
                <small>Camera starts only when you choose</small>
              </div>
            )}
            {isScanning && <span className="scan-status-pill"><i /> Detecting {scanLabel}</span>}
          </div>
          <div className="scan-actions">
            <button className="birth-chart-submit" type="button" onClick={() => void startScan()} disabled={isLoading || isScanning}>
              <Camera size={15} /> {isLoading ? "Loading on-device model…" : isScanning ? "Scanning…" : "Start local scan"}
            </button>
            {isScanning && <button className="scan-stop-button" type="button" onClick={stopScan}>Stop camera</button>}
          </div>
          {errorMessage && <p className="birth-chart-error" role="alert">{errorMessage}</p>}
        </div>

        <aside className="chart-concept-card scan-result-card" aria-live="polite">
          <p className="rashi-kicker"><CircleHelp size={13} /> {scanResult ? "LOCAL DETECTION" : "WHAT THIS SCAN DOES"}</p>
          {scanResult ? (
            <>
              <span className="chart-concept-symbol" aria-hidden="true">{scanResult.mode === "face" ? "◉" : "✋"}</span>
              <h2>{scanResult.mode === "face" ? "Face aligned" : "Hand detected"}</h2>
              <p>{scanResult.landmarks} landmarks were detected on-device to confirm framing. No image was retained.</p>
              <p>
                {scanResult.mode === "face"
                  ? "For a light, traditional-inspired reflection: what would you like to express more clearly?"
                  : "For a light, traditional-inspired reflection: which steady habit would you like to nurture?"}
                {" "}This prompt is general and was not inferred from your image.
              </p>
              <div className="chart-context-boundary">
                <strong>A reflection, not a reading</strong>
                <span>
                  {scanResult.mode === "face"
                    ? "What would you like to bring into clearer focus this week?"
                    : "What is one steady habit you would like to nurture?"}
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="chart-concept-symbol" aria-hidden="true"><LockKeyhole size={36} /></span>
              <h2>Private by design</h2>
              <p>
                MediaPipe checks face or hand landmarks locally. The palm model
                does not analyze palm creases, and the face model does not make
                personality or future predictions.
              </p>
              <div className="chart-context-boundary">
                <strong>No upload · no storage · no prediction</strong>
                <span>Only the MediaPipe runtime is fetched from jsDelivr; both landmark models and camera frames stay in this app/browser.</span>
              </div>
            </>
          )}
          {scanResult && (
            <button className="scan-reset-button" type="button" onClick={() => { setScanResult(null); if (canvasRef.current) canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }}>
              Clear result
            </button>
          )}
        </aside>
      </section>

      <p className="scan-lab-disclaimer">
        <LockKeyhole size={13} /> Camera permission is requested only after you press Start.
        No photo or video is written to a file or sent to a service. The
        MediaPipe runtime is fetched from jsDelivr; landmark models are served
        locally.
      </p>
      <footer className="rashi-footer chart-learning-footer">
        <span>Image scans are a framing demo, not a source of factual or predictive insight.</span>
        <span>Made by Grisha Lala</span>
      </footer>
    </main>
  );
}
