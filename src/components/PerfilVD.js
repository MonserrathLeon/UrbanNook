// src/components/PerfilVD.js
import React, { useState } from "react";
import { Camera } from "lucide-react";
import "../styles/VendedorDashboard.css";

export default function PerfilVD({ usuario, API_URL, actualizarFotoLocal }) {
  const [subiendo, setSubiendo] = useState(false);

  const actualizarFotoPerfil = (e) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imagenBase64 = reader.result;
      setSubiendo(true);

      try {
        const res = await fetch(`${API_URL}/usuarios/${usuario._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagen: imagenBase64 }),
        });

        if (!res.ok) throw new Error("No se pudo actualizar la foto");

        const usuarioActualizado = await res.json();
        actualizarFotoLocal(usuarioActualizado.imagen);
        alert("Foto de perfil actualizada ✅");
      } catch (err) {
        console.error(err);
        alert("No se pudo actualizar la foto ❌");
      } finally {
        setSubiendo(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <section className="vd-perfil">
      <div className="vd-perfil-left">
        <div className="vd-avatar">
          <img
            src={usuario.imagen || "https://via.placeholder.com/150"}
            alt="perfil grande"
          />
          <label className="vd-camera">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={actualizarFotoPerfil}
              disabled={subiendo}
            />
          </label>
        </div>
        <div className="vd-datos">
          <h3>{usuario.nombre}</h3>
          <p>{usuario.email}</p>
          <small>Vendedor</small>
        </div>
      </div>
    </section>
  );
} 