import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "var(--primary-main)",
        padding: "5px",
        textAlign: "center",
        zIndex: 1000,
        opacity: 0.8,
      }}
      className="footer"
    >
      <p>Designed by PSIX - Note to Get Your Goal</p>
    </footer>
  );
};

export default Footer;
