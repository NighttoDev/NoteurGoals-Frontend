import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/User/CollaboratorList.css"; // Assuming you have a CSS file for styling

interface Collaborator {
  collab_id: string;
  user_id: string;
  name: string;
  avatar: string;
  role: string;
}

interface CollaboratorListProps {
  collaborators: Collaborator[];
  onRemove: (userId: string) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  onRemove,
}) => {
  if (collaborators.length === 0) {
    return <p className="no-collaborators">No collaborators yet.</p>;
  }

  return (
    <div className="collaborator-list">
      {collaborators.map((collaborator) => (
        <div key={collaborator.collab_id} className="collaborator-item">
          <img
            src={collaborator.avatar}
            alt={collaborator.name}
            className="collaborator-avatar"
          />
          <div className="collaborator-info">
            <span className="collaborator-name">{collaborator.name}</span>
            <span className="collaborator-role">{collaborator.role}</span>
          </div>
          <button
            className="remove-collaborator"
            onClick={() => onRemove(collaborator.user_id)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CollaboratorList;
