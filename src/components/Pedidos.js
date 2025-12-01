// src/components/Pedidos.js
import React, { useState, useEffect } from "react";

export default function Pedidos({ usuario, onClose }) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const obtenerPedidos = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pedidos/${usuario.email}`);
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      }
    };

    if (usuario?.email) {
      obtenerPedidos();
    }
  }, [usuario.email]);

  // Si no hay pedidos
  if (!pedidos || pedidos.length === 0) {
    return (
      <div>
        <h2>Mis pedidos</h2>
        <p>No tienes pedidos 😅</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Mis pedidos</h2>

      <ul>
        {pedidos.map((p) => (
          <li key={p._id}
              style={{
                marginBottom: "12px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px"
              }}>

            <p><b>ID del pedido:</b> {p._id}</p>
            <p><b>Estado:</b> {p.estado}</p>
            <p><b>Total:</b> ${p.total}</p>
            <p><b>Método de pago:</b> {p.metodoPago}</p>

            <p><b>Fecha:</b> {new Date(p.fecha).toLocaleString()}</p>

            {/* Dirección */}
            {p.direccion && (
              <div style={{ marginTop: "5px" }}>
                <p><b>Dirección:</b></p>
                <p>
                  {p.direccion.calle} #{p.direccion.numero}, {p.direccion.colonia}
                </p>
                <p>
                  {p.direccion.ciudad}, {p.direccion.estado}, {p.direccion.pais}
                </p>
                <p>Código Postal: {p.direccion.codigoPostal}</p>
              </div>
            )}

            {/* Productos */}
            <p><b>Productos:</b></p>
            <ul>
              {p.productos.map((prod, idx) => (
                <li key={idx}>
                  {prod.nombre} x{prod.cantidad} – ${prod.precio}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}
