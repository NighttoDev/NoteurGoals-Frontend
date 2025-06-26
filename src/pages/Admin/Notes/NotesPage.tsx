import React, { useState } from "react";
// BƯỚC 1: Import thêm useNavigate và Link từ react-router-dom
import { Outlet } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";
import "../../../assets/css/Admin/notes.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Note {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

const notesData: Note[] = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: (index + 1).toString(),
    title: `Ghi chú ${index + 1} - ${
      ["TypeScript", "React", "Angular", "Vue", "Node.js"][index % 5]
    }`,
    description: [
      "Học cơ bản và nâng cao để áp dụng vào dự án",
      "Ghi chú quan trọng cần ghi nhớ",
      "Các bước thực hiện công việc hàng ngày",
      "Tổng hợp kiến thức cần ôn tập",
      "Ý tưởng phát triển tính năng mới",
    ][index % 5],
    updatedAt: `0${(index % 12) + 1}/0${(index % 28) + 1}/2025`,
  }));

const Notes: React.FC = () => {
  // BƯỚC 2: Khởi tạo hook useNavigate
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>(notesData);
  const [selectedNote, setSelectedNote] = useState<string>("1");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 8;

  // Hàm xử lý xóa note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra note item
    if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote === id) {
        setSelectedNote("");
      }
    }
  };

  // BƯỚC 3: Cập nhật hàm xử lý sửa note để điều hướng
  const handleEditNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra note item
    // Thay vì alert, chúng ta sẽ điều hướng đến trang edit
    navigate(`/notes/edit/${id}`);
  };

  // Lọc notes theo search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán phân trang
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

  return (
    <>
      <div className="notes-container">
        <div className="notes-content">
          {/* Header */}
          <header className="notes-header">
            <h1>Quản lý ghi chú</h1>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm cuộc họp, bản ghi, v.v..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* BƯỚC 4: Thay thế button bằng component Link */}
            <Link to="/notes/add" className="btn-add-note">
              <i className="fas fa-plus"></i>
              <span>Thêm ghi chú</span>
            </Link>
          </header>

          {/* Notes List */}
          <div className="notes-list">
            {" "}
            {currentNotes.map((note) => (
              <Link
                style={{ textDecoration: "none" }}
                to={`/notes/edit/${note.id}`}
              >
                <div
                  key={note.id}
                  className={`note-item ${
                    selectedNote === note.id ? "selected" : ""
                  }`}
                  // CẬP NHẬT: Thay vì điều hướng, chỉ cần chọn note
                  onClick={() => setSelectedNote(note.id)}
                >
                  <div className="note-details">
                    <div className="note-title-wrapper">
                      <h3>{note.title}</h3>
                      <i className="fas fa-link"></i>
                    </div>
                    <p>{note.description}</p>
                  </div>

                  <div className="note-meta">Cập nhật: {note.updatedAt}</div>
                  {/* Vùng actions chứa các button Sửa/Xóa */}
                  {/* CSS cho vùng này đã được thêm vào cuối file notes.css */}
                  <div className="note-item-actions">
                    <button
                      className="note-action-btn edit-btn"
                      onClick={(e) => handleEditNote(note.id, e)}
                      title="Sửa ghi chú"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="note-action-btn delete-btn"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      title="Xóa ghi chú"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
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

export default Notes;
