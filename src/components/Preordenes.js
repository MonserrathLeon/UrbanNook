// src/components/Preordenes.js
import React, { useState, useEffect } from "react";
import "../styles/ListaPreordenes.css"; // tus estilos

export default function Preordenes({ usuario, preordenes }) {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    setLista(Array.isArray(preordenes) ? preordenes : []);
  }, [preordenes]);

  return (
    <div className="preordenes-container">
      <h2 className="preordenes-title">Mis Preórdenes</h2>

      {lista.length === 0 ? (
        <p className="preordenes-empty">No tienes preórdenes realizadas.</p>
      ) : (
        <div className="preordenes-grid">
          {lista.map((p) => (
            <div key={p._id} className="preorden-card">
              {/* IZQUIERDA: Imagen */}
              <div className="preorden-left">
                <img
                  src={p.imagen || "https://via.placeholder.com/120"}
                  alt={p.productoNombre}
                  className="preorden-img"
                />
              </div>

              {/* CENTRO: Info del producto */}
              <div className="preorden-center">
                <h3 className="preorden-producto">{p.productoNombre}</h3>
                {p.descripcionPersonalizada && (
                  <p className="preorden-detalle">{p.descripcionPersonalizada}</p>
                )}
                <p className="preorden-cantidad">Cantidad: {p.cantidad}</p>
                <p className="preorden-total">Total: ${p.total}</p>
              </div>

              {/* DERECHA: Estado y vendedor */}
              <div className="preorden-right">
                <span className={`preorden-estado estado-${p.estado.toLowerCase()}`}>
                  {p.estado}
                </span>
                <p className="preorden-vendedor">Vendedor: {p.vendedor}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
