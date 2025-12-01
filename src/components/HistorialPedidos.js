import React, { useEffect, useState, useCallback } from "react";
import "../styles/HistorialPedidos.css";

export default function HistorialPedidos({ usuario, onCerrar, API_URL = "http://localhost:5000/api" }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = useCallback(async () => {
    if (!usuario?.email) return;
    try {
      const res = await fetch(`${API_URL}/pedidos/historial/${usuario.email}`);
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error(err);
      alert("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, [usuario?.email, API_URL]);

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, [cargarPedidos]);

  if (loading) return <p className="loading-text">Cargando pedidos...</p>;
  if (!pedidos.length) return <p className="loading-text">No tienes pedidos aún.</p>;

  return (
    <div className="historial-container">
      {/* ENCABEZADO */}
      <div className="historial-header">
        <h2>Mis Pedidos</h2>
      </div>

      {/* SCROLL DE PEDIDOS */}
      <div className="pedidos-scroll">
        {pedidos.map((pedido) => (
          <div key={pedido._id} className="pedido-card">
            <div className="pedido-header">
              <h3>Pedido #{pedido._id.slice(-6)}</h3>
              <span className={`estado estado-${pedido.estado.toLowerCase()}`}>{pedido.estado}</span>
            </div>

            <div className="pedido-info">
              <p><strong>Comprador:</strong> {pedido.usuario}</p>
              <p><strong>Total:</strong> ${pedido.total?.toFixed(2)}</p>
              <p><strong>Método de pago:</strong> {pedido.metodoPago || "Efectivo"}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
            </div>

            <div className="productos">
              {(pedido.productos || []).map((prod, idx) => (
                <div key={idx} className="producto-item">
                  <img
                    src={prod.imagen || "/fallback.png"}
                    alt={prod.nombre}
                    className="producto-img"
                  />
                  <div className="producto-detalles">
                    <p className="prod-nombre">{prod.nombre}</p>
                    <p>Cantidad: {prod.cantidad}</p>
                    <p>Precio: ${prod.precio.toFixed(2)}</p>
                    {prod.descripcionPersonalizada && <p className="prod-desc">📝 {prod.descripcionPersonalizada}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN CERRAR */}
      <div className="historial-footer">
        <button className="btn-cerrar" onClick={onCerrar}>Salir</button>
      </div>
    </div>
  );
} 
