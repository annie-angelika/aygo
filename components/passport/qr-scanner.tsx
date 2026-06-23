"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { LuLoaderCircle, LuCameraOff } from "react-icons/lu";

/**
 * A real QR scanner: opens the device camera (rear-facing where available),
 * reads frames into a canvas and decodes them with jsQR. Calls `onScan` with the
 * decoded text the moment a code is found. Handles permission/no-camera errors
 * with a retry. Cleans up the stream on unmount.
 */
export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest callback without restarting the camera each render.
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  });

  const [status, setStatus] = useState<"loading" | "scanning" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (cancelled || !video || !canvas) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = (canvas.width = video.videoWidth);
        const h = (canvas.height = video.videoHeight);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx && w && h) {
          ctx.drawImage(video, 0, 0, w, h);
          const { data } = ctx.getImageData(0, 0, w, h);
          const code = jsQR(data, w, h, { inversionAttempts: "dontInvert" });
          if (code?.data) {
            onScanRef.current(code.data);
            return;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");
        raf = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [attempt]);

  const retry = () => {
    setStatus("loading");
    setAttempt((a) => a + 1);
  };

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900">
      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 size-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-white/80">
          <LuLoaderCircle className="size-6 animate-spin" aria-hidden />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center gap-2 p-4 text-center">
          <LuCameraOff className="size-7 text-white/80" aria-hidden />
          <p className="text-[12.5px] font-medium text-white/90">
            Can&apos;t reach the camera
          </p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-white/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/25"
          >
            Try again
          </button>
        </div>
      )}

      {status === "scanning" && (
        <>
          {/* Corner brackets framing the scan area. */}
          {[
            "left-3 top-3 border-l-2 border-t-2",
            "right-3 top-3 border-r-2 border-t-2",
            "left-3 bottom-3 border-l-2 border-b-2",
            "right-3 bottom-3 border-r-2 border-b-2",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute size-7 rounded-[3px] border-amber-400 ${pos}`}
            />
          ))}
          <span
            aria-hidden
            className="absolute inset-x-6 h-0.5 rounded bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.6)] animate-[aygo-scan_1.8s_ease-in-out_infinite] motion-reduce:hidden"
          />
        </>
      )}
    </div>
  );
}
