import React from "react";
import { Edit, Trash2 } from "lucide-react";
import '../../styles/ProductoCard.css';

export default function ProductoCard({ producto, onEditar, onEliminar }) {
  return (
    <article className="producto-card">
      <div className="producto-img-wrapper">
        <img
          src={producto.imagen || "https://via.placeholder.com/300"}
          alt={producto.nombre}
          className="producto-img"
        />
      </div>

      <div className="producto-info">
        <h3>{producto.nombre}</h3>
        <p className="producto-desc">{producto.descripcion}</p>
        <p><b>Categoría:</b> {producto.categoria}</p>
        <p><b>Precio:</b> ${producto.precio}</p>
        <p><b>Stock:</b> {producto.stock}</p>
      </div>

      <div className="producto-actions">
        <button className="btn-edit" onClick={() => onEditar(producto)}>
          <Edit size={16} /> Editar
        </button>

        <button className="btn-delete" onClick={() => onEliminar(producto._id)}>
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </article>
  );
}
