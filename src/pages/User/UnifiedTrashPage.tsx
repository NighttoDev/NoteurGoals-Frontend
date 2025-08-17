// src/pages/User/UnifiedTrashPage.tsx

import React, { useState } from "react";
import TrashList from "../../components/User/TrashList";
import "../../assets/css/User/unifiedTrashPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Đã tách import thành 2 dòng
import { TrashableItems } from "../../types/types";
import type { ItemType } from "../../types/types";

const UnifiedTrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ItemType>(TrashableItems.Notes);

  return (
    <main className="unified-trash-container">
      <div className="unified-trash-header">
        <h1>
          <FontAwesomeIcon icon={faTrash} /> Thùng rác
        </h1>
      </div>

      <div className="trash-tabs">
        {/* THAY ĐỔI 3: Mọi so sánh và gán giá trị đều dùng enum */}
        <button
          className={`tab-button ${
            activeTab === TrashableItems.Notes ? "active" : ""
          }`}
          onClick={() => setActiveTab(TrashableItems.Notes)}
        >
          Ghi chú (Notes)
        </button>
        <button
          className={`tab-button ${
            activeTab === TrashableItems.Goals ? "active" : ""
          }`}
          onClick={() => setActiveTab(TrashableItems.Goals)}
        >
          Mục tiêu (Goals)
        </button>
        <button
          className={`tab-button ${
            activeTab === TrashableItems.Schedule ? "active" : ""
          }`}
          onClick={() => setActiveTab(TrashableItems.Schedule)}
        >
          Lịch trình (Schedule)
        </button>
        <button
          className={`tab-button ${
            activeTab === TrashableItems.Files ? "active" : ""
          }`}
          onClick={() => setActiveTab(TrashableItems.Files)}
        >
          Tệp tin (Files)
        </button>
      </div>

      <div className="trash-content">
        <TrashList key={activeTab} type={activeTab} />
      </div>
    </main>
  );
};

export default UnifiedTrashPage;
