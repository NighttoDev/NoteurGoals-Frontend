import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../../assets/css/Admin/user.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface User {
  id: string;
  name: string;
  email: string;
  method: string;
  createdAt: string;
  status: string;
  avatar?: string;
}

const usersData: User[] = Array(12)
  .fill(null)
  .map((_, index) => ({
    id: (index + 1).toString(),
    name: "Nguyễn Trần Hạnh Vy",
    email: "nguyenvy0105@gmail.com",
    method: "Facebook",
    createdAt: "30/05/2025",
    status: "Không hoạt động",
    avatar: "",
  }));

const ListUserPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState<User[]>(usersData);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Lọc users theo search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage)
  );
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
      <div className="users-container">
        <div className="users-content">
          {/* Header */}
          <header className="goals-header">
            <h1>User Management</h1>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/admin/users/add" className="btn-add-goal">
              <i className="fas fa-plus"></i>
              <span>Add User</span>
            </Link>
          </header>

          {/* User Table */}
          <div className="user-table-wrapper">
            <table className="user-table">
              <thead style={{}}>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Method</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      Không có người dùng nào.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, idx) => (
                    <tr key={user.id + idx}>
                      <td>{user.id}</td>
                      <td>
                        <div className="user-info">
                          <span className="user-avatar">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} />
                            ) : (
                              <span className="avatar-placeholder"></span>
                            )}
                          </span>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.method}</td>
                      <td>{user.createdAt}</td>
                      <td>
                        <span className="user-status inactive">
                          {user.status}
                        </span>
                      </td>
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

export default ListUserPage;
