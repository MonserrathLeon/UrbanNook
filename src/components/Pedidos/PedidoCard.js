import React, { useState } from "react";
import "../../styles/ListaPedidos.css";

export default function PedidoCard({ pedido, onActualizarEstado }) {
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const productos = pedido.productos || [];
  const direccion = pedido.direccion || {};

  return (
    <div className="pedido-card">
      {/* Header */}
      <div className="pedido-header">
        <h3>Pedido: {pedido._id}</h3>
        <span className={`estado estado-${pedido.estado.toLowerCase()}`}>
          {pedido.estado}
        </span>
      </div>

      {/* Cliente */}
      <p>
        <strong>Cliente:</strong> {pedido.usuario}
      </p>

      {/* Botón para mostrar/ocultar dirección */}
      <button
        className="btn-direccion"
        onClick={() => setMostrarDireccion(!mostrarDireccion)}
      >
        {mostrarDireccion ? "Ocultar dirección" : "Mostrar dirección"}
      </button>

      {/* Dirección */}
      {mostrarDireccion && (
        <div className="direccion">
          <p>
            {direccion.calle} {direccion.numero}, {direccion.colonia},<br />
            {direccion.ciudad}, {direccion.estado}, {direccion.pais},{" "}
            {direccion.codigoPostal}
          </p>
        </div>
      )}

      {/* Productos */}
      <div className="productos">
        {productos.map((p, idx) => (
          <div key={idx} className="producto-item">
            {/* 🔥 IMG cuadrada */}
            <div className="producto-img-wrapper">
              <img
                src={p.imagen || "https://via.placeholder.com/300"}
                alt={p.nombre}
                className="producto-img"
              />
            </div>

            {/* Info */}
            <div className="producto-detalles">
              <p>
                <strong>{p.nombre}</strong>
              </p>
              <p>Cantidad: {p.cantidad}</p>
              <p>Precio: ${p.precio.toFixed(2)}</p>
              {p.descripcionPersonalizada && (
                <p>Descripción: {p.descripcionPersonalizada}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total y método de pago */}
      <p>
        <strong>Total:</strong> ${pedido.total.toFixed(2)}
      </p>
      <p>
        <strong>Método de pago:</strong> {pedido.metodoPago}
      </p>
      <p>
        <strong>Fecha:</strong>{" "}
        {new Date(pedido.fecha || Date.now()).toLocaleString()}
      </p>

      {/* Selector de estado */}
      {onActualizarEstado && (
        <div className="acciones">
          <label>Actualizar estado:</label>
          <select
            value={pedido.estado}
            onChange={(e) => onActualizarEstado(pedido._id, e.target.value)}
          >
            <option>Pendiente</option>
            <option>Enviado</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </select>
        </div>
      )}
    </div>
  );
}
