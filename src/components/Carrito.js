// src/components/Carrito.js
import React, { useEffect, useState, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import "../styles/Carrito.css";

export default function Carrito({
  usuario,
  carrito,
  setCarrito,
  onRegresar,
  onNuevoPedido,
  API_URL = "http://localhost:5000/api",
}) {
  const [total, setTotal] = useState(0);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState("");

  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);

  const [direccion, setDireccion] = useState({
    pais: "",
    estado: "",
    ciudad: "",
    calle: "",
    numero: "",
    colonia: "",
    codigoPostal: "",
  });

  const [metodoPago, setMetodoPago] = useState("");
  const [pagoInfo, setPagoInfo] = useState({});
  const [comprobante, setComprobante] = useState(null);

  // ---------------- NOTIFICACIONES ----------------
  const [notis, setNotis] = useState([]);
  const agregarNoti = (mensaje, tipo = "ok", duration = 2500) => {
    const id = Date.now();
    setNotis((prev) => [...prev, { id, mensaje, tipo, duration }]);
  };
  const eliminarNoti = (id) => setNotis((prev) => prev.filter((n) => n.id !== id));

  const API_DIRECCIONES = `${API_URL}/direcciones`;

  // ================= TOTAL =================
  useEffect(() => {
    const nuevoTotal = carrito.reduce(
      (acc, item) => acc + (item.precio ?? 0) * (item.cantidad ?? 1),
      0
    );
    setTotal(nuevoTotal);
  }, [carrito]);

  // ================= CANTIDADES =================
  const aumentarCantidad = (id) =>
    setCarrito(
      carrito.map((i) =>
        i._id === id ? { ...i, cantidad: (i.cantidad ?? 1) + 1 } : i
      )
    );

  const disminuirCantidad = (id) =>
    setCarrito(
      carrito
        .map((i) =>
          i._id === id && (i.cantidad ?? 1) > 1
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        )
        .filter((i) => (i.cantidad ?? 0) > 0)
    );

  const eliminarDelCarrito = (id) =>
    setCarrito(carrito.filter((i) => i._id !== id));

  // ================= DIRECCIONES =================
  const obtenerDirecciones = useCallback(async () => {
    if (!usuario?._id) return;
    try {
      const res = await fetch(`${API_DIRECCIONES}/usuario/${usuario._id}`);
      if (!res.ok) throw new Error("Error cargando direcciones");
      const data = await res.json();
      setDirecciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Error cargando direcciones");
    }
  }, [usuario?._id, API_DIRECCIONES]);

  useEffect(() => {
    if (mostrarDireccion) obtenerDirecciones();
  }, [mostrarDireccion, obtenerDirecciones]);

  const handleSeleccionDireccion = (dir) => {
    setDireccionSeleccionada(dir);
    setDireccion({ ...dir });
  };

  const handleNuevaDireccionChange = (e) => {
    const { name, value } = e.target;
    setDireccion((prev) => ({ ...prev, [name]: value }));
  };

  const validarDireccion = () => {
    const { pais, estado, ciudad, calle, numero, colonia, codigoPostal } =
      direccion;
    if (
      !pais ||
      !estado ||
      !ciudad ||
      !calle ||
      !colonia ||
      !numero ||
      !codigoPostal
    ) {
      setErrorDireccion("⚠️ Todos los campos son obligatorios");
      return false;
    }
    if (isNaN(numero) || isNaN(codigoPostal)) {
      setErrorDireccion("⚠️ Número y Código Postal deben ser numéricos");
      return false;
    }
    setErrorDireccion("");
    return true;
  };

  const guardarDireccion = async () => {
    if (!validarDireccion()) return;

    try {
      const url = `${API_DIRECCIONES}/agregar`;
      const body = { usuarioId: usuario._id, ...direccion };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("No se pudo guardar la dirección");

      alert("Dirección guardada con éxito");
      setDireccion({
        pais: "",
        estado: "",
        ciudad: "",
        calle: "",
        numero: "",
        colonia: "",
        codigoPostal: "",
      });
      obtenerDirecciones();
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo guardar la dirección");
    }
  };

  // ================= VALIDAR PAGO =================
  const validarPago = () => {
    if (!metodoPago) return alert("Selecciona un método de pago");

    if (metodoPago === "Tarjeta") {
      const { numeroTarjeta, nombreTitular, vencimiento, cvv } = pagoInfo;
      if (!numeroTarjeta || !nombreTitular || !vencimiento || !cvv) {
        agregarNoti("Completa todos los campos de la tarjeta", "error");
        return false;
      }
    }

    if (metodoPago === "PayPal") {
      if (!pagoInfo.paypalEmail) {
        agregarNoti("Ingresa tu email de PayPal", "error");
        return false;
      }
    }

    if (!direccionSeleccionada && !validarDireccion()) return false;

    if (carrito.length === 0) {
      agregarNoti("Tu carrito está vacío", "error");
      return false;
    }

    // Validación: todos los productos deben tener vendedor
    const sinVendedor = carrito.some((p) => !p.vendedor);
    if (sinVendedor) {
      agregarNoti("❌ Error: todos los productos deben tener vendedor asignado", "error");
      return false;
    }

    return true;
  };

  // ================= FINALIZAR PAGO =================
  const handleFinalizarPago = async () => {
    if (!validarPago()) return;

    try {
      if (!carrito.length) throw new Error("El carrito está vacío");

      // Asumimos que todos los productos tienen el mismo vendedor
      const vendedorEmail = carrito[0].vendedor || "vendedor_default@gmail.com";

      // Asegurarnos de que haya dirección
      const direccionFinal = direccionSeleccionada || direccion;
      if (!direccionFinal) throw new Error("No hay dirección seleccionada");

      const bodyPedido = {
        usuario: usuario?.email ?? "invitado",
        vendedor: vendedorEmail,
        productos: carrito.map((p) => ({
          nombre: p.nombre,
          cantidad: p.cantidad ?? 1,
          precio: p.precio ?? 0,
          descripcionPersonalizada: p.descripcionPersonalizada ?? null,
          imagen: p.imagen || "https://via.placeholder.com/60", // <-- enviamos la imagen
          vendedor: vendedorEmail, // <- importante para que el backend no falle
        })),
        total:
          total ??
          carrito.reduce(
            (acc, p) => acc + (p.precio ?? 0) * (p.cantidad ?? 1),
            0
          ),
        direccion: {
          calle: direccionFinal.calle || "",
          numero: direccionFinal.numero || "",
          colonia: direccionFinal.colonia || "",
          ciudad: direccionFinal.ciudad || "",
          estado: direccionFinal.estado || "",
          pais: direccionFinal.pais || "",
          codigoPostal: direccionFinal.codigoPostal || "",
        },
        metodoPago: metodoPago || "Efectivo",
        pagoInfo: metodoPago === "Efectivo" ? null : pagoInfo || null,
        estado: "Pendiente",
        fecha: new Date(),
      };

      // 1️⃣ Crear pedido
      const resPedido = await fetch(`${API_URL}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPedido),
      });

      if (!resPedido.ok) {
        const data = await resPedido.json();
        throw new Error(data.mensaje || "Error al crear el pedido");
      }

      // 2️⃣ Notificación comprador
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuario?.email || "invitado",
          titulo: "Pedido realizado",
          mensaje: `Tu pedido de $${(bodyPedido.total ?? 0).toFixed(
            2
          )} ha sido realizado con éxito.`,
        }),
      });

      // 3️⃣ Notificación vendedor
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: vendedorEmail,
          titulo: "Nuevo pedido recibido",
          mensaje: `📦 Nuevo pedido de ${usuario?.email || "invitado"} por $${(
            bodyPedido.total ?? 0
          ).toFixed(2)}`,
        }),
      });


      // Mostrar comprobante
      setComprobante(bodyPedido);
      setCarrito([]);
      setMostrarPago(false);
      setMostrarDireccion(false);
      onNuevoPedido?.();

      agregarNoti("✅ Pedido realizado con éxito", "ok");
    } catch (err) {
      console.error("Error al finalizar pago:", err);
      agregarNoti(`❌ Error al procesar la compra: ${err.message}`, "error");
    }
  };

  // ================= RENDER =================
  return (
    <div className="carrito-overlay">
      <div className="carrito-popup">
        <button className="regresar-btn" onClick={onRegresar}>
          ← Regresar
        </button>

        <h2 className="carrito-titulo">Tu Carrito</h2>

        {carrito.length === 0 ? (
          <p className="carrito-vacio">No tienes productos en tu carrito</p>
        ) : (
          <>
            <div className="carrito-scroll">
              <table className="carrito-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {carrito.map((item) => (
                    <tr key={item._id}>
                      <td className="producto-nombre">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="producto-img"
                        />
                        <span>
                          {item.nombre}
                          {item.descripcionPersonalizada && (
                            <p className="personalizado-descripcion">
                              Personalizado: {item.descripcionPersonalizada}
                            </p>
                          )}
                        </span>
                      </td>
                      <td>${(item.precio ?? 0).toFixed(2)}</td>
                      <td>
                        <div className="cantidad-controles">
                          <button onClick={() => disminuirCantidad(item._id)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.cantidad ?? 1}</span>
                          <button onClick={() => aumentarCantidad(item._id)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        $
                        {((item.precio ?? 0) * (item.cantidad ?? 1)).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="eliminar-btn"
                          onClick={() => eliminarDelCarrito(item._id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="carrito-footer">
              <span className="total-text">Total: ${total.toFixed(2)}</span>
              <button
                className="comprar-btn"
                onClick={() => setMostrarDireccion(true)}
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}

        {/* MODAL DIRECCIÓN */}
        {mostrarDireccion && (
          <div
            className="modal-overlay"
            onClick={() => setMostrarDireccion(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Dirección de envío</h2>
              {errorDireccion && <p className="error-text">{errorDireccion}</p>}

              {direcciones.length === 0 ? (
                <>
                  <p>No tienes direcciones guardadas. Agrega una nueva:</p>
                  <div className="form-direccion">
                    {Object.keys(direccion).map((campo) => (
                      <input
                        key={campo}
                        type={
                          campo === "numero" || campo === "codigoPostal"
                            ? "number"
                            : "text"
                        }
                        placeholder={
                          campo.charAt(0).toUpperCase() + campo.slice(1)
                        }
                        name={campo}
                        value={direccion[campo]}
                        onChange={handleNuevaDireccionChange}
                      />
                    ))}
                    <button className="btn-guardar" onClick={guardarDireccion}>
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {direcciones.map((dir) => (
                    <div
                      key={dir._id}
                      className={`direccion-card ${
                        direccionSeleccionada?._id === dir._id
                          ? "seleccionada"
                          : ""
                      }`}
                      onClick={() => handleSeleccionDireccion(dir)}
                    >
                      <p>
                        <b>{dir.pais}</b> — {dir.estado}, {dir.ciudad}
                      </p>
                      <p>
                        {dir.calle} #{dir.numero}, {dir.colonia}
                      </p>
                      <p>C.P. {dir.codigoPostal}</p>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setDireccion({
                        pais: "",
                        estado: "",
                        ciudad: "",
                        calle: "",
                        numero: "",
                        colonia: "",
                        codigoPostal: "",
                      });
                      setDireccionSeleccionada(null);
                    }}
                  >
                    Agregar nueva dirección
                  </button>

                  {!direccionSeleccionada && (
                    <div className="form-direccion">
                      {Object.keys(direccion).map((campo) => (
                        <input
                          key={campo}
                          type={
                            campo === "numero" || campo === "codigoPostal"
                              ? "number"
                              : "text"
                          }
                          placeholder={
                            campo.charAt(0).toUpperCase() + campo.slice(1)
                          }
                          name={campo}
                          value={direccion[campo]}
                          onChange={handleNuevaDireccionChange}
                        />
                      ))}
                      <button
                        className="btn-guardar"
                        onClick={guardarDireccion}
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="modal-botones">
                <button onClick={() => setMostrarDireccion(false)}>
                  ← Regresar
                </button>
                <button
                  onClick={() => {
                    if (direccionSeleccionada || validarDireccion())
                      setMostrarPago(true);
                  }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PAGO */}
        {mostrarPago && (
          <div className="modal-overlay" onClick={() => setMostrarPago(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Método de pago</h2>

              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="">Selecciona método de pago</option>
                <option value="Tarjeta">Tarjeta de crédito/débito</option>
                <option value="PayPal">PayPal</option>
                <option value="Efectivo">Efectivo</option>
              </select>

              {metodoPago === "Tarjeta" && (
                <div className="form-pago">
                  <input
                    type="text"
                    placeholder="Número de tarjeta"
                    value={pagoInfo.numeroTarjeta || ""}
                    onChange={(e) =>
                      setPagoInfo({
                        ...pagoInfo,
                        numeroTarjeta: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Nombre del titular"
                    value={pagoInfo.nombreTitular || ""}
                    onChange={(e) =>
                      setPagoInfo({
                        ...pagoInfo,
                        nombreTitular: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Fecha de vencimiento (MM/AA)"
                    value={pagoInfo.vencimiento || ""}
                    onChange={(e) =>
                      setPagoInfo({ ...pagoInfo, vencimiento: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={pagoInfo.cvv || ""}
                    onChange={(e) =>
                      setPagoInfo({ ...pagoInfo, cvv: e.target.value })
                    }
                  />
                </div>
              )}

              {metodoPago === "PayPal" && (
                <div className="form-pago">
                  <input
                    type="email"
                    placeholder="Email de PayPal"
                    value={pagoInfo.paypalEmail || ""}
                    onChange={(e) =>
                      setPagoInfo({ ...pagoInfo, paypalEmail: e.target.value })
                    }
                  />
                </div>
              )}

              {metodoPago === "Efectivo" && (
                <p>Se pagará al recibir el pedido.</p>
              )}

              <div className="modal-botones">
                <button
                  onClick={() => {
                    setMostrarPago(false);
                    setMostrarDireccion(true);
                  }}
                >
                  ← Regresar
                </button>
                <button onClick={handleFinalizarPago}>Pagar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL COMPROBANTE (fuera de los demás modales) */}
        {comprobante && (
          <div className="modal-overlay" onClick={() => setComprobante(null)}>
            <div
              className="modal-comprobante"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="comprobante-titulo">✅ Comprobante de pago</h2>

              <div className="comprobante-info">
                <p>
                  <b>Usuario:</b> {comprobante.usuario}
                </p>
                <p>
                  <b>Método de pago:</b> {comprobante.metodoPago}
                </p>
                {comprobante.metodoPago !== "Efectivo" && (
                  <p>
                    <b>Info adicional:</b>{" "}
                    {JSON.stringify(comprobante.pagoInfo)}
                  </p>
                )}
                <p>
                  <b>Dirección de envío:</b>
                </p>
                <p>
                  {comprobante.direccion.calle} #{comprobante.direccion.numero},{" "}
                  {comprobante.direccion.colonia},{" "}
                  {comprobante.direccion.ciudad}, {comprobante.direccion.estado}
                  , {comprobante.direccion.pais}, C.P.{" "}
                  {comprobante.direccion.codigoPostal}
                </p>
              </div>

              <table className="comprobante-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobante.productos.map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        {p.nombre}
                        {p.descripcionPersonalizada &&
                          ` (${p.descripcionPersonalizada})`}
                      </td>
                      <td>{p.cantidad}</td>
                      <td>${p.precio.toFixed(2)}</td>
                      <td>${(p.precio * p.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="total-text">
                Total: ${comprobante.total.toFixed(2)}
              </p>
              <button
                className="btn-cerrar"
                onClick={() => setComprobante(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
