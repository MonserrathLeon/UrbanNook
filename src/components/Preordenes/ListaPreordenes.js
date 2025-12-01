// src/components/Preordenes/ListaPreordenes.js
import React, { useState, useEffect, useCallback } from "react";
import PreordenCard from "./PreordenCard";
import "../../styles/ListaPreordenes.css"; // tus estilos actuales

export default function ListaPreordenes({ preordenes: preordenesIniciales, onActualizarEstado, usuario }) {
  const [preordenes, setPreordenes] = useState(preordenesIniciales || []);

  // Sincroniza cuando llegan nuevas preórdenes
  useEffect(() => {
    setPreordenes(preordenesIniciales || []);
  }, [preordenesIniciales]);

  // Manejo de actualización de estado en tiempo real
  const handleActualizarEstado = useCallback(async (id, estado) => {
    if (onActualizarEstado) {
      await onActualizarEstado(id, estado);
    }
  }, [onActualizarEstado]);

  if (!preordenes || preordenes.length === 0) return <p>No hay preórdenes aún.</p>;

  return (
    <div className="vd-preorden-lista">
      {preordenes.map((p) => (
        <PreordenCard
          key={p._id}
          preorden={p}
          usuario={usuario}
          onActualizarEstado={handleActualizarEstado}
        />
      ))}
    </div>
  );
}

