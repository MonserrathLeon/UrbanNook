// src/components/PedidoCard.js
import React from "react";
import "../styles/VendedorDashboard.css";

export default function PedidoCard({ pedido, tipo, onActualizarEstado }) {
  // Para pedidos normales: asumimos que "pedido.productos" es un array
  const productos = pedido.productos || [];

  return (
    <div className="vd-order-card">
      <div className="vd-order-info">
        <p><b>Cliente:</b> {pedido.usuario}</p>

        {/* Para preórdenes */}
        {tipo === "preorden" && (
          <div className="vd-productos-list">
            {productos.length > 0
              ? productos.map((p, idx) => (
                  <div key={idx} className="vd-producto-item">
                    <img
                      src={p.imagen || "https://via.placeholder.com/60"}
                      alt={p.nombre}
                      className="vd-producto-img"
                    />
                    <div>
                      <p>{p.nombre}</p>
                      <small>x{p.cantidad}</small>
                    </div>
                  </div>
                ))
              : (
                <div className="vd-producto-item">
                  <img
                    src={pedido.imagen || "https://via.placeholder.com/60"}
                    alt={pedido.productoNombre}
                    className="vd-producto-img"
                  />
                  <div>
                    <p>{pedido.productoNombre || "Sin nombre"}</p>
                    <small>{pedido.descripcionPersonalizada || "Sin detalle"}</small>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Para pedidos normales */}
        {tipo !== "preorden" && productos.length > 0 && (
          <div className="vd-productos-list">
            {productos.map((p, idx) => (
              <div key={idx} className="vd-producto-item">
                <img
                  src={p.imagen || pedido.imagen || "https://via.placeholder.com/60"}
                  alt={p.nombre || pedido.productoNombre}
                  className="vd-producto-img"
                />
                <div>
                  <p>{p.nombre || pedido.productoNombre || "Sin nombre"}</p>
                  <small>x{p.cantidad || pedido.cantidad}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <p><b>Total:</b> ${pedido.total}</p>
        <p><b>Estado:</b> {pedido.estado}</p>
      </div>

      <div className="vd-order-actions">
        {/* Dropdown para pedidos normales */}
        {tipo !== "preorden" && (
          <select
            value={pedido.estado}
            onChange={(e) => onActualizarEstado(pedido._id, e.target.value, tipo)}
          >
            <option>Pedido recibido</option>
            <option>En camino</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </select>
        )}

        {/* Botones para preórdenes */}
        {tipo === "preorden" && onActualizarEstado && (
          <div className="vd-preorden-buttons">
            {["Pendiente", "Aprobada", "Rechazada", "En proceso", "Entregada"].map((estado) =>
              pedido.estado !== estado ? (
                <button
                  key={estado}
                  onClick={() => onActualizarEstado(pedido._id, estado, "preorden")}
                  className="btn-edit"
                >
                  {estado === "Entregada" ? "Marcar como entregada" : estado}
                </button>
              ) : null
            )}
          </div>
        )}

        <small>{new Date(pedido.fecha || Date.now()).toLocaleString()}</small>
      </div>
    </div>
  );
}
