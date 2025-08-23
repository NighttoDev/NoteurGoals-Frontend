import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

interface Goal {
  goal_id: number;
  title: string;
}

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
  goals: Goal[];
  notes: Note[];
  onLinkToGoal: (goalId: number) => void;
  onLinkToNote: (noteId: number) => void;
  onClose: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({ 
  file, 
  goals, 
  notes, 
  onLinkToGoal, 
  onLinkToNote, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'notes'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  const handleLink = () => {
    if (activeTab === 'goals' && selectedGoal) {
      onLinkToGoal(selectedGoal);
    } else if (activeTab === 'notes' && selectedNote) {
      onLinkToNote(selectedNote);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Link File: {file.file_name}</h3>
          <button className="close-btn" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={activeTab === 'goals' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
          <button 
            className={activeTab === 'notes' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'goals' && (
            <div className="link-options">
              <h4>Select a Goal:</h4>
              {goals.length === 0 ? (
                <p>No goals available</p>
              ) : (
                <div className="options-list">
                  {goals.map(goal => (
                    <label key={goal.goal_id} className="option-item">
                      <input
                        type="radio"
                        name="goal"
                        value={goal.goal_id}
                        checked={selectedGoal === goal.goal_id}
                        onChange={() => setSelectedGoal(goal.goal_id)}
                      />
                      <span>{goal.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="link-options">
              <h4>Select a Note:</h4>
              {notes.length === 0 ? (
                <p>No notes available</p>
              ) : (
                <div className="options-list">
                  {notes.map(note => (
                    <label key={note.note_id} className="option-item">
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
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleLink}
            disabled={
              (activeTab === 'goals' && !selectedGoal) || 
              (activeTab === 'notes' && !selectedNote)
            }
          >
            Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;