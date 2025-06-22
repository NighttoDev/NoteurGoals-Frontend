import React from "react";

const GoalCard = ({ title, dueDate, progress, status }) => {
  const getProgressColor = () => {
    if (progress === 100) return "var(--green)";
    if (progress < 30) return "var(--red)";
    return "var(--blue)";
  };

  return (
    <div className="goal-card">
      <h3>{title}</h3>
      <p className="goal-meta">Due Date: {dueDate}</p>
      <div className="goal-progress">
        <div
          className="goal-progress-fill"
          style={{
            width: `${progress}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </div>
      <div className="goal-footer">
        <span>{status}</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};

export default GoalCard;
