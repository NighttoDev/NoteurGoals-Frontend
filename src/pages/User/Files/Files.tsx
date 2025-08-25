// src/pages/User/Files/Files.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineUpload,
  AiOutlineDownload,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineFile,
  AiOutlineFileImage,
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFileZip,
  AiOutlineFolder,
  AiOutlineLink,
  AiOutlineClose,
} from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThLarge,
  faBars,
  faFilter,
  faSortAmountDown,
  faPlus,
  faChevronDown,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import "../../../assets/css/User/files.css";
import FilePreviewModal from "../../../components/User/FilePreviewModal";
import LinkModal from "../../../components/User/LinkModal";
import UploadModal from "../../../components/User/UploadModal";
import {
  getFiles,
  deleteFile,
  downloadFile,
  getFileUrl,
  isImageFile,
  isPdfFile,
  isTextFile,
  linkFileToGoal,
  unlinkFileFromGoal,
  linkFileToNote,
  unlinkFileFromNote,
  getGoals,
  getNotes,
  uploadFiles,
} from "../../../services/filesService";

interface FileItem {
  file_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  box_file_id?: string;
  goals?: Array<{
    goal_id: number;
    title: string;
  }>;
  notes?: Array<{
    note_id: number;
    title: string;
  }>;
}

interface Goal {
  goal_id: number;
  title: string;
}

interface Note {
  note_id: number;
  title: string;
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedFileForLink, setSelectedFileForLink] =
    useState<FileItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] =
    useState<FileItem | null>(null);

  // Dropdown states
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Refs for dropdowns
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchFiles(), fetchGoalsAndNotes()]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(event.target as Node)
      ) {
        setIsViewDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchGoalsAndNotes = async () => {
    try {
      const [goalsData, notesData] = await Promise.all([
        getGoals(),
        getNotes(),
      ]);
      setGoals(goalsData.data || []);
      setNotes(notesData.data || []);
    } catch (error) {
      console.error("Error fetching goals and notes:", error);
    }
  };

  const handleFileUpload = async (filesToUpload: FileList) => {
    const formData = new FormData();
    const fileNames: string[] = [];

    // Validate file names length
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      if (file.name.length > 255) {
        alert(
          `File name "${file.name}" is too long. Maximum length is 255 characters.`
        );
        return;
      }
    }

    Array.from(filesToUpload).forEach((file) => {
      formData.append("files[]", file); // Giữ như này vì Laravel cần files[]
      fileNames.push(file.name);
    });

    // Debug: Kiểm tra FormData
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const initialProgress = fileNames.reduce(
      (acc, name) => ({ ...acc, [name]: 0 }),
      {}
    );
    setUploadProgress(initialProgress);

    try {
      const response = await uploadFiles(formData, (progress) => {
        const newProgress = { ...uploadProgress };
        fileNames.forEach((name) => {
          newProgress[name] = progress;
        });
        setUploadProgress(newProgress);
      });

      console.log("Upload response:", response);
      alert("Files uploaded successfully!");
      fetchFiles();
      setShowUploadModal(false);
      setTimeout(() => setUploadProgress({}), 1000);
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error uploading files:", error);
      console.error("Error response:", errorObject.response?.data);
      console.error("Error status:", errorObject.response?.status);
      alert(
        `File upload failed: ${
          errorObject.response?.data?.message || errorObject.message
        }`
      );
      setUploadProgress({});
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    console.log("Attempting to delete file ID:", fileId); // Debug log

    try {
      await deleteFile(fileId);
      alert("File deleted successfully.");
      setFiles(files.filter((f) => f.file_id !== fileId));
    } catch (error: any) {
      console.error("Error deleting file:", error);
      console.error("Error response:", error.response); // Thêm log này
      alert(
        `Failed to delete file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    try {
      const response = await downloadFile(file.file_id);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error downloading file:", error);
      alert(
        `Failed to download file: ${
          errorObject.response?.data?.message || errorObject.message
        }`
      );
    }
  };

  const handleViewFile = (file: FileItem) => {
    setSelectedFileForPreview(file);
    setShowPreviewModal(true);
  };

  const handleLinkToGoal = async (goalId: number) => {
    if (!selectedFileForLink) return;
    try {
      await linkFileToGoal(selectedFileForLink.file_id, goalId);
      fetchFiles();
      setShowLinkModal(false);
      setSelectedFileForLink(null);
      alert("File linked to goal successfully!");
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error linking file to goal:", error);
      alert(`Error linking file to goal: ${error.message}`);
    }
  };

  const handleLinkToNote = async (noteId: number) => {
    if (!selectedFileForLink) return;
    try {
      await linkFileToNote(selectedFileForLink.file_id, noteId);
      fetchFiles();
      setShowLinkModal(false);
      setSelectedFileForLink(null);
      alert("File linked to note successfully!");
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error linking file to note:", error);
      alert(`Error linking file to note: ${error.message}`);
    }
  };

  const handleUnlinkFromGoal = async (fileId: number, goalId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to unlink this file from the goal?"
      )
    )
      return;
    try {
      await unlinkFileFromGoal(fileId, goalId);
      fetchFiles();
      alert("File unlinked from goal successfully!");
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error unlinking file from goal:", error);
      alert(`Error unlinking file from goal: ${error.message}`);
    }
  };

  const handleUnlinkFromNote = async (fileId: number, noteId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to unlink this file from the note?"
      )
    )
      return;
    try {
      await unlinkFileFromNote(fileId, noteId);
      fetchFiles();
      alert("File unlinked from note successfully!");
    } catch (error: unknown) {
      const errorObject = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Error unlinking file from note:", error);
      alert(`Error unlinking file from note: ${errorObject.message}`);
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("image")) return <AiOutlineFileImage />;
    if (type.includes("pdf")) return <AiOutlineFilePdf />;
    if (type.includes("word") || type.includes("document"))
      return <AiOutlineFileWord />;
    if (type.includes("excel") || type.includes("spreadsheet"))
      return <AiOutlineFileExcel />;
    if (type.includes("zip") || type.includes("archive"))
      return <AiOutlineFileZip />;
    return <AiOutlineFile />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesType =
        filterType === "all" ||
        file.file_type.toLowerCase().includes(filterType);
      return matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case "date":
          comparison =
            new Date(a.uploaded_at).getTime() -
            new Date(b.uploaded_at).getTime();
          break;
        case "size":
          comparison = a.file_size - b.file_size;
          break;
        case "type":
          comparison = a.file_type.localeCompare(b.file_type);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const viewOptions = [
    { value: "grid" as const, label: "Grid" },
    { value: "list" as const, label: "List" },
  ];

  const filterOptions = [
    { value: "all", label: "All Files" },
    { value: "image", label: "Images" },
    { value: "pdf", label: "PDFs" },
    { value: "document", label: "Documents" },
    { value: "spreadsheet", label: "Spreadsheets" },
    { value: "archive", label: "Archives" },
  ];

  const sortOptions = [
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "size-desc", label: "Largest First" },
    { value: "size-asc", label: "Smallest First" },
  ];

  const currentViewLabel =
    viewOptions.find((option) => option.value === viewMode)?.label || "Grid";
  const currentFilterLabel =
    filterOptions.find((option) => option.value === filterType)?.label ||
    "All Files";
  const currentSortLabel =
    sortOptions.find((option) => option.value === `${sortBy}-${sortOrder}`)
      ?.label || "Newest First";

  if (loading) {
    return (
      <main className="files-main-content">
        <section className="files-container-section">
          <div className="files-header-container">
            <h1 className="files-page-title">My Files</h1>
          </div>
          <div className="files-loading-container">
            <div className="files-loading-spinner">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>Loading files...</p>
          </div>
        </section>
      </main>
    );
  }

  const showLoading = files.length === 0 && loading;

  const renderLoading = () => (
    <div className="files-loading-container">
      <div className="files-loading-spinner">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>Loading your files...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="files-empty-state">
      <FontAwesomeIcon icon={faFile} className="files-empty-state-icon" />
      <h3>No files yet</h3>
      <p>Upload your first file by clicking the "Upload Files" button</p>
      <button
        className="files-btn files-btn-primary"
        onClick={() => setShowUploadModal(true)}
        style={{ marginTop: "1rem" }}
      >
        <FontAwesomeIcon icon={faPlus} /> Upload First File
      </button>
    </div>
  );

  return (
    <main
      className="files-main-content"
      style={{ margin: "0", borderRadius: "0" }}
    >
      <section className="files-container-section">
        {/* Header giống Notes */}
        <div className="files-header-container">
          <h1 className="files-page-title">My Files</h1>

          <div className="files-action-buttons">
            <div className="files-toolbar-group">
              <button
                className={`files-btn-icon ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                className={`files-btn-icon ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>

            <div className="files-filter-dropdown" ref={filterDropdownRef}>
              <button
                className="files-filter-dropdown-button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              >
                <FontAwesomeIcon icon={faFilter} />
                {currentFilterLabel}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`files-dropdown-icon ${
                    isFilterDropdownOpen ? "files-dropdown-icon-open" : ""
                  }`}
                />
              </button>
              {isFilterDropdownOpen && (
                <div className="files-filter-dropdown-menu">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`files-filter-dropdown-item ${
                        filterType === option.value
                          ? "files-filter-dropdown-item-active"
                          : ""
                      }`}
                      onClick={() => {
                        setFilterType(option.value);
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="files-filter-dropdown" ref={sortDropdownRef}>
              <button
                className="files-filter-dropdown-button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                <FontAwesomeIcon icon={faSortAmountDown} />
                {currentSortLabel}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`files-dropdown-icon ${
                    isSortDropdownOpen ? "files-dropdown-icon-open" : ""
                  }`}
                />
              </button>
              {isSortDropdownOpen && (
                <div className="files-filter-dropdown-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className="files-filter-dropdown-item"
                      onClick={() => {
                        const [sortField, order] = option.value.split("-");
                        setSortBy(sortField as any);
                        setSortOrder(order as any);
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="files-btn files-btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Upload Files
            </button>
          </div>
        </div>

        <div className={`files-main-container ${viewMode}-view`}>
          {showLoading
            ? renderLoading()
            : filteredFiles.length === 0
            ? renderEmptyState()
            : filteredFiles.map((file) => (
                <div key={file.file_id} className="file-item">
                  <div className="file-icon">{getFileIcon(file.file_type)}</div>

                  <div className="file-info">
                    <h3 className="file-name">{file.file_name}</h3>
                    <div className="file-meta">
                      <span className="file-size">
                        {formatFileSize(file.file_size)}
                      </span>
                      <span className="file-date">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>

                    {(file.goals?.length > 0 || file.notes?.length > 0) && (
                      <div className="file-links">
                        {file.goals?.map((goal) => (
                          <span key={goal.goal_id} className="link-tag">
                            <span className="link-label">Goal:</span>
                            {goal.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkFromGoal(
                                  file.file_id,
                                  goal.goal_id
                                );
                              }}
                              className="unlink-btn"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {file.notes?.map((note) => (
                          <span key={note.note_id} className="link-tag">
                            <span className="link-label">Note:</span>
                            {note.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkFromNote(
                                  file.file_id,
                                  note.note_id
                                );
                              }}
                              className="unlink-btn"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="file-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFile(file);
                      }}
                      className="action-btn view-btn"
                      title="View file"
                    >
                      <AiOutlineEye />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(file);
                      }}
                      className="action-btn download-btn"
                      title="Download file"
                    >
                      <AiOutlineDownload />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileForLink(file);
                        setShowLinkModal(true);
                      }}
                      className="action-btn link-btn"
                      title="Link to goal/note"
                    >
                      <AiOutlineLink />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.file_id);
                      }}
                      className="action-btn delete-btn"
                      title="Delete file"
                    >
                      <AiOutlineDelete />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* Existing modals */}
      {showPreviewModal && selectedFileForPreview && (
        <FilePreviewModal
          file={selectedFileForPreview}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedFileForPreview(null);
          }}
          onDownload={() => handleDownloadFile(selectedFileForPreview)}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onUpload={handleFileUpload}
          onClose={() => setShowUploadModal(false)}
          uploadProgress={uploadProgress}
        />
      )}

      {showLinkModal && selectedFileForLink && (
        <LinkModal
          file={selectedFileForLink}
          goals={goals}
          notes={notes}
          onLinkToGoal={handleLinkToGoal}
          onLinkToNote={handleLinkToNote}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedFileForLink(null);
          }}
        />
      )}
    </main>
  );
};

export default Files;
