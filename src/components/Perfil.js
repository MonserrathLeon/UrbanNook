
// src/components/Perfil.js 
import React, { useState, useEffect, useCallback } from "react";
import { Camera, Edit3, Save, ArrowLeft } from "lucide-react";
import Notis from "./Notis";
import HistorialPedidos from "./HistorialPedidos";
import "../styles/Perfil.css";

/**
 * Props esperados:
 * - usuario: objeto usuario
 * - onCerrar: función que cierra el perfil
 * - onLogout: cerrar sesión
 * - actualizarUsuario: función(usuarioActualizado) para mantener el usuario en App
 * - API_URL: url de la API
 */
export default function Perfil({
  usuario,
  onCerrar,
  onLogout,
  actualizarUsuario,
  API_URL = "http://localhost:5000/api",
}) {
  const [seccion, setSeccion] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const [refUsuario, setRefUsuario] = useState(usuario);

  useEffect(() => {
    setRefUsuario(usuario);
    setNuevoNombre(usuario?.nombre || "");
  }, [usuario]);

  const [modoEdicion, setModoEdicion] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState(usuario?.nombre || "");
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = "ok") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  /* ----------------------------- DIRECCIONES ----------------------------- */
  const [direcciones, setDirecciones] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    pais: "",
    estado: "",
    ciudad: "",
    calle: "",
    numero: "",
    colonia: "",
    codigoPostal: "",
  });

  const API_USUARIOS = `${API_URL}/usuarios`;
  const API_DIRECCIONES = `${API_URL}/direcciones`;

  /* ================= ACTUALIZAR FOTO DE PERFIL (NO REQUIERE CONTRASEÑA) ================= */
  const actualizarFotoPerfil = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !refUsuario) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imagenBase64 = reader.result;

      setSubiendo(true);

      try {
        const res = await fetch(`${API_USUARIOS}/${refUsuario._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagen: imagenBase64 }),
        });

        if (!res.ok) throw new Error("No se pudo actualizar la foto");

        const res2 = await fetch(`${API_USUARIOS}/${refUsuario._id}`);
        const usuarioActualizado = await res2.json();

        actualizarUsuario(usuarioActualizado);
        setRefUsuario(usuarioActualizado);
        mostrarToast("Foto actualizada");
      } catch (err) {
        console.error(err);
        mostrarToast("Error al actualizar foto", "error");
      } finally {
        setSubiendo(false);
      }
    };

    reader.readAsDataURL(file);
  };

  /* ================= GUARDAR CAMBIOS (NOMBRE Y CONTRASEÑA PIDEN PASSWORD ACTUAL) ================= */
  const guardarCambios = async () => {
    try {
      if (!passwordActual.trim()) {
        return mostrarToast("Debes ingresar tu contraseña actual", "error");
      }

      if (modoEdicion === "nombre") {
        if (!nuevoNombre.trim()) {
          return mostrarToast("Nombre inválido", "error");
        }
      }

      if (modoEdicion === "password") {
        if (!nuevaPassword || !confirmarPassword) {
          return mostrarToast("Llena todos los campos", "error");
        }
        if (nuevaPassword !== confirmarPassword) {
          return mostrarToast("Las contraseñas no coinciden", "error");
        }
      }

      const body =
        modoEdicion === "nombre"
          ? { actualPassword: passwordActual, nombre: nuevoNombre }
          : {
              actualPassword: passwordActual,
              nuevaPassword,
            };

      const url =
        modoEdicion === "password"
          ? `${API_USUARIOS}/${refUsuario._id}/password`
          : `${API_USUARIOS}/${refUsuario._id}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error guardando cambios");

      const res2 = await fetch(`${API_USUARIOS}/${refUsuario._id}`);
      const usuarioActualizado = await res2.json();

      actualizarUsuario(usuarioActualizado);
      setRefUsuario(usuarioActualizado);

      mostrarToast("Cambios guardados");

      setModoEdicion(null);
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err) {
      console.error(err);
      mostrarToast("Contraseña incorrecta o error al guardar", "error");
    }
  };

  /* ================= ELIMINAR CUENTA ================= */
  const eliminarCuenta = async () => {
    if (!window.confirm("¿Eliminar cuenta permanentemente?")) return;

    try {
      const res = await fetch(`${API_USUARIOS}/${refUsuario._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error eliminando");

      mostrarToast("Cuenta eliminada");
      if (onLogout) onLogout();
      if (onCerrar) onCerrar();
    } catch (err) {
      console.error(err);
      mostrarToast("Error al eliminar", "error");
    }
  };

  /* ================= DIRECCIONES ================= */
  const obtenerDirecciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_DIRECCIONES}/usuario/${refUsuario._id}`);
      if (!res.ok) throw new Error("Error cargando direcciones");
      const data = await res.json();

      const limpias = (Array.isArray(data) ? data : []).map((d) => ({
        _id: d._id,
        pais: d.pais,
        estado: d.estado,
        ciudad: d.ciudad,
        calle: d.calle,
        numero: d.numero,
        colonia: d.colonia,
        codigoPostal: d.codigoPostal,
      }));

      setDirecciones(limpias);
    } catch (err) {
      console.error(err);
      mostrarToast("Error cargando direcciones", "error");
    }
  }, [refUsuario._id, API_DIRECCIONES]);

  useEffect(() => {
    if (seccion === "direcciones") obtenerDirecciones();
  }, [seccion, obtenerDirecciones]);

  /* ================= GUARDAR DIRECCIÓN ================= */
  const guardarDireccion = async () => {
    const completo = Object.values(nuevaDireccion).every(
      (v) => String(v || "").trim() !== ""
    );
    if (!completo)
      return mostrarToast("Completa todos los campos", "error");

    try {
      const url = editandoId
        ? `${API_DIRECCIONES}/${editandoId}`
        : `${API_DIRECCIONES}/agregar`;

      const metodo = editandoId ? "PATCH" : "POST";

      const body = editandoId
        ? nuevaDireccion
        : { usuarioId: refUsuario._id, ...nuevaDireccion };

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error guardando dirección");

      mostrarToast("Dirección guardada");
      setNuevaDireccion({
        pais: "",
        estado: "",
        ciudad: "",
        calle: "",
        numero: "",
        colonia: "",
        codigoPostal: "",
      });
      setEditandoId(null);
      obtenerDirecciones();
    } catch (err) {
      console.error(err);
      mostrarToast("Error guardando dirección", "error");
    }
  };

  const eliminarDireccion = async (id) => {
    if (!window.confirm("¿Eliminar dirección?")) return;
    try {
      const res = await fetch(`${API_DIRECCIONES}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error eliminando");
      mostrarToast("Dirección eliminada");
      obtenerDirecciones();
    } catch (err) {
      console.error(err);
      mostrarToast("Error eliminando dirección", "error");
    }
  };

  /* ================= BACK ================= */
  const handleBack = () => {
    if (seccion) setSeccion("");
    else if (onCerrar) onCerrar();
  };

  /* ================= RENDER ================= */

  if (!refUsuario) return <p className="cargando">Cargando perfil...</p>;

  /* ================= HOME ================= */
  if (!seccion)
    return (
      <div className="perfil-modal">
        {toast && (
          <Notis mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        )}

        <div className="perfil-contenido">
          <button className="cerrar-btn" onClick={handleBack}>
            <ArrowLeft size={24} /> Volver
          </button>

          <div className="perfil-header">
            <div className="perfil-avatar">
              <img
                src={refUsuario.imagen || "https://via.placeholder.com/120"}
                alt="Perfil"
                className="perfil-foto"
              />

              <label className="perfil-camara">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={actualizarFotoPerfil}
                  disabled={subiendo}
                />
              </label>
            </div>

            <div className="info-usuario">
              <h2>{refUsuario.nombre}</h2>
              <p>{refUsuario.email}</p>
            </div>
          </div>

          <div className="perfil-botones-grid">
            <button onClick={() => setSeccion("info")}>Tu información</button>
            <button onClick={() => setSeccion("direcciones")}>Direcciones</button>
            <button onClick={() => setSeccion("pedidos")}>Mis pedidos</button>
            <button className="btn-eliminar" onClick={eliminarCuenta}>
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    );

  /* ================= INFORMACIÓN PERSONAL ================= */
  if (seccion === "info")
    return (
      <div className="perfil-modal">
        {toast && (
          <Notis mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        )}
        <div className="perfil-contenido info-section">
          <button className="cerrar-btn" onClick={handleBack}>
            <ArrowLeft size={20} /> Volver
          </button>

          <h2>Tu información personal</h2>

          {!modoEdicion ? (
            <div className="info-lista">
              <div className="info-item">
                <p>
                  <b>Nombre:</b> {refUsuario.nombre}
                </p>
                <Edit3 size={16} className="edit-icon" onClick={() => setModoEdicion("nombre")} />
              </div>

              <div className="info-item">
                <p>
                  <b>Email:</b> {refUsuario.email}
                </p>
              </div>

              <div className="info-item">
                <p>
                  <b>Contraseña:</b> ********
                </p>
                <Edit3 size={16} className="edit-icon" onClick={() => setModoEdicion("password")} />
              </div>
            </div>
          ) : modoEdicion === "nombre" ? (
            <div className="form-editar">
              <label>Nuevo nombre</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />

              <label>Contraseña actual</label>
              <input
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
              />

              <button className="btn-guardar" onClick={guardarCambios}>
                <Save size={16} /> Guardar cambios
              </button>

              <button className="btn-cancelar" onClick={() => setModoEdicion(null)}>
                Cancelar
              </button>
            </div>
          ) : (
            <div className="form-editar">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
              />

              <label>Nueva contraseña</label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />

              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
              />

              <button className="btn-guardar" onClick={guardarCambios}>
                <Save size={16} /> Guardar
              </button>

              <button className="btn-cancelar" onClick={() => setModoEdicion(null)}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    );

  /* ================= DIRECCIONES ================= */
  if (seccion === "direcciones")
    return (
      <div className="perfil-modal">
        {toast && (
          <Notis mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        )}

        <div className="perfil-contenido">
          <button className="cerrar-btn" onClick={handleBack}>
            <ArrowLeft size={20} /> Volver
          </button>

          <div className="info-section">
            <h2>Tus direcciones</h2>

            <div className="lista-direcciones">
              {direcciones.length === 0 && <p>No tienes direcciones registradas.</p>}

              {direcciones.map((dir) => (
                <div className="direccion-card" key={dir._id}>
                  <p>
                    <b>{dir.pais}</b> — {dir.estado}, {dir.ciudad}
                  </p>
                  <p>
                    {dir.calle} #{dir.numero}, {dir.colonia}
                  </p>
                  <p>C.P. {dir.codigoPostal}</p>

                  <div className="direccion-acciones">
                    <button
                      onClick={() => {
                        const { _id, ...soloCampos } = dir;
                        setNuevaDireccion(soloCampos);
                        setEditandoId(dir._id);
                      }}
                    >
                      Editar
                    </button>

                    <button className="btn-eliminar" onClick={() => eliminarDireccion(dir._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3>{editandoId ? "Editar dirección" : "Agregar nueva dirección"}</h3>

            <div className="form-direccion">
              {Object.keys(nuevaDireccion).map((campo) => (
                <input
                  key={campo}
                  type={campo === "numero" || campo === "codigoPostal" ? "number" : "text"}
                  placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                  value={nuevaDireccion[campo]}
                  onChange={(e) =>
                    setNuevaDireccion({
                      ...nuevaDireccion,
                      [campo]: e.target.value,
                    })
                  }
                />
              ))}
              <button className="btn-guardar" onClick={guardarDireccion}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  /* ================= PEDIDOS ================= */
  if (seccion === "pedidos")
    return (
      <div className="perfil-modal">
        {toast && (
          <Notis mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        )}

        <div className="perfil-contenido">
          <button className="cerrar-btn" onClick={handleBack}>
            <ArrowLeft size={24} /> Volver
          </button>

          <h2>Pedidos confirmados</h2>
          <HistorialPedidos usuario={refUsuario} estado="confirmado" inline />
        </div>
      </div>
    );

  return null;
}
