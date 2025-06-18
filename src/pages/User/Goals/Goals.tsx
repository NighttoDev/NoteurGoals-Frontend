import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import GoalCard from "../../../components/User/GoalCard";
import "../../../assets/css/User/goals.css";

const Goals = () => {
  const goals = [
    {
      title: "🚀 Launch New Mobile App",
      dueDate: "31/12/2024",
      progress: 75,
      status: "3/4 Milestones",
    },
    {
      title: "📈 Increase Q4 Revenue by 15%",
      dueDate: "30/11/2024",
      progress: 40,
      status: "In Progress",
    },
    {
      title: "🎨 Complete Website Redesign",
      dueDate: "15/10/2024",
      progress: 100,
      status: "Completed",
    },
    {
      title: "🧑‍🤝‍🧑 Onboard 5 New Team Members",
      dueDate: "20/12/2024",
      progress: 20,
      status: "1/5 Hired",
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Goals Overview</h1>
        <button className="primary-button">
          <FontAwesomeIcon icon={faPlus} /> Add New Goal
        </button>
      </div>

      <div className="goals-grid">
        {goals.map((goal, index) => (
          <GoalCard
            key={index}
            title={goal.title}
            dueDate={goal.dueDate}
            progress={goal.progress}
            status={goal.status}
          />
        ))}
      </div>
    </div>
  );
};

export default Goals;
