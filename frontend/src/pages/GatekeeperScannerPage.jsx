import { useCallback, useState } from "react";
import { api } from "../services/api";
import CameraScanner from "../components/gate/CameraScanner";
import ScanResultCard from "../components/gate/ScanResultCard";

const RESULT_BADGE = {
  VALID: "badge-success",
  ALREADY_USED: "badge-neutral",
  CANCELLED: "badge-danger",
  INVALID: "badge-danger",
};

export default function GatekeeperScannerPage() {
  const [cameraOn, setCameraOn] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  // Client-side history of this session's scans - there's no per-gatekeeper
  // backend log endpoint yet, so this just keeps the last few results
  // visible without needing to add one.
  const [recentScans, setRecentScans] = useState([]);

  const handleDecode = useCallback(async (token) => {
    try {
      const data = await api.validatePass(token);
      setResult(data);
      setError("");
      setRecentScans((prev) => [{ ...data, scannedAt: new Date().toISOString() }, ...prev].slice(0, 8));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await handleDecode(manualToken.trim());
    setManualToken("");
  }

  return (
    <div className="content-max">
      <div className="page-header">
        <h1>Gate scanner</h1>
        <button className="btn btn-verify" onClick={() => setCameraOn((v) => !v)}>
          {cameraOn ? "Stop camera" : "Start camera"}
        </button>
      </div>

      <div className="scanner-layout">
        <div className="stack">
          {cameraOn ? (
            <CameraScanner active={cameraOn} onDecode={handleDecode} />
          ) : (
            <div className="glass-card empty-state">Camera is off. Start it, or paste a pass token below.</div>
          )}

          <form className="glass-card form" onSubmit={handleManualSubmit}>
            <div className="field">
              <label htmlFor="manual">Manual entry (paste the QR's raw text)</label>
              <input
                id="manual"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="eyJhbGciOi..."
              />
            </div>
            <button className="btn btn-ghost btn-block">Validate</button>
          </form>

          {recentScans.length > 0 && (
            <div className="glass-card">
              <h4 style={{ marginBottom: 8 }}>Recent scans</h4>
              <div className="stack" style={{ gap: 0 }}>
                {recentScans.map((scan, i) => (
                  <div key={i} className="recent-scan-item">
                    <span>{scan.attendee?.name || "Unknown pass"}</span>
                    <span className="row" style={{ gap: 8 }}>
                      <span className={`badge ${RESULT_BADGE[scan.result] || "badge-neutral"}`}>{scan.result}</span>
                      <span className="text-muted">{new Date(scan.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <ScanResultCard result={result} />
        </div>
      </div>
    </div>
  );
}
