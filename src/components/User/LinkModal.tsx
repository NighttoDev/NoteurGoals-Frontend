import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface Note {
  note_id: number;
  title: string;
}

interface FileItem {
  file_id: number;
  file_name: string;
}

interface LinkModalProps {
  file: FileItem;
  notes: Note[];
  onLinkToNote: (noteId: number) => void;
  onClose: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({
  file,
  notes,
  onLinkToNote,
  onClose,
}) => {
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  const handleLink = () => {
    if (selectedNote) {
      onLinkToNote(selectedNote);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="link-modal">
        <div className="modal-header">
          <p>Link File: {file.file_name}</p>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="link-options">
            <h4 style={{ color: "var(--text-main)" }}>Select a Note:</h4>
            {notes.length === 0 ? (
              <p>No notes available</p>
            ) : (
              <div className="item-list">
                {notes.map((note) => (
                  <label
                    style={{ color: "var(--text-main)" }}
                    key={note.note_id}
                    className="item"
                  >
                    <input
                      type="radio"
                      name="note"
                      value={note.note_id}
                      checked={selectedNote === note.note_id}
                      onChange={() => setSelectedNote(note.note_id)}
                    />
                    <span>{note.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="link-btn"
            onClick={handleLink}
            disabled={!selectedNote}
          >
            Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
