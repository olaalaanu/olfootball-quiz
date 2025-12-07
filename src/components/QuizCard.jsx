import "./styles/QuizCard.css";

export default function QuizCard({
  question,
  options,
  onAnswer,
  selected,
  correctAnswer,
  timer,
}) {
  return (
    <div className="quiz-card fade-in">
      <div className="quiz-top">
        <h2 className="question">{question}</h2>
        <div className="timer-pill" role="status" aria-live="polite">
          ⏳ {timer}s
        </div>
      </div>

      <div className="options">
        {options.map((opt) => {
          const isCorrect = selected && opt === correctAnswer;
          const isWrong = selected && selected === opt && opt !== correctAnswer;

          return (
            <button
              key={opt}
              className={`option-btn ${isCorrect ? "correct bounce" : ""} ${
                isWrong ? "wrong shake" : ""
              }`}
              onClick={() => onAnswer(opt)}
              disabled={!!selected}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
