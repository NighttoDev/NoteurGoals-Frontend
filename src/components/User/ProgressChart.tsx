import React from "react";
import "../../assets/css/User/ProgressChart.css";

interface ProgressChartProps {
  progress: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ progress }) => {
  return (
    <div className="progress-chart">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">{progress}% Complete</div>
    </div>
  );
};

export default ProgressChart;
