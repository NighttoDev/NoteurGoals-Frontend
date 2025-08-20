import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Note {
  note_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const notesData: Note[] = Array(15)
  .fill(null)
  .map((_, index) => ({
    note_id: (index + 1).toString(),
    user_id: "U" + (index + 1),
    title: "Ghi chú " + (index + 1),
    content: "Nội dung ghi chú mẫu số " + (index + 1),
    created_at: "01/06/2025",
    updated_at: "05/06/2025",
  }));

const NotesPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [notes] = useState<Note[]>(notesData);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  // Lọc notes theo search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotes.length / notesPerPage)
  );
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);

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
        <h1>Quản lý ghi chú</h1>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-add-goal" onClick={() => navigate("/notes/add")}>
          <i className="fas fa-plus"></i>
          <span>Thêm ghi chú</span>
        </button>
      </header>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Note ID</th>
              <th>User ID</th>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentNotes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", color: "#64748b" }}
                >
                  Không có ghi chú nào.
                </td>
              </tr>
            ) : (
              currentNotes.map((note) => (
                <tr key={note.note_id}>
                  <td>{note.note_id}</td>
                  <td>{note.user_id}</td>
                  <td>{note.title}</td>
                  <td
                    style={{
                      maxWidth: 180,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {note.content}
                  </td>
                  <td>{note.created_at}</td>
                  <td>{note.updated_at}</td>
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

export default NotesPage;
