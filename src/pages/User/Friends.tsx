import React from "react";
import { FaEnvelope } from "react-icons/fa";
import "../../assets/css/User/friends.css";

interface FriendCardProps {
  image: string;
  name: string;
  role: string;
}

const FriendCard: React.FC<FriendCardProps> = ({ image, name, role }) => {
  return (
    <div className="friend-card">
      <img src={image} alt={`${name}'s Avatar`} />
      <h3>{name}</h3>
      <p>{role}</p>
      <button className="primary-button">View Profile</button>
    </div>
  );
};

const Friends: React.FC = () => {
  const teamMembers = [
    {
      image: "https://i.pravatar.cc/150?img=1",
      name: "Alex Johnson",
      role: "Lead Developer",
    },
    {
      image: "https://i.pravatar.cc/150?img=2",
      name: "Maria Garcia",
      role: "UI/UX Designer",
    },
    {
      image: "https://i.pravatar.cc/150?img=3",
      name: "David Chen",
      role: "Project Manager",
    },
    {
      image: "https://i.pravatar.cc/150?img=4",
      name: "Sophia Williams",
      role: "Marketing Specialist",
    },
  ];

  return (
    <main className="page-content">
      <div className="page-header">
        <h1>My Team</h1>
        <button className="primary-button">
          <FaEnvelope /> Invite Member
        </button>
      </div>
      <div className="friends-grid">
        {teamMembers.map((member, index) => (
          <FriendCard
            key={index}
            image={member.image}
            name={member.name}
            role={member.role}
          />
        ))}
      </div>
    </main>
  );
};

export default Friends;
