import { useState, useRef, useEffect } from "react";
import "../../assets/css/User/files.css";
import {
  FaFilter,
  FaSort,
  FaFilePdf,
  FaImage,
  FaFileWord,
  FaFileArchive,
  FaEllipsisVertical,
  FaDownload,
  FaShare,
  FaBullseye,
  FaStickyNote,
  FaCloudUploadAlt,
  FaTimes,
} from "react-icons/fa";

interface FileItem {
  id: string;
  title: string;
  type: "pdf" | "image" | "doc" | "zip";
  size: string;
  date: string;
  tags: string[];
  preview?: string;
}

const FilesPage = () => {
  // State for files data
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      title: "Project_Requirements.pdf",
      type: "pdf",
      size: "2.4 MB",
      date: "Jun 22, 2025",
      tags: ["Web Dev Course", "Meeting Notes"],
    },
    {
      id: "2",
      title: "Wireframe.png",
      type: "image",
      size: "1.8 MB",
      date: "Jun 20, 2025",
      tags: ["Web Dev Course"],
      preview:
        "https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Wireframe",
    },
    {
      id: "3",
      title: "Research_Paper.docx",
      type: "doc",
      size: "3.2 MB",
      date: "Jun 18, 2025",
      tags: ["Research Project"],
    },
    {
      id: "4",
      title: "Resources.zip",
      type: "zip",
      size: "15.7 MB",
      date: "Jun 15, 2025",
      tags: ["Web Dev Course", "Study Materials"],
    },
  ]);

  // State for UI
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    preview: string;
    name: string;
    size: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileType: "pdf",
    tags: "",
    goal: "",
    note: "",
    schedule: "",
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile({
          preview: e.target?.result as string,
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleUpload = () => {
    if (uploadedFile) {
      // In a real app, you would upload the file to a server here
      const newFile: FileItem = {
        id: `${files.length + 1}`,
        title: formData.title || uploadedFile.name,
        type: formData.fileType as "pdf" | "image" | "doc" | "zip",
        size: uploadedFile.size,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        preview: uploadedFile.preview,
      };

      setFiles((prev) => [...prev, newFile]);
      setShowUploadModal(false);
      setUploadedFile(null);
      setFormData({
        title: "",
        description: "",
        fileType: "pdf",
        tags: "",
        goal: "",
        note: "",
        schedule: "",
      });
      alert("File uploaded successfully!");
    }
  };

  // Get file icon based on type
  const getFileIcon = (type: string, size = "1rem") => {
    switch (type) {
      case "pdf":
        return <FaFilePdf size={size} />;
      case "image":
        return <FaImage size={size} />;
      case "doc":
        return <FaFileWord size={size} />;
      case "zip":
        return <FaFileArchive size={size} />;
      default:
        return <FaFilePdf size={size} />;
    }
  };

  // Get file type class
  const getFileTypeClass = (type: string) => {
    return `file-icon ${type}`;
  };

  return (
    <>
      <main className="main-content">
        {/* Files Section */}
        <section className="files-section">
          <div className="content-header">
            <h1 className="page-title">My Files</h1>
            <div className="action-buttons">
              <button className="btn btn-secondary">
                <FaFilter /> Filter
              </button>
              <button className="btn btn-secondary">
                <FaSort /> Sort
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload File
              </button>
            </div>
          </div>

          <div className="files-grid">
            {files.map((file) => (
              <div
                key={file.id}
                className="file-card"
                data-file-id={file.id}
                onClick={() => {
                  setSelectedFile(file);
                  setShowSidebar(true);
                }}
              >
                <div className="file-header">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className={getFileTypeClass(file.type)}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-info">
                      <div className="file-title">{file.title}</div>
                      <div className="file-meta">
                        <span className="file-size">{file.size}</span>
                        <span className="file-date">{file.date}</span>
                      </div>
                    </div>
                  </div>
                  <FaEllipsisVertical className="file-menu" />
                </div>
                <div className="file-preview">
                  {file.type === "image" && file.preview ? (
                    <img src={file.preview} alt={file.title} />
                  ) : (
                    <div
                      className={getFileTypeClass(file.type)}
                      style={{ width: "80px", height: "80px" }}
                    >
                      {getFileIcon(file.type, "2.5rem")}
                    </div>
                  )}
                </div>
                <div className="file-footer">
                  <div className="file-tags">
                    {file.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`tag ${
                          index === 0 ? "tag-goal" : "tag-note"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="file-actions">
                    <button className="file-action-btn">
                      <FaDownload />
                    </button>
                    <button className="file-action-btn">
                      <FaShare />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* File Details Sidebar */}
      <div className={`file-details-sidebar ${showSidebar ? "active" : ""}`}>
        <div className="sidebar-header">
          <h2>File Details</h2>
          <button
            className="sidebar-close-btn"
            onClick={() => setShowSidebar(false)}
          >
            &times;
          </button>
        </div>

        {selectedFile && (
          <>
            <div className="file-details-preview">
              {selectedFile.type === "image" && selectedFile.preview ? (
                <img src={selectedFile.preview} alt={selectedFile.title} />
              ) : (
                <div
                  className={getFileTypeClass(selectedFile.type)}
                  style={{ width: "100px", height: "100px" }}
                >
                  {getFileIcon(selectedFile.type, "3rem")}
                </div>
              )}
            </div>

            <div className="file-details-info">
              <h3 className="file-details-title">{selectedFile.title}</h3>
              <div className="file-details-meta">
                <div className="file-details-meta-item">
                  <span className="file-details-meta-label">Type:</span>
                  <span className="file-details-meta-value">
                    {selectedFile.type === "pdf" && "PDF Document"}
                    {selectedFile.type === "image" && "Image"}
                    {selectedFile.type === "doc" && "Word Document"}
                    {selectedFile.type === "zip" && "Archive"}
                  </span>
                </div>
                <div className="file-details-meta-item">
                  <span className="file-details-meta-label">Size:</span>
                  <span className="file-details-meta-value">
                    {selectedFile.size}
                  </span>
                </div>
                <div className="file-details-meta-item">
                  <span className="file-details-meta-label">Uploaded:</span>
                  <span className="file-details-meta-value">
                    {selectedFile.date}
                  </span>
                </div>
                <div className="file-details-meta-item">
                  <span className="file-details-meta-label">Modified:</span>
                  <span className="file-details-meta-value">
                    {selectedFile.date}
                  </span>
                </div>
              </div>
            </div>

            <div className="file-details-description">
              <h4>Description</h4>
              <p>
                {selectedFile.type === "pdf" &&
                  "Final project requirements document for the web development course. Includes all specifications and acceptance criteria."}
                {selectedFile.type === "image" &&
                  "Wireframe image for the web development project."}
                {selectedFile.type === "doc" &&
                  "Research paper document for the academic project."}
                {selectedFile.type === "zip" &&
                  "Compressed archive containing study materials and resources."}
              </p>
            </div>

            <div className="file-details-linked">
              <h4>Linked To</h4>
              <div className="linked-item">
                <div className="linked-item-icon">
                  <FaBullseye />
                </div>
                <div className="linked-item-info">
                  <div className="linked-item-title">
                    {selectedFile.tags[0]}
                  </div>
                  <div className="linked-item-type">Goal</div>
                </div>
              </div>
              {selectedFile.tags.length > 1 && (
                <div className="linked-item">
                  <div className="linked-item-icon">
                    <FaStickyNote />
                  </div>
                  <div className="linked-item-info">
                    <div className="linked-item-title">
                      {selectedFile.tags[1]}
                    </div>
                    <div className="linked-item-type">Note</div>
                  </div>
                </div>
              )}
            </div>

            <div className="file-details-actions">
              <button className="btn btn-secondary">
                <FaDownload /> Download
              </button>
              <button className="btn btn-primary">
                <FaShare /> Share
              </button>
            </div>
          </>
        )}
      </div>

      {/* Upload File Modal */}
      <div className={`modal-overlay ${showUploadModal ? "active" : ""}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Upload File</h2>
            <button
              className="modal-close-btn"
              onClick={() => setShowUploadModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form className="upload-form">
              <div
                className={`file-upload-area ${dragActive ? "drag-over" : ""}`}
                onClick={handleFileInputClick}
                onDragEnter={(e) => handleDrag(e, true)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDragOver={(e) => handleDrag(e, true)}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt size="2rem" />
                <p>Drag & drop files here or click to browse</p>
                <span>Max file size: 10MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*,application/pdf,application/msword,application/zip"
                  style={{ display: "none" }}
                />
              </div>

              {uploadedFile && (
                <div className="file-upload-preview active">
                  {uploadedFile.preview.startsWith("data:image") ? (
                    <img src={uploadedFile.preview} alt="File Preview" />
                  ) : (
                    <div
                      className={getFileTypeClass(formData.fileType)}
                      style={{ width: "80px", height: "80px" }}
                    >
                      {getFileIcon(formData.fileType, "2.5rem")}
                    </div>
                  )}
                </div>
              )}

              {uploadedFile && (
                <div className="file-upload-info">
                  <span className="file-upload-name">{uploadedFile.name}</span>
                  <span className="file-upload-size">{uploadedFile.size}</span>
                  <button
                    className="file-upload-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      removeUploadedFile();
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="file-title">Title</label>
                <input
                  type="text"
                  id="file-title"
                  name="title"
                  placeholder="Enter file title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="file-description">Description (Optional)</label>
                <textarea
                  id="file-description"
                  name="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-group-inline">
                <div className="form-group">
                  <label htmlFor="file-type">File Type</label>
                  <select
                    id="file-type"
                    name="fileType"
                    value={formData.fileType}
                    onChange={handleInputChange}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="image">Image</option>
                    <option value="doc">Word Document</option>
                    <option value="zip">Archive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="file-tags">Tags (Optional)</label>
                  <input
                    type="text"
                    id="file-tags"
                    name="tags"
                    placeholder="Add tags separated by commas"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="file-goal">Link to Goal (Optional)</label>
                <select
                  id="file-goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                >
                  <option value="">Select a goal</option>
                  <option value="goal1">Complete Web Development Course</option>
                  <option value="goal2">Finish Research Project</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="file-note">Link to Note (Optional)</label>
                <select
                  id="file-note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                >
                  <option value="">Select a note</option>
                  <option value="note1">Meeting Notes - June 22</option>
                  <option value="note2">Project Brainstorming</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="file-schedule">
                  Link to Schedule (Optional)
                </label>
                <select
                  id="file-schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                >
                  <option value="">Select a schedule</option>
                  <option value="schedule1">Web Dev Course Schedule</option>
                  <option value="schedule2">Project Timeline</option>
                </select>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                setShowUploadModal(false);
                removeUploadedFile();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                handleUpload();
              }}
              disabled={!uploadedFile}
            >
              Upload File
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilesPage;
