import React, { useEffect, useState, useCallback } from "react";
import "../../styles/ListaPedidos.css";

export default function ListaPedidos({ pedidos: pedidosIniciales, onActualizarEstado }) {
  const [pedidos, setPedidos] = useState(pedidosIniciales || []);
  const [mostrarDireccion, setMostrarDireccion] = useState({}); 

  // Sync cuando llegan nuevos pedidos
  useEffect(() => {
    setPedidos(pedidosIniciales);
  }, [pedidosIniciales]);

  const toggleDireccion = (id) => {
    setMostrarDireccion(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleActualizarEstado = useCallback(async (id, estado) => {
    if (onActualizarEstado) {
      await onActualizarEstado(id, estado);
    }
  }, [onActualizarEstado]);

  if (!pedidos || pedidos.length === 0) return <p>No hay pedidos aún.</p>;

  return (
    <div className="vd-lista-pedidos">
      {pedidos.map((pedido) => {
        const productos = pedido.productos || [];
        const direccion = pedido.direccion || {};

        return (
          <div key={pedido._id} className="pedido-card">
            
            {/* HEADER */}
            <div className="pedido-header">
              <h3>Pedido #{pedido._id.slice(-6)}</h3>
              <span className={`estado estado-${pedido.estado.toLowerCase()}`}>
                {pedido.estado}
              </span>
            </div>

            {/* INFO DEL CLIENTE */}
            <div className="pedido-info">
              <p><strong>Comprador:</strong> {pedido.usuario}</p>
              <p><strong>Total:</strong> ${pedido.total?.toFixed(2)}</p>
              <p><strong>Método de pago:</strong> {pedido.metodoPago || "Efectivo"}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
            </div>

            {/* DIRECCIÓN */}
            <button
              className="btn-direccion"
              onClick={() => toggleDireccion(pedido._id)}
            >
              {mostrarDireccion[pedido._id] ? "Ocultar dirección" : "Mostrar dirección"}
            </button>

            {mostrarDireccion[pedido._id] && (
              <div className="direccion">
                <p>
                  {direccion.calle} {direccion.numero}, {direccion.colonia}<br/>
                  {direccion.ciudad}, {direccion.estado}, {direccion.pais}, {direccion.codigoPostal}
                </p>
              </div>
            )}

            {/* LISTA DE PRODUCTOS */}
            <div className="productos">
              {productos.map((prod, index) => (
                <div key={index} className="producto-item">
                  <img
                    src={prod.imagen || "https://via.placeholder.com/80"}
                    alt={prod.nombre}
                    className="producto-img"
                  />
                  <div className="producto-detalles">
                    <p className="prod-nombre">{prod.nombre}</p>
                    <p>Cantidad: {prod.cantidad}</p>
                    <p>Precio: ${prod.precio.toFixed(2)}</p>
                    {prod.descripcionPersonalizada && (
                      <p className="prod-desc">📝 {prod.descripcionPersonalizada}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* BOTONES DE ESTADO */}
            {onActualizarEstado && (
              <div className="acciones-estado">
                {["Pendiente", "Enviado", "Entregado", "Cancelado"].map((opc) => (
                  <button
                    key={opc}
                    disabled={pedido.estado === opc}
                    onClick={() => handleActualizarEstado(pedido._id, opc)}
                    className={`btn-estado btn-${opc.toLowerCase()}`}
                  >
                    {opc}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
