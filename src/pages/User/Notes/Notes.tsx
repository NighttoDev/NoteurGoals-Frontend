import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaTableCells, FaList } from "react-icons/fa6";
import "../../../assets/css/User/notes.css";

const Notes = () => {
  return (
    <main className="project-board">
      {/* Board Header */}
      <div className="board-header">
        <div className="view-toggle">
          <button className="toggle-btn active">
            <FaTableCells /> TABLE
          </button>
          <button className="toggle-btn">
            <FaList /> LIST VIEW
          </button>
        </div>
        <h1 className="project-title">My Notes</h1>
        <button className="create-task-btn">
          <AiOutlinePlus /> CREATE NOTE
        </button>
      </div>

      {/* Board Columns */}
      <div className="board-columns">
        {/* To Do Column */}
        <BoardColumn
          title="To Do"
          count={2}
          status="todo"
          cards={[
            {
              title: "Review and Finalize Project Proposal",
              tags: ["Review"],
              description:
                "Please review the attached project proposal draft. Focus on clarity, completeness...",
              attachments: 3,
              comments: 5,
              assignees: [5, 6, 7],
            },
            {
              title: "Develop New Feature - User Dashboard",
              description:
                "Begin development of the new user dashboard module.",
              attachments: 1,
              assignees: [8],
            },
          ]}
        />

        {/* Other columns similar structure... */}
      </div>
    </main>
  );
};

// BoardColumn Component
const BoardColumn = ({ title, count, status, cards }) => {
  return (
    <div className={`board-column column-${status}`}>
      <div className="column-header">
        <span className={`status-dot ${status}`}></span>
        <h2>{title}</h2>
        <span className="task-count">{count}</span>
      </div>
      <div className="task-cards">
        {cards.map((card, index) => (
          <TaskCard key={index} {...card} />
        ))}
      </div>
      <button className="add-card-btn">
        <AiOutlinePlus /> Add a card
      </button>
    </div>
  );
};

// TaskCard Component
const TaskCard = ({
  title,
  tags,
  description,
  attachments,
  comments,
  assignees,
}) => {
  return (
    <div className="task-card">
      <div className="card-header">
        <h3>{title}</h3>
        <i className="fa-solid fa-ellipsis"></i>
      </div>
      {tags && (
        <div className="card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag tag-design">
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="card-description">{description}</p>
      <div className="card-footer">
        <div className="card-icons">
          {attachments && (
            <>
              <i className="fa-solid fa-paperclip"></i>
              <span>{attachments}</span>
            </>
          )}
          {comments && (
            <>
              <i className="fa-regular fa-message"></i>
              <span>{comments}</span>
            </>
          )}
        </div>
        <div className="card-assignees">
          {assignees?.map((id) => (
            <img
              key={id}
              src={`https://i.pravatar.cc/40?img=${id}`}
              alt={`User ${id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;
