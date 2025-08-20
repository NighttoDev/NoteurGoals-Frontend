// src/types/types.ts

// CHỈ EXPORT ENUM VÀ INTERFACE
// Enum này là một đối tượng JavaScript khi chạy
export enum TrashableItems {
  Notes = "Notes",
  Goals = "Goals",
  Schedule = "Schedule",
  Files = "Files",
}

// Interface này chỉ dùng để kiểm tra kiểu lúc code
export interface TrashedItem {
  id: string;
  title: string;
  deleted_at: string;
}
