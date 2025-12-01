// src/components/VendedorDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavbarVD from "./NavbarVD";
import PerfilVD from "./PerfilVD";

import ListaProductos from "./Productos/ListaProductos";
import FormProducto from "./Productos/FormProducto";
import ListaPedidos from "./Pedidos/ListaPedidos";
import ListaPreordenes from "./Preordenes/ListaPreordenes";

import Notis from "./Notis";
import "../styles/VendedorDashboard.css";

export default function VendedorDashboard({ usuario }) {
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api";

  const [vista, setVista] = useState("productos");
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [preordenes, setPreordenes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState(null);
  const [editando, setEditando] = useState(null);
  const [noti, setNoti] = useState(null);

  const [fotoPerfil, setFotoPerfil] = useState(
    usuario?.imagen || "https://via.placeholder.com/150"
  );

  // ========================= FETCHERS =========================
  const obtenerProductos = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_URL}/productos/vendedor/${usuario.email}`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setNoti({ mensaje: "Error al obtener productos ❌", tipo: "error" });
    }
  }, [usuario]);

  const obtenerPedidos = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_URL}/pedidos?vendedor=${usuario.email}`);
      const data = await res.json();
      setPedidos(Array.isArray(data.pedidos) ? data.pedidos : []);
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
      setNoti({ mensaje: "Error al obtener pedidos ❌", tipo: "error" });
    }
  }, [usuario]);

  const obtenerPreordenes = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(
        `${API_URL}/preordenes/vendedor/${usuario.email}`
      );
      const data = await res.json();
      setPreordenes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener preórdenes:", err);
      setNoti({ mensaje: "Error al obtener preórdenes ❌", tipo: "error" });
    }
  }, [usuario]);

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

  const obtenerMensajes = useCallback(async () => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_URL}/mensajes?vendedor=${usuario.email}`);
      const data = await res.json();
      setMensajes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener mensajes:", err);
    }
  }, [usuario]);

  // ========================= USE EFFECT =========================
  useEffect(() => {
    if (!usuario) {
      navigate("/");
      return;
    }

    obtenerProductos();
    obtenerPedidos();
    obtenerPreordenes();
    obtenerNotificaciones();
    obtenerMensajes();
  }, [
    usuario,
    navigate,
    obtenerProductos,
    obtenerPedidos,
    obtenerPreordenes,
    obtenerNotificaciones,
    obtenerMensajes,
  ]);

  // ========================= PRODUCTOS =========================
  const abrirFormularioAgregar = () => {
    setNuevoProducto({
      categoria: "",
      stock: 1,
      precio: "",
      nombre: "",
      descripcion: "",
      imagen: "",
    });
    setEditando(null);
    setVista("agregar");
  };

  const guardarProducto = async () => {
    if (!nuevoProducto) return;

    if (
      !nuevoProducto.categoria ||
      nuevoProducto.nombre.trim() === "" ||
      nuevoProducto.precio === "" ||
      nuevoProducto.stock === ""
    ) {
      return setNoti({
        mensaje: "Completa todos los campos requeridos ⚠️",
        tipo: "error",
      });
    }

    const productoParaGuardar = {
      ...nuevoProducto,
      vendedor: usuario.email,
      precio: Number(nuevoProducto.precio),
      stock: Number(nuevoProducto.stock),
    };

    try {
      let res, data;

      if (editando) {
        res = await fetch(`${API_URL}/productos/${editando._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productoParaGuardar),
        });
        data = await res.json();
        setNoti({ mensaje: "Producto actualizado ✅", tipo: "ok" });
        setEditando(null);
      } else {
        res = await fetch(`${API_URL}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productoParaGuardar),
        });
        data = await res.json();
        if (data._id) setNoti({ mensaje: "Producto agregado ✅", tipo: "ok" });
        else
          setNoti({ mensaje: "Error al agregar producto ❌", tipo: "error" });
      }

      setNuevoProducto(null);
      setVista("productos");
      obtenerProductos();
    } catch (err) {
      console.error(err);
      setNoti({ mensaje: "Error al guardar producto ❌", tipo: "error" });
    }
  };

  const iniciarEdicion = (producto) => {
    setEditando(producto);
    setNuevoProducto({ ...producto });
    setVista("agregar");
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
      setNoti({ mensaje: "Producto eliminado ✅", tipo: "ok" });
      obtenerProductos();
    } catch (err) {
      console.error(err);
      setNoti({ mensaje: "No se pudo eliminar ❌", tipo: "error" });
    }
  };

  const actualizarEstadoPedido = async (id, estado, tipo = "pedido") => {
    try {
      const ruta = tipo === "preorden" ? "preordenes" : "pedidos";
      await fetch(`${API_URL}/${ruta}/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      if (tipo === "preorden") obtenerPreordenes();
      else obtenerPedidos();
    } catch (err) {
      console.error(err);
      setNoti({ mensaje: "No se pudo actualizar el estado ❌", tipo: "error" });
    }
  };

  // ========================= RENDER =========================
  return (
    <div className="vendedor-dashboard">
      <NavbarVD
        usuario={usuario}
        notificaciones={notificaciones}
        setNotificaciones={setNotificaciones} // ✅ PASADO CORRECTAMENTE
        mensajes={mensajes}
      />

      <PerfilVD
        usuario={usuario}
        API_URL={API_URL}
        actualizarFotoLocal={setFotoPerfil}
        fotoPerfil={fotoPerfil}
      />

      <section className="vd-perfil-right">
        <div className="vd-buttons-row">
          <button
            className={vista === "productos" ? "activo" : ""}
            onClick={() => setVista("productos")}
          >
            Mis productos
          </button>
          <button
            className={vista === "agregar" ? "activo" : ""}
            onClick={abrirFormularioAgregar}
          >
            Agregar producto
          </button>
          <button
            className={vista === "pedidos" ? "activo" : ""}
            onClick={() => {
              setVista("pedidos");
              obtenerPedidos();
            }}
          >
            Pedidos
          </button>
          <button
            className={vista === "preordenes" ? "activo" : ""}
            onClick={() => {
              setVista("preordenes");
              obtenerPreordenes();
            }}
          >
            Preórdenes
          </button>
        </div>
      </section>

      <main className="vd-main">
        {vista === "productos" && (
          <ListaProductos
            productos={productos}
            onEditar={iniciarEdicion}
            onEliminar={eliminarProducto}
          />
        )}

        {vista === "agregar" && nuevoProducto && (
          <FormProducto
            producto={nuevoProducto}
            setProducto={setNuevoProducto}
            usuario={usuario}
            onGuardar={guardarProducto}
            onCancelar={() => {
              setNuevoProducto(null);
              setEditando(null);
              setVista("productos");
            }}
            editando={editando}
          />
        )}

        {vista === "pedidos" && (
          <ListaPedidos
            pedidos={pedidos}
            onActualizarEstado={actualizarEstadoPedido}
          />
        )}

        {vista === "preordenes" && (
          <ListaPreordenes
            preordenes={preordenes}
            onActualizarEstado={actualizarEstadoPedido}
          />
        )}
      </main>

      {noti && (
        <Notis
          mensaje={noti.mensaje}
          tipo={noti.tipo}
          onClose={() => setNoti(null)}
          duration={2500}
        />
      )}
    </div>
  );
}
