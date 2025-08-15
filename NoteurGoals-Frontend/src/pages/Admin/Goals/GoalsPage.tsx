import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

interface Goal {
  goal_id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const goalsData: Goal[] = Array(30)
  .fill(null)
  .map((_, index) => ({
    goal_id: (index + 1).toString(),
    user_id: "U" + (index + 1),
    title: "Học TypeScript",
    description:
      "Học cơ bản và nâng cao TypeScript để áp dụng vào dự án Angular.",
    start_date: "01/05/2025",
    end_date: "31/05/2025",
    status:
      index % 4 === 0
        ? "Mới"
        : index % 4 === 1
        ? "Đang thực hiện"
        : index % 4 === 2
        ? "Hoàn thành"
        : "Hết hạn",
    created_at: "01/05/2025",
    updated_at: "15/05/2025",
  }));

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [goals] = useState<Goal[]>(goalsData);
  const [currentPage, setCurrentPage] = useState(1);
  const goalsPerPage = 10;

  // Lọc goals theo search query
  const filteredGoals = goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
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

  return (
    <>
      <div className="goals-main-content">
        <header className="goals-header">
          <h1>Quản lý mục tiêu</h1>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm mục tiêu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn-add-goal"
            onClick={() => navigate("/admin/goals/add")}
          >
            <i className="fas fa-plus"></i>
            <span>Thêm mục tiêu</span>
          </button>
        </header>

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Goal ID</th>
                <th>User ID</th>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Cập nhật</th>
                <th>Thao tác</th> {/* Thêm cột thao tác */}
              </tr>
            </thead>
            <tbody>
              {currentGoals.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", color: "#64748b" }}
                  >
                    Không có mục tiêu nào.
                  </td>
                </tr>
              ) : (
                currentGoals.map((goal) => (
                  <tr key={goal.goal_id}>
                    <td>{goal.goal_id}</td>
                    <td>{goal.user_id}</td>
                    <td>{goal.title}</td>
                    <td
                      style={{
                        maxWidth: 180,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {goal.description}
                    </td>
                    <td>{goal.start_date}</td>
                    <td>{goal.end_date}</td>
                    <td>
                      <span
                        className={
                          "goal-status " +
                          (goal.status === "Mới"
                            ? "new"
                            : goal.status === "Đang thực hiện"
                            ? "inprogress"
                            : goal.status === "Hoàn thành"
                            ? "completed"
                            : "expired")
                        }
                      >
                        {goal.status}
                      </span>
                    </td>
                    <td>{goal.created_at}</td>
                    <td>{goal.updated_at}</td>
                    <td>
                      <button className="btn-action edit" title="Sửa">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn-action delete" title="Xóa">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
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
      <Outlet />
    </>
  );
};

export default GoalsPage;
