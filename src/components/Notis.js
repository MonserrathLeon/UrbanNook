import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import "../styles/Notis.css";

export default function Notis({ mensaje, tipo = "ok", onClose, duration = 2500 }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const Icon =
    tipo === "ok" ? CheckCircle :
    tipo === "error" ? AlertCircle :
    Info;

  return (
    <div className={`notificacion noti-${tipo}`}>
      <div className="noti-icon"><Icon size={18} /></div>
      <div className="noti-text">{mensaje}</div>

      <button
        className="noti-close"
        onClick={() => onClose?.()}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
