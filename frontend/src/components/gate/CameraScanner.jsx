import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const ELEMENT_ID = "campuspass-camera-scanner";

/**
 * Wraps html5-qrcode. Calls onDecode(text) once per successful scan
 * and pauses briefly afterwards so the same code isn't re-fired
 * dozens of times a second while it's still in frame.
 */
export default function CameraScanner({ onDecode, active }) {
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Function form so the scan box scales with the actual camera
          // viewfinder instead of a fixed 240px square - on a narrow phone
          // screen a fixed box can be wider than the preview itself.
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
            const size = Math.max(180, Math.min(edge, 280));
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          if (busyRef.current) return;
          busyRef.current = true;
          onDecode(decodedText);
          setTimeout(() => (busyRef.current = false), 1500);
        },
        () => {} // ignore per-frame "no QR found" noise
      )
      .catch((err) => console.error("Could not start camera:", err));

    return () => {
      scanner.stop().catch(() => {}).finally(() => scanner.clear());
    };
  }, [active, onDecode]);

  return (
    <div className="glass-card">
      <div id={ELEMENT_ID} style={{ borderRadius: 12, overflow: "hidden" }} />
    </div>
  );
}
