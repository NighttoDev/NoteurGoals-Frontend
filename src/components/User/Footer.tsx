import "../../assets/css/footer.css";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="user-footer">
      <div className="user-footer-content">
        <span className="user-footer-title">NoteurGoals</span>
        <span className="user-footer-divider" />
        <span className="user-footer-desc">
          Designed by <b>PSIX</b> &mdash; Note to Get Your Goal
        </span>
      </div>
    </footer>
  );
};

export default Footer;
