// src/components/ProductoCard.js
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import "../styles/VendedorDashboard.css";

export default function ProductoCard({ producto, onEditar, onEliminar }) {
  return (
    <article className="vd-product-card">
      <img
        src={producto.imagen || "https://via.placeholder.com/300"}
        alt={producto.nombre}
      />

      <div className="vd-p-info">
        <h3>{producto.nombre}</h3>
        <p className="vd-p-desc">{producto.descripcion}</p>
        <p><b>Categoría:</b> {producto.categoria}</p>
        <p><b>Precio:</b> ${producto.precio}</p>
        <p><b>Stock:</b> {producto.stock}</p>
      </div>

      <div className="vd-p-actions">
        <button className="btn-edit" onClick={() => onEditar(producto)}>
          <Edit size={14} /> Editar
        </button>

        <button className="btn-delete" onClick={() => onEliminar(producto._id)}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </article>
  );
}
