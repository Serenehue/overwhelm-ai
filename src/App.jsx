import { useEffect, useRef, useState } from "react";
import "./index.css";

export default function App() {
  const TOTAL_TIME = 25 * 60;

  const [theme, setTheme] = useState("light");
  const [text, setText] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [checked, setChecked] = useState([false, false, false, false]);
  const [showDone, setShowDone] = useState(false);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const [steps, setSteps] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const breakItDown = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch("http://localhost:3001/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error("Backend error");
    }

    const data = await res.json();

    setSteps(data.steps);
    setChecked(new Array(data.steps.length).fill(false));
    setShowSteps(true);
  } catch (err) {
    console.error(err);
    setError("Could not connect to AI. Try again.");
  } finally {
    setLoading(false);
  }
};


  /* THEME */
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  /* DONE MESSAGE */
  useEffect(() => {
    if (checked.every(Boolean) && showSteps) {
      setShowDone(true);
    }
  }, [checked, showSteps]);

  /* TIMER */
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const startTimer = () => {
    if (timeLeft === 0) setTimeLeft(TOTAL_TIME);
    setRunning(true);
  };

  const resetEverything = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    setText("");
    setShowSteps(false);
    setChecked([false, false, false, false]);
    setShowDone(false);
    setTimeLeft(TOTAL_TIME);
    setRunning(false);
  };

  const formatTime = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="app">
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "Night 🌙" : "Day ☀️"}
      </button>

      <h1 className="title">Overwhelm</h1>
      <p className="subtitle">Turn mental overload into clear action.</p>
      <p className="helper">You don’t need clarity. Just start typing.</p>

      <textarea
        placeholder="What feels overwhelming right now?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

<button
  className="primary-btn"
  disabled={!text.trim() || loading}
  onClick={breakItDown}
>
  {loading ? "Thinking..." : "Break it down"}
</button>

      {showSteps && (
        <div className="card">
          <h2>Your next steps</h2>

          {steps.map((step, i) => (
            <label key={i} className="step">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() =>
                  setChecked((prev) =>
                    prev.map((v, idx) => (idx === i ? !v : v))
                  )
                }
              />
              <span className={checked[i] ? "done" : ""}>{step}</span>
            </label>
          ))}

          <div className="timer">
  <div className="timer-ring">
<svg width="160" height="160">
  <defs>
    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#c8f7e8" />
      <stop offset="100%" stopColor="#7de2c3" />
    </linearGradient>
  </defs>

  {/* background ring */}
  <circle
    className="ring-bg"
    cx="80"
    cy="80"
    r="70"
  />

  {/* progress ring */}
  <circle
    className="ring-progress"
    cx="80"
    cy="80"
    r="70"
    style={{
      stroke: "url(#progressGradient)",
      strokeDashoffset:
        440 - (timeLeft / TOTAL_TIME) * 440,
    }}
  />
</svg>



    <div className="timer-text">
      {formatTime(timeLeft)}
    </div>
  </div>

  <div className="timer-actions">
    <button className="primary-btn" onClick={startTimer}>
      Start 25 minutes
    </button>
  </div>
</div>


                   {showDone && (
            <div className="done-box" onClick={resetEverything}>
              You did enough for now 🫧
              <span>Tap to start fresh</span>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        Overwhelm • Designed & Developed by Swetha
      </footer>
    </div>
  );
}