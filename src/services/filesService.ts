// src/services/filesService.ts
import apiClient from "../api/apiClient";

// =================================
// --- Files API ---
// =================================

export const uploadFiles = (
  formData: FormData,
  onProgress: (progress: number) => void
) => {
  const token = localStorage.getItem("authToken");
  console.log("Auth token exists:", !!token);

  return apiClient.post("/api/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export const getFiles = async () => {
  const response = await apiClient.get("/api/files");
  return response.data;
};

export const getFile = async (fileId: number) => {
  const response = await apiClient.get(`/api/files/${fileId}`);
  return response.data;
};

export const downloadFile = async (fileId: number) => {
  const response = await apiClient.get(`/api/files/${fileId}/download`, {
    responseType: "blob",
  });
  return response;
};

export const deleteFile = async (fileId: number) => {
  console.log("Deleting file with ID:", fileId);
  const response = await apiClient.delete(`/api/files/${fileId}`);
  return response.data;
};

// =================================
// --- File View and Preview ---
// =================================

export const getFileUrl = (filePath: string) => {
  return `${
    (import.meta as ImportMeta).env.VITE_API_BASE_URL || "http://localhost:8000"
  }/storage/${filePath}`;
};

export const isImageFile = (fileType: string) => {
  return fileType.startsWith("image/");
};

export const isPdfFile = (fileType: string) => {
  return fileType === "application/pdf";
};

export const isTextFile = (fileType: string) => {
  return fileType.startsWith("text/");
};

// =================================
// --- Linking API ---
// =================================

export const linkFileToGoal = async (fileId: number, goalId: number) => {
  const response = await apiClient.post(`/api/files/${fileId}/goals`, {
    goal_id: goalId,
  });
  return response.data;
};

export const unlinkFileFromGoal = async (fileId: number, goalId: number) => {
  const response = await apiClient.delete(
    `/api/files/${fileId}/goals/${goalId}`
  );
  return response.data;
};

export const linkFileToNote = async (fileId: number, noteId: number) => {
  const response = await apiClient.post(`/api/files/${fileId}/notes`, {
    note_id: noteId,
  });
  return response.data;
};

export const unlinkFileFromNote = async (fileId: number, noteId: number) => {
  const response = await apiClient.delete(
    `/api/files/${fileId}/notes/${noteId}`
  );
  return response.data;
};

// =================================
// --- Goals & Notes API ---
// =================================

export const getGoals = async () => {
  const response = await apiClient.get("/api/goals");
  return response.data;
};

export const getNotes = async () => {
  const response = await apiClient.get("/api/notes");
  return response.data;
};
