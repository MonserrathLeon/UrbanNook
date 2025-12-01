// src/components/Productos/ListaProductos.jsx
import React from "react";
import ProductoCard from "./ProductoCard";

export default function ListaProductos({ productos, onEditar, onEliminar }) {
  if (!productos || productos.length === 0) {
    return <p>No tienes productos aún.</p>;
  }

  return (
    <div className="vd-product-grid">
      {productos.map((p) => (
        <ProductoCard
          key={p._id}
          producto={p}
          onEditar={() => onEditar?.(p)}
          onEliminar={() => onEliminar?.(p._id)}
        />
      ))}
    </div>
  );
}
