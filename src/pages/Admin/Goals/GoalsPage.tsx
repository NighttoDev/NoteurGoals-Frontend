import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import "../../../assets/css/Admin/goals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
}

const goalsData: Goal[] = Array(12)
  .fill(null)
  .map((_, index) => ({
    id: (index + 1).toString(),
    title: "Học TypeScript",
    description:
      "Học cơ bản và nâng cao TypeScript để áp dụng vào dự án Angular.",
    startDate: "01/05/2025",
    endDate: "31/05/2025",
    progress: 60,
    status: "Mới",
  }));

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [goals, setGoals] = useState<Goal[]>(goalsData);
  const [currentPage, setCurrentPage] = useState(1);
  const goalsPerPage = 6;

  // Lọc goals theo search query
  const filteredGoals = goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredGoals.length / goalsPerPage)
  );
  const indexOfLastGoal = currentPage * goalsPerPage;
  const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;
  const currentGoals = filteredGoals.slice(indexOfFirstGoal, indexOfLastGoal);

  // Chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  // Tạo mảng các trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  function getStatusClass(status: string) {
    switch (status) {
      case "Mới":
        return "new";
      case "Đang thực hiện":
        return "inprogress";
      case "Hoàn thành":
        return "completed";
      case "Hết hạn":
        return "expired";
      default:
        return "";
    }
  }

  return (
    <>
      <div className="goals-container">
        <div className="goals-content">
          {/* Header */}
          <header className="goals-header">
            <h1>Quản lý mục tiêu</h1>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm cuộc họp, bản ghi, v.v..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/goals/add" className="btn-add-goal">
              <i className="fas fa-plus"></i>
              <span>Thêm mục tiêu</span>
            </Link>
          </header>

          {/* Goals List */}
          <div className="goals-list">
            {currentGoals.map((goal) => (
              <Link
                style={{ textDecoration: "none" }}
                to={`/goals/detail/${goal.id}`}
              >
                <div className="goal-item" key={goal.id}>
                  <div className="goal-details">
                    <div className="goal-title-wrapper">
                      <h3>{goal.title}</h3>
                      <span
                        className={`goal-status ${getStatusClass(goal.status)}`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p>{goal.description}</p>
                    <div className="goal-meta">
                      {goal.startDate} - {goal.endDate}
                    </div>
                    <div className="goal-progress-label">
                      Tiến độ: {goal.progress}%
                    </div>
                    <div className="goal-progress-bar">
                      <div
                        className="goal-progress"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div
              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              onClick={goToFirstPage}
            >
              <i className="fas fa-angle-double-left"></i>
            </div>
            <div
              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              onClick={goToPrevPage}
            >
              <i className="fas fa-angle-left"></i>
            </div>

            {getPageNumbers()[0] > 1 && (
              <>
                <div
                  className={`page-number ${currentPage === 1 ? "active" : ""}`}
                  onClick={() => paginate(1)}
                >
                  1
                </div>
                {getPageNumbers()[0] > 2 && (
                  <div className="page-item disabled">...</div>
                )}
              </>
            )}

            {getPageNumbers().map((number) => (
              <div
                key={number}
                className={`page-number ${
                  currentPage === number ? "active" : ""
                }`}
                onClick={() => paginate(number)}
              >
                {number}
              </div>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] <
                  totalPages - 1 && (
                  <div className="page-item disabled">...</div>
                )}
                <div
                  className={`page-number ${
                    currentPage === totalPages ? "active" : ""
                  }`}
                  onClick={() => paginate(totalPages)}
                >
                  {totalPages}
                </div>
              </>
            )}

            <div
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={goToNextPage}
            >
              <i className="fas fa-angle-right"></i>
            </div>
            <div
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={goToLastPage}
            >
              <i className="fas fa-angle-double-right"></i>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default GoalsPage;
