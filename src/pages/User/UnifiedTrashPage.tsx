// src/pages/User/UnifiedTrashPage.tsx

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStickyNote,
  faCalendarAlt,
  faBullseye,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import TrashList from "../../components/User/TrashList";
import { TrashableItems } from "../../types/types";
import type { ItemType } from "../../types/types";
import "../../assets/css/User/unifiedTrashPage.css";

const UnifiedTrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ItemType>(TrashableItems.Notes);

  const tabs = [
    {
      key: TrashableItems.Notes,
      label: "Notes",
      icon: faStickyNote,
    },
    {
      key: TrashableItems.Goals,
      label: "Goals",
      icon: faBullseye,
    },
    {
      key: TrashableItems.Schedule,
      label: "Schedule",
      icon: faCalendarAlt,
    },
    {
      key: TrashableItems.Files,
      label: "Files",
      icon: faFile,
    },
  ];

  const getTabTitle = (tabKey: ItemType) => {
    const tab = tabs.find((t) => t.key === tabKey);
    return tab ? tab.label : tabKey;
  };

  return (
    <div className="unified-trash-container">
      {/* Sidebar */}
      <div className="trash-sidebar">
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`nav-button ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="trash-content-area">
        <div className="content-header">
          <h2>
            <FontAwesomeIcon
              icon={
                tabs.find((t) => t.key === activeTab)?.icon || faStickyNote
              }
            />
            {getTabTitle(activeTab)}
          </h2>
        </div>

        <div className="trash-content">
          <TrashList type={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedTrashPage;
