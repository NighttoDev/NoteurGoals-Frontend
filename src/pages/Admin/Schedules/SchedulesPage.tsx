import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Schedule {
  event_id: string;
  user_id: string;
  title: string;
  description: string;
  event_time: string;
  created_at: string;
  updated_at: string;
}

const schedulesData: Schedule[] = Array(15)
  .fill(null)
  .map((_, index) => ({
    event_id: (index + 1).toString(),
    user_id: "U" + (index + 1),
    title: "Sự kiện " + (index + 1),
    description: "Nội dung sự kiện mẫu số " + (index + 1),
    event_time: "2025-07-0" + ((index % 9) + 1) + " 09:00",
    created_at: "2025-06-01",
    updated_at: "2025-06-05",
  }));

const SchedulesPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [schedules] = useState<Schedule[]>(schedulesData);
  const [currentPage, setCurrentPage] = useState(1);
  const schedulesPerPage = 10;

  // Lọc schedules theo search query
  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchedules.length / schedulesPerPage)
  );
  const indexOfLast = currentPage * schedulesPerPage;
  const indexOfFirst = indexOfLast - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(indexOfFirst, indexOfLast);

  // Chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <div className="goals-main-content">
      <header className="goals-header">
        <h1>Quản lý sự kiện</h1>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="btn-add-goal"
          onClick={() => navigate("/schedules/add")}
        >
          <i className="fas fa-plus"></i>
          <span>Thêm sự kiện</span>
        </button>
      </header>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>User ID</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Thời gian</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th> {/* Thêm cột thao tác */}
            </tr>
          </thead>
          <tbody>
            {currentSchedules.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", color: "#64748b" }}
                >
                  Không có sự kiện nào.
                </td>
              </tr>
            ) : (
              currentSchedules.map((schedule) => (
                <tr key={schedule.event_id}>
                  <td>{schedule.event_id}</td>
                  <td>{schedule.user_id}</td>
                  <td>{schedule.title}</td>
                  <td
                    style={{
                      maxWidth: 180,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {schedule.description}
                  </td>
                  <td>{schedule.event_time}</td>
                  <td>{schedule.created_at}</td>
                  <td>{schedule.updated_at}</td>
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
            className={`page-number ${currentPage === number ? "active" : ""}`}
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
  );
};

export default SchedulesPage;
