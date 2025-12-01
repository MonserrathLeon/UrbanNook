// src/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import NavbarAD from "./NavbarAD"; // tu navbar
import Notis from "./Notis"; // notificaciones
import "../styles/AdminDashboard.css";

export default function AdminDashboard({ onLogout }) {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tab, setTab] = useState("usuarios");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    categoria: "",
    vendedor: "",
  });
  const [notificacion, setNotificacion] = useState(null);

  const API_URL = "http://localhost:5000/api";

  // ======== USUARIOS ========
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
    } catch {
      setNotificacion({ mensaje: "Error al obtener usuarios", tipo: "error" });
      setUsuarios([]);
    }
  };

  const eliminarUsuario = async (id) => {
    // Muestra notificación de "eliminando" antes de borrar
    setNotificacion({ mensaje: "Eliminando usuario...", tipo: "info" });
    setTimeout(async () => {
      try {
        await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
        setNotificacion({ mensaje: "Usuario eliminado", tipo: "ok" });
        obtenerUsuarios();
      } catch {
        setNotificacion({ mensaje: "Error eliminando usuario", tipo: "error" });
      }
    }, 1000); // 1 segundo para que el usuario vea la notificación
  };

  const cambiarRol = async (id, nuevoRol) => {
    try {
      await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nuevoRol }),
      });
      setNotificacion({ mensaje: "Rol actualizado", tipo: "ok" });
      obtenerUsuarios();
    } catch {
      setNotificacion({ mensaje: "Error cambiando rol", tipo: "error" });
    }
  };

  // ======== PRODUCTOS ========
  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : data.productos || []);
    } catch {
      setNotificacion({ mensaje: "Error al obtener productos", tipo: "error" });
      setProductos([]);
    }
  };

  const editarProducto = (producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setNuevoProducto({ ...producto });
  };

  const guardarEdicion = async () => {
    if (!productoEditando) return;
    try {
      await fetch(`${API_URL}/productos/${productoEditando._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });
      setModoEdicion(false);
      setProductoEditando(null);
      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: "",
        categoria: "",
        vendedor: "",
      });
      setNotificacion({ mensaje: "Producto editado", tipo: "ok" });
      obtenerProductos();
    } catch {
      setNotificacion({ mensaje: "Error guardando edición", tipo: "error" });
    }
  };

  const eliminarProducto = async (id) => {
    setNotificacion({ mensaje: "Eliminando producto...", tipo: "info" });
    setTimeout(async () => {
      try {
        await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
        setNotificacion({ mensaje: "Producto eliminado", tipo: "ok" });
        obtenerProductos();
      } catch {
        setNotificacion({ mensaje: "Error eliminando producto", tipo: "error" });
      }
    }, 1000);
  };

  useEffect(() => {
    obtenerUsuarios();
    obtenerProductos();
  }, []);

  return (
    <div className="dashboard-container">
      <NavbarAD onLogout={onLogout} />

      <div className="subnavbar">
        <button
          className={tab === "usuarios" ? "active" : ""}
          onClick={() => setTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={tab === "productos" ? "active" : ""}
          onClick={() => setTab("productos")}
        >
          Productos
        </button>
      </div>

      <div className="admin-main">
        {/* USUARIOS */}
        {tab === "usuarios" && (
          <div className="admin-grid">
            {usuarios.map((u) => (
              <div key={u._id} className="admin-card">
                <div className="info">
                  <h3>{u.nombre}</h3>
                  <p>{u.email}</p>
                  <p>
                    Rol:{" "}
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRol(u._id, e.target.value)}
                    >
                      <option value="administrador">Administrador</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="comprador">Comprador</option>
                    </select>
                  </p>
                </div>
                <div className="admin-actions">
                  <button className="btn-delete" onClick={() => eliminarUsuario(u._id)}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === "productos" && (
          <div className="admin-grid admin-scroll-horizontal">
            {productos.map((p) => (
              <div key={p._id} className="admin-card">
                <img src={p.imagen || "https://via.placeholder.com/200"} alt={p.nombre} />
                <div className="info">
                  <h3>{p.nombre}</h3>
                  <p>{p.descripcion}</p>
                  <p>${Number(p.precio).toFixed(2)}</p>
                  <p>{p.categoria}</p>
                  <p>
                    <i>Vendedor: {p.vendedor || "Desconocido"}</i>
                  </p>
                </div>
                <div className="admin-actions">
                  <button className="btn-edit" onClick={() => editarProducto(p)}>
                    <Edit size={16} /> Editar
                  </button>
                  <button className="btn-delete" onClick={() => eliminarProducto(p._id)}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}

            {/* FORMULARIO EDICIÓN */}
            {modoEdicion && (
              <div className="admin-form">
                <h3>Editar producto</h3>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nuevoProducto.nombre}
                  onChange={(e) =>
                    setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={nuevoProducto.descripcion}
                  onChange={(e) =>
                    setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={nuevoProducto.precio}
                  onChange={(e) =>
                    setNuevoProducto({ ...nuevoProducto, precio: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="URL de imagen"
                  value={nuevoProducto.imagen}
                  onChange={(e) =>
                    setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Categoría"
                  value={nuevoProducto.categoria}
                  onChange={(e) =>
                    setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })
                  }
                />
                <div className="admin-form-actions">
                  <button className="btn-save" onClick={guardarEdicion}>
                    💾 Guardar cambios
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setModoEdicion(false);
                      setProductoEditando(null);
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOTIFICACIONES */}
      {notificacion && (
        <Notis
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  );
}
