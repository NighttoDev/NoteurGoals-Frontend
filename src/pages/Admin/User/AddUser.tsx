import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormState {
  name: string;
  email: string;
  method: string;
  status: string;
}

interface FormError {
  name?: string;
  email?: string;
  method?: string;
  status?: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  method: "",
  status: "",
};

const AddUser: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormError>({});
  const navigate = useNavigate();

  const validate = (): FormError => {
    const newErrors: FormError = {};
    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
    ) {
      newErrors.email = "Email không hợp lệ.";
    }
    if (!form.method) {
      newErrors.method = "Vui lòng chọn cách thức đăng ký.";
    }
    if (!form.status) {
      newErrors.status = "Vui lòng chọn trạng thái.";
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // TODO: Gửi dữ liệu lên server tại đây
    // Sau khi thêm thành công:
    navigate("/users");
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "0 auto" }}
      className="goals-main-content"
    >
      <header className="goals-header">
        <h1>Thêm tài khoản người dùng</h1>
      </header>
      <form
        className="add-goal-form"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="form-group">
          <label htmlFor="name">
            Họ và tên <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Nhập họ và tên"
            value={form.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="email">
            Email <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="method">
            Cách thức đăng ký <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            id="method"
            name="method"
            value={form.method}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn --</option>
            <option value="Facebook">Facebook</option>
            <option value="Google">Google</option>
            <option value="Email">Email</option>
          </select>
          {errors.method && <div className="form-error">{errors.method}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="status">
            Trạng thái <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn --</option>
            <option value="Không hoạt động">Không hoạt động</option>
            <option value="Hoạt động">Hoạt động</option>
          </select>
          {errors.status && <div className="form-error">{errors.status}</div>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-add-goal">
            <i className="fas fa-plus"></i> Thêm người dùng
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/users")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
