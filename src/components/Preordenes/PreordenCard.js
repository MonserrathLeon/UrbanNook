// src/components/Preordenes/PreordenCard.js
import React, { useState } from "react";
import "../../styles/ListaPreordenes.css";

export default function PreordenCard({ preorden, usuario, onActualizarEstado }) {
  const {
    productoNombre,
    imagen,
    descripcionPersonalizada,
    cantidad,
    precioBase,
    recargoPersonalizado,
    total,
    estado,
    usuario: cliente,
    direccion,
    metodoPago,
  } = preorden;

  const [mostrarDireccion, setMostrarDireccion] = useState(false);

  // Solo el vendedor puede cambiar estado
  const puedeCambiarEstado = usuario?.email && usuario.email === preorden.vendedor;

  const estadosDisponibles = ["Pendiente", "Aprobada", "En proceso", "En camino", "Entregada", "Rechazada"];

  return (
    <div className="vd-preorden-card">
      {/* IMAGEN */}
      <div className="vd-preorden-left">
        <img
          src={imagen || "https://via.placeholder.com/120"}
          alt={productoNombre}
          className="vd-preorden-img"
        />
      </div>

      {/* INFO */}
      <div className="vd-preorden-right">
        <p><b>Producto:</b> {productoNombre}</p>
        {descripcionPersonalizada && <p><b>Descripción personalizada:</b> {descripcionPersonalizada}</p>}
        <p><b>Cantidad:</b> {cantidad}</p>
        <p><b>Precio base:</b> ${precioBase}</p>
        {recargoPersonalizado > 0 && <p><b>Recargo:</b> ${recargoPersonalizado}</p>}
        <p><b>Total:</b> ${total}</p>
        <p><b>Estado:</b> {estado}</p>
        <p><b>Cliente:</b> {cliente}</p>
        <p><b>Método de pago:</b> {metodoPago || "Efectivo"}</p>

        {/* DIRECCIÓN */}
        {direccion && (
          <>
            <button
              className="btn-direccion"
              onClick={() => setMostrarDireccion(!mostrarDireccion)}
            >
              {mostrarDireccion ? "Ocultar dirección" : "Mostrar dirección"}
            </button>
            {mostrarDireccion && (
              <div className="direccion">
                <p>
                  {direccion.calle} {direccion.numero}, {direccion.colonia}<br/>
                  {direccion.ciudad}, {direccion.estado}, {direccion.pais}, {direccion.codigoPostal}
                </p>
              </div>
            )}
          </>
        )}

        {/* BOTONES PARA CAMBIAR ESTADO */}
        {puedeCambiarEstado && (
          <div className="vd-preorden-buttons">
            {estadosDisponibles.map((e) =>
              e !== estado ? (
                <button
                  key={e}
                  onClick={() => onActualizarEstado(preorden._id, e)}
                  className={`btn-estado btn-${e.replace(/\s/g, "").toLowerCase()}`}
                >
                  {e}
                </button>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
