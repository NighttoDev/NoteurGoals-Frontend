import React, { useEffect, useState, useCallback } from "react";
// Import common types
import { TrashableItems } from "../../types/types";
import type { TrashedItem } from "../../types/types";

// Local fallback type for the tab key if ItemType isn't exported from types
type ItemType = (typeof TrashableItems)[keyof typeof TrashableItems];

// Import Notes service
import {
  getTrashedNotes,
  restoreNote,
  forceDeleteNoteFromTrash,
} from "../../services/notesService";

// Import Events (Schedule) service
import {
  getTrashedEvents,
  restoreEvent,
  forceDeleteEvent,
} from "../../services/eventService";

// Import Goals service
import {
  getTrashedGoals,
  restoreGoal,
  forceDeleteGoalFromTrash,
} from "../../services/goalsService";

// Import Files service (trash operations)
import {
  getTrashedFiles,
  restoreFileFromTrash,
  forceDeleteFileFromTrash,
} from "../../services/filesService";

// Import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faTools,
  faTrashRestore,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface TrashListProps {
  type: ItemType;
}

const TrashList: React.FC<TrashListProps> = ({ type }) => {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable logic for the Goals tab
  const isImplemented =
    type === TrashableItems.Notes ||
    type === TrashableItems.Schedule ||
    type === TrashableItems.Goals ||
    type === TrashableItems.Files;

  const fetchData = useCallback(async () => {
    if (!isImplemented) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let response;
      // Add a case to call the Goals API
      switch (type) {
        case TrashableItems.Notes:
          response = await getTrashedNotes();
          break;
        case TrashableItems.Schedule:
          response = await getTrashedEvents();
          break;
        case TrashableItems.Goals:
          response = await getTrashedGoals();
          break;
        case TrashableItems.Files:
          response = await getTrashedFiles();
          break;
        default:
          setItems([]);
          return;
      }

      const rawItems = response.data.data;
      // Update ID mapping logic to handle different resources
      interface TrashApiItem {
        goal_id?: string | number;
        note_id?: string | number;
        event_id?: string | number;
        file_id?: string | number;
        id?: string | number;
        title?: string;
        file_name?: string;
        deleted_at: string;
      }

      const mappedItems = (rawItems as TrashApiItem[]).map((item) => ({
        id:
          item.goal_id?.toString() ??
          item.note_id?.toString() ??
          item.event_id?.toString() ??
          item.file_id?.toString() ??
          item.id?.toString() ??
          "",
        title: item.title ?? item.file_name ?? "",
        deleted_at: new Date(item.deleted_at).toLocaleString("en-US"), // English date format
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error(`Failed to fetch trashed ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [type, isImplemented]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add logic for Goals to the restore function
  const handleRestore = async (id: string) => {
    if (!isImplemented) return;
    try {
      switch (type) {
        case TrashableItems.Notes:
          await restoreNote(id);
          break;
        case TrashableItems.Schedule:
          await restoreEvent(id);
          break;
        case TrashableItems.Goals:
          await restoreGoal(id);
          break;
        case TrashableItems.Files:
          await restoreFileFromTrash(id);
          break;
      }
      setItems((current) => current.filter((item) => item.id !== id));
      alert(`${type} restored successfully!`); // English alert
    } catch (error) {
      console.error(`Failed to restore ${type}:`, error);
    }
  };

  // Add logic for Goals to the permanent delete function
  const handleForceDelete = async (id: string) => {
    if (!isImplemented) return;
    if (
      window.confirm("Are you sure you want to PERMANENTLY DELETE this item?")
    ) {
      try {
        switch (type) {
          case TrashableItems.Notes:
            await forceDeleteNoteFromTrash(id);
            break;
          case TrashableItems.Schedule:
            await forceDeleteEvent(id);
            break;
          case TrashableItems.Goals:
            await forceDeleteGoalFromTrash(id);
            break;
          case TrashableItems.Files:
            await forceDeleteFileFromTrash(id);
            break;
        }
        setItems((current) => current.filter((item) => item.id !== id));
        alert(`${type} permanently deleted.`); // English alert
      } catch (error) {
        console.error(`Failed to force delete ${type}:`, error);
      }
    }
  };

  // ----- JSX REMAINS UNCHANGED -----

  if (loading) return <div>Loading...</div>; // English text

  if (!isImplemented) {
    return (
      <div className="trash-empty">
        <FontAwesomeIcon icon={faTools} size="3x" />
        <p>The trash feature for "{type}" is under development.</p>{" "}
        {/* English text */}
      </div>
    );
  }

  return (
    <div>
      {items.length === 0 ? (
        <div className="trash-empty">
          <FontAwesomeIcon icon={faBoxOpen} size="3x" />
          <p>Trash is empty for "{type}"</p> {/* English text */}
        </div>
      ) : (
        <ul className="trashed-notes-list">
          {items.map((item) => (
            <li key={item.id} className="trashed-note-item">
              <div className="note-info">
                <p className="note-title">{item.title}</p>
                <p className="note-deleted-date">
                  Date deleted: {item.deleted_at}
                </p>{" "}
                {/* English text */}
              </div>
              <div className="note-actions">
                <button
                  className="restore-button"
                  onClick={() => handleRestore(item.id)}
                  title="Restore" // English title
                >
                  <FontAwesomeIcon icon={faTrashRestore} />
                </button>
                <button
                  className="force-delete-button"
                  onClick={() => handleForceDelete(item.id)}
                  title="Permanently delete" // English title
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrashList;
