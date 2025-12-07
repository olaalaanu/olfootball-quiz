import React, { useState } from "react";
import "./styles/Result.css";

const LEADERBOARD_KEY = "football_quiz_leaderboard";

function readLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLeaderboard(entry) {
  const board = readLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score || a.time - b.time);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 20)));
}

export default function Result({ score, total, onRestart, durationSeconds }) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  // Lazy initialize leaderboard state
  const [board, setBoard] = useState(() => readLeaderboard());

  const highScore = board.length ? board[0].score : null;

  function handleSave() {
    if (!name.trim()) return;

    const entry = {
      name: name.trim(),
      score,
      time: durationSeconds || 0,
      date: new Date().toISOString(),
    };

    // Save to localStorage
    saveToLeaderboard(entry);

    // Update state directly — no effect needed
    setBoard(readLeaderboard());
    setSaved(true);
  }

  return (
    <div className="result-card fade-in">
      <h2>🎉 Quiz Completed!</h2>

      <p className="result-summary">
        You scored <strong>{score}</strong> out of <strong>{total}</strong>
      </p>

      <div className="highscore-row">
        <div>
          <div className="mini">Your Time</div>
          <div className="big">{durationSeconds}s</div>
        </div>
        <div>
          <div className="mini">All-time High</div>
          <div className="big">{highScore ?? "—"}</div>
        </div>
      </div>

      {!saved ? (
        <div className="save-row">
          <input
            className="name-input"
            placeholder="Enter a name for the leaderboard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Score
          </button>
        </div>
      ) : (
        <p className="saved-note">Saved! Check the leaderboard below.</p>
      )}

      <div className="actions">
        <button className="play-again" onClick={onRestart}>
          Play Again
        </button>
      </div>

      <div className="leaderboard">
        <h3>🏆 Leaderboard</h3>

        {board.length === 0 ? (
          <p className="muted">No scores yet — be the first!</p>
        ) : (
          <ol className="board-list">
            {board.slice(0, 8).map((row, idx) => (
              <li key={idx} className={idx === 0 ? "top" : ""}>
                <span className="pos">{idx + 1}.</span>
                <span className="player">{row.name}</span>
                <span className="score">{row.score}</span>
                <span className="t">{row.time}s</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
