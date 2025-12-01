// src/components/NavbarVD.js
import React, { useState } from "react";
import { Bell, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/UrbanLogo.PNG";
import "../styles/VendedorDashboard.css";

export default function NavbarVD({
  usuario = {},
  notificaciones = [],
  setNotificaciones, // ✅ ahora sí lo recibimos
  mensajes = [],
}) {
  const navigate = useNavigate();
  const [mostrarNoti, setMostrarNoti] = useState(false);
  const [notis, setNotis] = useState(notificaciones);

  // Actualizar localmente si las notificaciones cambian desde el dashboard
  React.useEffect(() => {
    setNotis(notificaciones);
  }, [notificaciones]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/loginregister");
  };

  const borrarNoti = (id) => {
    const nuevas = notis.filter((n) => n._id !== id);
    setNotis(nuevas); // actualizar localmente
    setNotificaciones?.(nuevas); // actualizar en dashboard
  };

  const borrarTodas = () => {
    setNotis([]);
    setNotificaciones?.([]);
  };

  return (
    <header className="vd-navbar">
      <div className="vd-left">
        <img src={logo} alt="UrbanNook" className="vd-logo" />
        <h1>UrbanNook</h1>
      </div>

      <div className="vd-actions">
        <div className="vd-noti-wrapper">
          <button
            className="icon-btn"
            title="Notificaciones"
            onClick={() => setMostrarNoti(!mostrarNoti)}
          >
            <Bell size={20} />
            {notis.length > 0 && <span className="vd-badge">{notis.length}</span>}
          </button>

          {mostrarNoti && (
            <div className="vd-floating-noti vd-scroll">
              {notis.length === 0 ? (
                <p className="vd-note">No tienes notificaciones.</p>
              ) : (
                <>
                  {notis.map((noti) => (
                    <div key={noti._id} className="vd-note">
                      <div className="vd-note-header">
                        <strong>{noti.titulo}</strong>
                        <button
                          className="vd-delete-btn"
                          onClick={() => borrarNoti(noti._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p>{noti.mensaje}</p>
                      <small>{new Date(noti.fecha).toLocaleString()}</small>
                    </div>
                  ))}
                  <button className="vd-delete-all" onClick={borrarTodas}>
                    Borrar todas
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="vd-profile-inline">
          <img
            src={usuario.imagen || "https://via.placeholder.com/48"}
            alt="perfil"
            className="vd-profile-pic"
          />
          <span className="vd-username">{usuario.nombre || "Vendedor"}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </header>
  );
}
