import React from "react";
import ProductoCard from "./ProductoCard";

export default function ProductoGrid({ productos, onEditar, onEliminar }) {
  return (
    <div className="producto-grid">
      {productos.map((p) => (
        <ProductoCard
          key={p._id}
          producto={p}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
