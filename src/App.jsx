import { useState, useEffect, useRef } from "react";
import { questions } from "./data";
import QuizCard from "./components/QuizCard";
import Result from "./components/Result";
import "./index.css";
import { playCorrect, playWrong, playTimeout } from "./utils/sound";

const DEFAULT_TIME = 10;
const LEADERBOARD_KEY = "football_quiz_leaderboard";

function readLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [step, setStep] = useState("category");
  const [category, setCategory] = useState(null);

  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const [timer, setTimer] = useState(DEFAULT_TIME);
  const [totalDuration, setTotalDuration] = useState(0); // accumulate seconds for speed tiebreak
  const timerRef = useRef(null);
  const runningRef = useRef(false);

  const categories = [
    "Players",
    "Clubs",
    "World Cup",
    "Stadiums",
    "Chelsea",
    "Barcelona",
    "Arsenal",
    "Liverpool",
    "Manchester City",
    "Manchester United",
  ];

  function startQuiz() {
    const filtered = questions.filter((q) => q.category === category);
    // shuffle filtered questions for variety
    const shuffled = filtered.slice().sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    setStep("quiz");
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setTimer(DEFAULT_TIME);
    setTotalDuration(0);
  }

  // timer tick
  useEffect(() => {
    if (step !== "quiz") return;
    if (runningRef.current) return; // avoid double interval
    runningRef.current = true;

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // timeout: apply auto answer
          setTotalDuration((d) => d + 1);
          // call answer with special marker
          handleAnswer("TIME_UP");
          return DEFAULT_TIME;
        }
        setTotalDuration((d) => d + 1);
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      runningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, current, filteredQuestions]);

  // if questions change reset timer
  useEffect(() => {
    setTimer(DEFAULT_TIME);
  }, [current]);

  const question = filteredQuestions[current];

  function handleAnswer(option) {
    // guard
    if (!question) return;
    if (selected) return; // already answered this question

    setSelected(option);

    if (option === question.answer) {
      setScore((s) => s + 1);
      playCorrect();
    } else if (option === "TIME_UP") {
      // timeout sound
      playTimeout();
    } else {
      playWrong();
    }

    // short delay then move to next
    setTimeout(() => {
      const next = current + 1;
      if (next < filteredQuestions.length) {
        setCurrent(next);
        setSelected(null);
        setTimer(DEFAULT_TIME);
      } else {
        // finish
        clearInterval(timerRef.current);
        runningRef.current = false;
        setStep("result");
      }
    }, 900);
  }

  function restartQuiz() {
    setStep("category");
    setCategory(null);
    setFilteredQuestions([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setTimer(DEFAULT_TIME);
    setTotalDuration(0);
  }

  // derived all-time high score
  const board = readLeaderboard();
  const highScore = board.length ? board[0].score : null;

  return (
    <div className="app">
      <header className="app-header fade-in">
        <h1>⚽ Football Quiz</h1>
        <p className="subtitle">Fast, fun football trivia — beat the clock!</p>
      </header>

      {/* CATEGORY */}
      {step === "category" && (
        <div className="panel fade-in">
          <h2 className="text">
            Select Clubs, League, Countries or Competition
          </h2>
          <div className="menu-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`menu-btn ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="meta-row">
            <span>Selected: {category ?? "—"}</span>
            {highScore !== null && <span>All-time High: {highScore}</span>}
          </div>
          <div className="panel-actions">
            <button
              className="next-btn"
              disabled={!category}
              onClick={startQuiz}
            >
              Start Quiz →
            </button>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {step === "quiz" && question && (
        <div className="panel quiz-panel fade-in">
          <div className="quiz-meta">
            <div>
              Question {current + 1} / {filteredQuestions.length}
            </div>
            <div className="score-pill">Score: {score}</div>
          </div>

          <QuizCard
            question={question.question}
            options={question.options}
            selected={selected}
            correctAnswer={question.answer}
            onAnswer={handleAnswer}
            timer={timer}
          />
        </div>
      )}

      {/* RESULT */}
      {step === "result" && (
        <div className="panel fade-in">
          <Result
            score={score}
            total={filteredQuestions.length}
            onRestart={restartQuiz}
            durationSeconds={totalDuration}
          />
        </div>
      )}

      <footer className="app-footer">
        <small>
          Built with React + Vite by Lateef Ismaila Good luck — and have fun!
        </small>
      </footer>
    </div>
  );
}
