// src/components/MenuPrincipal.js
import React, { useState, useEffect, useCallback } from "react";
import { Bell, User, Search } from "lucide-react";
import { FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Carrito from "./Carrito";
import Perfil from "./Perfil";
import Notificaciones from "./Notificaciones";
import HistorialPedidos from "./HistorialPedidos";
import Preordenes from "./Preordenes";
import "../styles/MenuPrincipal.css";
import logo from "../assets/UrbanLogo.PNG";

export default function MenuPrincipal({ usuario, onLogout }) {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarPedidos, setMostrarPedidos] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [preordenes, setPreordenes] = useState([]);
  const [mostrarPreordenes, setMostrarPreordenes] = useState(false);
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);
  const [descripcionPersonalizada, setDescripcionPersonalizada] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  // RESEÑAS
  const [reviews, setReviews] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [ratingSeleccionado, setRatingSeleccionado] = useState(0);
  const [enviandoReview, setEnviandoReview] = useState(false);

  const API_URL = "http://localhost:5000/api";

  // ================== FETCH ==================
  const obtenerProductos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  }, []);

  const obtenerNotificaciones = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_URL}/notificaciones/${usuario.email}`);
      const data = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  }, [usuario]);

  const obtenerPreordenes = useCallback(async () => {
    if (!usuario) return;
    try {
      // 🔹 Para cliente, usa /cliente/:email
      const res = await fetch(`${API_URL}/preordenes/cliente/${usuario.email}`);
      const data = await res.json();

      console.log("Preórdenes del cliente:", data); // depuración

      setPreordenes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener preórdenes:", err);
      setPreordenes([]);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      navigate("/");
      return;
    }
    obtenerProductos();
    obtenerNotificaciones();
    obtenerPreordenes();

    // 🔹 Refrescar notificaciones cada 5 segundos
    const intervalo = setInterval(() => {
      obtenerNotificaciones();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [
    obtenerProductos,
    obtenerNotificaciones,
    obtenerPreordenes,
    usuario,
    navigate,
  ]);

  // ================== FILTRADO ==================
  const productosFiltrados = productos.filter((prod) => {
    const matchBusqueda = prod.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    let matchCategoria = false;
    if (categoriaActiva === "Todas") matchCategoria = true;
    else if (categoriaActiva === "Favoritos")
      matchCategoria = wishlist.includes(prod._id);
    else matchCategoria = prod.categoria === categoriaActiva;

    return matchBusqueda && matchCategoria;
  });

  // ================== CARRITO ==================
  const agregarAlCarrito = (producto, cantidad = 1) => {
    const index = carrito.findIndex((p) => p._id === producto._id);
    if (index >= 0) {
      const nuevo = [...carrito];
      nuevo[index].cantidad += cantidad;
      setCarrito(nuevo);
    } else {
      setCarrito([...carrito, { ...producto, cantidad }]);
    }
  };

  // ================== PREORDEN PERSONALIZADA ==================
  const enviarPreordenPersonalizada = async () => {
    if (!descripcionPersonalizada.trim()) {
      alert("Describe tu pedido personalizable");
      return;
    }

    try {
      const body = {
        usuario: usuario.email,
        vendedor: productoSeleccionado.vendedor,
        productoId: productoSeleccionado._id,
        productoNombre: productoSeleccionado.nombre,
        imagen: productoSeleccionado.imagen,
        descripcionPersonalizada,
        cantidad: 1,
        precioBase: Number(productoSeleccionado.precio),
        recargoPersonalizado: 30,
        total: Number(productoSeleccionado.precio) + 30,
        estado: "Pendiente",
        fecha: new Date(),
      };

      const res = await fetch(`${API_URL}/preordenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert("Error al crear la preorden");
        return;
      }

      // 🔹 Notificación al vendedor
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: productoSeleccionado.vendedor,
          mensaje: `📌 Nuevo pedido personalizado de ${usuario.email}`,
          titulo: "Nuevo pedido",
          fecha: new Date(),
        }),
      });

      // 🔹 Notificación al comprador
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuario.email,
          mensaje: `Tu pedido de ${productoSeleccionado.nombre} ha sido enviado al vendedor`,
          titulo: "Pedido enviado",
          fecha: new Date(),
        }),
      });

      alert("✅ Preorden enviada correctamente");
      setMostrarPersonalizado(false);
      setDescripcionPersonalizada("");
      obtenerPreordenes();
      obtenerNotificaciones();
    } catch (error) {
      console.error(error);
      alert("Error al enviar la preorden");
    }
  };

  // ================== RESEÑAS (frontend) ==================
  const fetchReviews = async (productoId) => {
    if (!productoId) return;
    try {
      const res = await fetch(`${API_URL}/reviews?productoId=${productoId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener reviews:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (productoSeleccionado) {
      fetchReviews(productoSeleccionado._id);
      setRatingSeleccionado(productoSeleccionado.rating || 0);
      setNuevoComentario("");
    }
  }, [productoSeleccionado]);

  const enviarReview = async () => {
    if (!usuario) return alert("Debes iniciar sesión para dejar una reseña");
    if (ratingSeleccionado <= 0 && nuevoComentario.trim() === "") {
      return alert("Agrega una calificación o un comentario");
    }

    setEnviandoReview(true);
    try {
      const body = {
        productoId: productoSeleccionado._id,
        productoNombre: productoSeleccionado.nombre,
        usuario: usuario.email,
        nombreUsuario: usuario.nombre || usuario.email,
        vendedor: productoSeleccionado.vendedor,
        rating: ratingSeleccionado,
        comentario: nuevoComentario.trim(),
        fecha: new Date(),
      };

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error creando review:", data);
        alert("No se pudo enviar la reseña");
        setEnviandoReview(false);
        return;
      }

      // 🔹 Notificación al vendedor
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: productoSeleccionado.vendedor,
          mensaje: `⭐ Nueva reseña en ${productoSeleccionado.nombre} por ${usuario.email}`,
          titulo: "Nueva reseña",
          fecha: new Date(),
        }),
      });

      // 🔹 Notificación al comprador
      await fetch(`${API_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuario.email,
          mensaje: `Tu reseña en ${productoSeleccionado.nombre} se registró correctamente`,
          titulo: "Reseña enviada",
          fecha: new Date(),
        }),
      });

      await fetchReviews(productoSeleccionado._id);

      setNuevoComentario("");
      setRatingSeleccionado(0);
      setEnviandoReview(false);
      obtenerNotificaciones();
      alert("Reseña enviada ✅");
    } catch (err) {
      console.error("Error enviando review:", err);
      alert("Error enviando reseña");
      setEnviandoReview(false);
    }
  };

  // ================== PRODUCTO ==================
  const verProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCantidadSeleccionada(1);
    setRatingSeleccionado(producto.rating || 0);
    setNuevoComentario("");
  };

  const toggleWishlist = (producto) => {
    if (wishlist.includes(producto._id)) {
      setWishlist(wishlist.filter((id) => id !== producto._id));
    } else {
      setWishlist([...wishlist, producto._id]);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
  };

  // ================== RENDER ==================
  return (
    <div className="menu-container">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-left">
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="brand-name">UrbanNook</h2>
        </div>

        <div className="nav-center">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Search className="icon search-icon" size={20} />
          </div>
        </div>

        <div className="nav-right">
          <div
            className="notificaciones-container"
            onClick={() => setMostrarNotificaciones(true)}
          >
            <Bell className="icon" size={28} />
            {notificaciones.length > 0 && (
              <span className="carrito-count">{notificaciones.length}</span>
            )}
          </div>

          <div
            className="carrito-container"
            onClick={() => setMostrarCarrito(true)}
          >
            <FaShoppingCart size={28} className="icon" />
            {carrito.length > 0 && (
              <span className="carrito-count">{carrito.length}</span>
            )}
          </div>

          <div className="profile" onClick={() => setMostrarPerfil(true)}>
            <User className="icon user-icon" size={32} />
            <span className="usuario-nombre">
              {usuario?.nombre || "Usuario"}
            </span>
          </div>

          <button className="logout-btn" onClick={handleLogoutClick}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ================== SUBNAV ================== */}
      <nav className="subnav">
        <ul className="subnav-list">
          {/* Categorías Dropdown */}
          <li className="subnav-item">
            <span>Categorías</span>
            <select
              className="categoria-select"
              value={categoriaActiva === "Todas" ? "" : categoriaActiva}
              onChange={(e) => setCategoriaActiva(e.target.value || "Todas")}
            >
              <option value="">Todas</option>
              <option value="Moda & Accesorios">Moda & Accesorios</option>
              <option value="Hogar & Decoración">Hogar & Decoración</option>
              <option value="Arte & Diseño">Arte & Diseño</option>
              <option value="Tecnología & Gadgets">Tecnología & Gadgets</option>
              <option value="Joyería & Bisutería">Joyería & Bisutería</option>
              <option value="Personalizado">Personalizado</option>
              <option value="Papelería & Regalos">Papelería & Regalos</option>
            </select>
          </li>

          {/* Favoritos independiente */}
          <li
            className="subnav-item"
            onClick={() => setCategoriaActiva("Favoritos")}
          >
            Favoritos
          </li>

          {/* Mis pedidos */}
          <li className="subnav-item" onClick={() => setMostrarPedidos(true)}>
            Mis pedidos
          </li>

          {/* Preórdenes */}
          <li
            className="subnav-item"
            onClick={() => setMostrarPreordenes(true)}
          >
            Preórdenes
          </li>
        </ul>
      </nav>

      {/* LISTA DE PRODUCTOS */}
      {!productoSeleccionado && !mostrarPreordenes && (
        <main
          className="productos-section"
          style={{ overflowY: "auto", maxHeight: "calc(100vh - 150px)" }}
        >
          {categoriaActiva === "Favoritos" ? (
            <div className="productos-grid">
              {productos
                .filter((p) => wishlist.includes(p._id))
                .map((prod) => (
                  <div className="producto-card" key={prod._id}>
                    <div className="img-container">
                      <img
                        src={prod.imagen || "https://via.placeholder.com/250"}
                        alt={prod.nombre}
                        className="producto-img"
                      />
                    </div>
                    <p className="producto-nombre">{prod.nombre}</p>
                    <p className="producto-precio">${prod.precio}</p>
                    <div className="estrellas">
                      {Array.from({ length: 5 }).map((_, i) =>
                        i < Math.round(prod.rating || 0) ? (
                          <span key={i} style={{ color: "#FFD700" }}>
                            ★
                          </span>
                        ) : (
                          <span key={i} style={{ color: "#ccc" }}>
                            ☆
                          </span>
                        )
                      )}
                    </div>
                    <div className="producto-botones">
                      <button onClick={() => verProducto(prod)}>Ver más</button>
                      <button onClick={() => agregarAlCarrito(prod)}>
                        Carrito
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : productosFiltrados.length > 0 ? (
            <div className="productos-grid">
              {productosFiltrados.map((prod) => (
                <div className="producto-card" key={prod._id}>
                  <div className="img-container">
                    <img
                      src={prod.imagen || "https://via.placeholder.com/250"}
                      alt={prod.nombre}
                      className="producto-img"
                    />
                    <div
                      className="wishlist-icon"
                      onClick={() => toggleWishlist(prod)}
                    >
                      {wishlist.includes(prod._id) ? (
                        <FaHeart color="#ff4d4d" size={20} />
                      ) : (
                        <FaRegHeart color="#fff" size={20} />
                      )}
                    </div>
                  </div>
                  <p className="producto-nombre">{prod.nombre}</p>
                  <p className="producto-precio">${prod.precio}</p>
                  <p className="producto-categoria">{prod.categoria}</p>
                  <div className="estrellas">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < Math.round(prod.rating || 0) ? (
                        <span key={i} style={{ color: "#FFD700" }}>
                          ★
                        </span>
                      ) : (
                        <span key={i} style={{ color: "#ccc" }}>
                          ☆
                        </span>
                      )
                    )}
                  </div>
                  <div className="producto-botones">
                    <button onClick={() => verProducto(prod)}>Ver más</button>
                    <button onClick={() => agregarAlCarrito(prod)}>
                      Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-productos">No hay productos</p>
          )}
        </main>
      )}

      {/* PRODUCTO DETALLE */}
      {productoSeleccionado && (
        <div
          className="producto-ventana"
          style={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}
        >
          <button
            className="volver-btn"
            onClick={() => setProductoSeleccionado(null)}
          >
            ← Volver
          </button>

          <div className="producto-detalle producto-detalle--grid">
            {/* IZQUIERDA: IMAGEN + VENDEDOR EMAIL */}
            <div className="producto-col izquierda">
              <div className="producto-imagen-large">
                <img
                  src={
                    productoSeleccionado.imagen ||
                    "https://via.placeholder.com/600x600"
                  }
                  alt={productoSeleccionado.nombre}
                />
              </div>
              <div className="vendedor-email">
                {productoSeleccionado.vendedor || "vendedor@ejemplo.com"}
              </div>
            </div>

            {/* CENTRO: INFO DEL PRODUCTO + ACCIONES */}
            <div className="producto-col centro">
              <h3 className="detalle-nombre">{productoSeleccionado.nombre}</h3>

              <div className="detalle-precio">
                ${productoSeleccionado.precio}
              </div>
              <div className="detalle-categoria">
                {productoSeleccionado.categoria}
              </div>

              <div className="detalle-descripcion">
                {productoSeleccionado.descripcion}
              </div>

              {/* cantidad + botones */}
              <div className="cantidad-personalizado" style={{ marginTop: 10 }}>
                <div className="cantidad">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadSeleccionada}
                    onChange={(e) =>
                      setCantidadSeleccionada(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="btns-derecha" style={{ alignItems: "center" }}>
                  <button
                    className="personalizado-btn"
                    onClick={() => setMostrarPersonalizado(true)}
                  >
                    ✏️ Personalizado (+$30)
                  </button>

                  <button
                    className="modal-carrito-btn"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      agregarAlCarrito(
                        productoSeleccionado,
                        cantidadSeleccionada
                      );
                      setProductoSeleccionado(null);
                    }}
                  >
                    ➕ Agregar al carrito
                  </button>
                </div>
              </div>

              {/* información extra */}
              <div style={{ marginTop: 14 }}>
                <small style={{ color: "#666" }}>
                  Vendedor: {productoSeleccionado.vendedor}
                </small>
              </div>
            </div>

            {/* DERECHA: CALIFICACIÓN + FORMULARIO RESEÑA + LISTA DE COMENTARIOS */}
            <div className="producto-col derecha">
              <div className="producto-reseñas">
                <h4>Calificación</h4>

                {/* Estrellas interactivas para seleccionar rating */}
                <div className="estrellas-interactivas" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const index = i + 1;
                    return (
                      <button
                        key={index}
                        className="star-btn"
                        onClick={() => setRatingSeleccionado(index)}
                        title={`${index} estrellas`}
                        type="button"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 6,
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill={
                            index <= ratingSeleccionado ? "#FFD700" : "none"
                          }
                          stroke={
                            index <= ratingSeleccionado ? "#FFD700" : "#ccc"
                          }
                          strokeWidth="1.2"
                        >
                          <path d="M12 .587l3.668 7.431L23.5 9.75l-5.5 5.36L19.835 24 12 19.897 4.165 24 6 15.11 0.5 9.75l7.832-1.732z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                <h4 style={{ marginTop: 14 }}>Dejar comentario</h4>
                <textarea
                  className="comentario-input"
                  placeholder="Escribe tu comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  rows={4}
                />

                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn-enviar-review"
                    onClick={enviarReview}
                    disabled={enviandoReview}
                  >
                    {enviandoReview ? "Enviando..." : "Enviar comentario"}
                  </button>
                </div>
              </div>

              {/* Lista de comentarios */}
              <div className="lista-reseñas" style={{ marginTop: 18 }}>
                <h4>Comentarios</h4>
                {reviews.length === 0 ? (
                  <p className="sin-reseñas">Aún no hay comentarios</p>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r._id || Math.random()}
                      className="comentario-item"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <strong>{r.nombreUsuario || r.usuario}</strong>
                        {/* Mostrar rating numérico + estrellas pequeñas */}
                        <span style={{ fontSize: 12 }}>
                          {Array.from({ length: 5 }).map((_, si) => (
                            <span key={si} style={{ marginLeft: 2 }}>
                              {si < Math.round(r.rating || 0) ? "★" : "☆"}
                            </span>
                          ))}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0" }}>{r.comentario}</p>
                      <small style={{ color: "#999" }}>
                        {new Date(r.fecha).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MODAL PERSONALIZADO */}
          {mostrarPersonalizado && (
            <div
              className="modal-overlay"
              onClick={() => setMostrarPersonalizado(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Pedido Personalizado (+$30)</h3>
                <p>Describe cómo quieres tu pedido:</p>

                <textarea
                  rows="5"
                  value={descripcionPersonalizada}
                  onChange={(e) => setDescripcionPersonalizada(e.target.value)}
                  placeholder="Describe tu personalización..."
                  style={{ width: "100%", padding: "8px" }}
                />

                <button
                  onClick={enviarPreordenPersonalizada}
                  style={{ marginTop: "10px" }}
                >
                  Enviar preorden
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALES */}
      {mostrarCarrito && (
        <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Carrito
              usuario={usuario}
              carrito={carrito}
              setCarrito={setCarrito}
              setNotificaciones={setNotificaciones} // <- esto
              notificaciones={notificaciones} // <- opcional si quieres usarlo
              onRegresar={() => setMostrarCarrito(false)}
              onNuevoPedido={() => {}}
            />
          </div>
        </div>
      )}

      {mostrarPerfil && (
        <div className="modal-overlay" onClick={() => setMostrarPerfil(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Perfil
              usuario={usuario}
              onCerrar={() => setMostrarPerfil(false)}
              API_URL={API_URL}
            />
          </div>
        </div>
      )}

      {mostrarNotificaciones && (
        <div
          className="noti-floating-overlay"
          onClick={() => setMostrarNotificaciones(false)}
        >
          <div
            className="noti-floating-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Notificaciones
              usuario={usuario}
              notificaciones={notificaciones}
              setNotificaciones={setNotificaciones} // <--- AQUI
              onCerrar={() => setMostrarNotificaciones(false)}
            />
          </div>
        </div>
      )}

      {mostrarPedidos && (
        <div className="modal-overlay" onClick={() => setMostrarPedidos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <HistorialPedidos
              usuario={usuario}
              onClose={() => setMostrarPedidos(false)}
            />
          </div>
        </div>
      )}

      {mostrarPreordenes && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarPreordenes(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Preordenes usuario={usuario} preordenes={preordenes} />
            <button
              onClick={() => setMostrarPreordenes(false)}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
