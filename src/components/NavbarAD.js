// src/components/NavbarAD.js
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Urban.png";
import "../styles/AdminDashboard.css";

export default function NavbarAD({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    if (onLogout) onLogout();
    navigate("/loginregister");
  };

  return (
    <header className="navbar-admin">
      <div className="logo-section">
        <img src={logo} alt="UrbanNook" />
        <span>UrbanNook</span>
      </div>

      <div className="actions">
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
