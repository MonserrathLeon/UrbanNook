// src/components/Productos/FormProducto.jsx
import React, { useState, useEffect } from "react";
import "../../styles/FormProducto.css";

export default function FormProducto({
  producto,
  setProducto,
  usuario,
  onGuardar,
  onCancelar,
  editando,
}) {
  const [subiendo, setSubiendo] = useState(false);

  /**
   * 👉 Solo se ejecuta cuando:
   * - el usuario existe
   * - no estamos editando
   * - y el vendedor aún no está asignado
   *
   * Previene que la función se llame otra vez
   * si setProducto o producto cambian.
   */
  useEffect(() => {
    if (
      !editando &&
      usuario?.email &&
      !producto?.vendedor
    ) {
      setProducto((prev) => ({
        ...prev,
        vendedor: usuario.email,
      }));
    }
  }, [editando, usuario?.email, producto?.vendedor, setProducto]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProducto((prev) => ({
        ...prev,
        imagen: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    setSubiendo(true);
    try {
      await onGuardar();
    } catch (err) {
      console.error(err);
    } finally {
      setSubiendo(false);
    }
  };

  if (!producto) return null;

  return (
    <div className="form-producto">
      <h3>{editando ? "Editar producto" : "Nuevo producto"}</h3>

      <div className="form-producto-grid">
        {/* COLUMNA IZQUIERDA */}
        <div className="form-left">
          <label>
            Nombre
            <input
              name="nombre"
              placeholder="Nombre"
              value={producto.nombre ?? ""}
              onChange={handleInput}
            />
          </label>

          <label>
            Precio
            <input
              name="precio"
              type="number"
              placeholder="Precio"
              value={producto.precio ?? ""}
              onChange={handleInput}
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              value={producto.stock ?? ""}
              onChange={handleInput}
            />
          </label>

          <label>
            Categoría
            <select
              name="categoria"
              value={producto.categoria ?? ""}
              onChange={handleInput}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Moda & Accesorios">Moda & Accesorios</option>
              <option value="Hogar & Decoración">Hogar & Decoración</option>
              <option value="Arte & Diseño">Arte & Diseño</option>
              <option value="Tecnologia & Gadgets">Tecnología & Gadgets</option>
              <option value="Joyeria & Bisutería">Joyería & Bisutería</option>
              <option value="Personalizado">Personalizado</option>
              <option value="Papeleria & Regalos">Papelería & Regalos</option>
            </select>
          </label>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="form-right">
          <label>
            Descripción
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={producto.descripcion ?? ""}
              onChange={handleInput}
            />
          </label>

          <label>
            Imagen
            <input type="file" accept="image/*" onChange={handleImagen} />
          </label>
        </div>
      </div>

      <div className="form-buttons">
        <button onClick={guardar} disabled={subiendo}>
          {editando ? "Actualizar" : "Guardar"}
        </button>
        <button onClick={onCancelar} disabled={subiendo}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
