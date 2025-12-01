// src/components/Notificaciones.js
import React from "react";
import "../styles/Notificaciones.css";

export default function Notificaciones({ usuario, notificaciones, setNotificaciones, onCerrar }) {
  // Asegurarnos de que notificaciones siempre sea un array
  const notisArray = Array.isArray(notificaciones) ? notificaciones : [];

  // Función para borrar todas las notificaciones
  const borrarTodas = () => {
    if (window.confirm("¿Seguro que quieres borrar todas las notificaciones?")) {
      setNotificaciones([]);
    }
  };

  // Función para borrar una notificación individual
  const borrarUna = (id) => {
    if (window.confirm("¿Seguro que quieres borrar esta notificación?")) {
      setNotificaciones(notisArray.filter((n) => n._id !== id));
    }
  };

  return (
    <div className="noti-floating-overlay">
      <div className="noti-floating-modal">
        <div className="noti-header">
          <h2>Notificaciones</h2>
          <button className="cerrar-btn" onClick={onCerrar}>×</button>
        </div>

        {notisArray.length === 0 ? (
          <p className="no-notificaciones">No tienes notificaciones 😅</p>
        ) : (
          <>
            <div className="noti-scroll">
              <ul className="notificaciones-list">
                {notisArray.map((n) => (
                  <li key={n._id} className="noti-item">
                    <div className="noti-texto">
                      <strong className="titulo">{n.titulo}</strong>
                      <p className="mensaje">{n.mensaje}</p>
                      <small className="fecha">{new Date(n.fecha).toLocaleString()}</small>
                    </div>
                    <button className="borrar-btn-individual" onClick={() => borrarUna(n._id)}>✕</button>
                  </li>
                ))}
              </ul>
            </div>
            <button className="borrar-todas-btn" onClick={borrarTodas}>
              Borrar todas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

