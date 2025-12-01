// routes/usuario.js 
import express from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// ===============================
// ✅ OBTENER USUARIO POR ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener usuario" });
  }
});
// ===============================
// ✅ OBTENER TODOS LOS USUARIOS
// ===============================
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password"); // traer todos sin password
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

// ===============================
// ✅ ACTUALIZAR PERFIL (NUEVA VERSIÓN OPTIMIZADA 🔥)
// ===============================
router.patch("/:id", async (req, res) => {
  try {
    const camposActualizables = {};

    if (req.body.nombre !== undefined) camposActualizables.nombre = req.body.nombre;
    if (req.body.email !== undefined) camposActualizables.email = req.body.email;
    if (req.body.rol !== undefined) camposActualizables.rol = req.body.rol;
    if (req.body.imagen !== undefined) camposActualizables.imagen = req.body.imagen;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      camposActualizables,
      {
        new: true,          // 🔥 Regresa el usuario FINAL actualizado
        select: "-password" // 🔥 No mandamos la contraseña
      }
    );

    if (!usuarioActualizado)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json(usuarioActualizado);

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
});

// ===============================
// ✅ CAMBIO DE CONTRASEÑA
// ===============================
router.patch("/:id/password", async (req, res) => {
  try {
    const { actualPassword, nuevaPassword, confirmarPassword } = req.body;

    if (!actualPassword || !nuevaPassword || !confirmarPassword)
      return res.status(400).json({ mensaje: "Faltan datos" });

    if (nuevaPassword !== confirmarPassword)
      return res.status(400).json({ mensaje: "Las contraseñas nuevas no coinciden" });

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const esValida = await bcrypt.compare(actualPassword, usuario.password);
    if (!esValida)
      return res.status(400).json({ mensaje: "Contraseña actual incorrecta" });

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cambiar contraseña" });
  }
});

// ===============================
// ✅ AGREGAR O EDITAR DIRECCIÓN
// ===============================
router.patch("/:id/direcciones", async (req, res) => {
  try {
    const { passwordActual, direccion, editIndex } = req.body;

    if (!direccion || !direccion.direccion || !direccion.ciudad ||
        !direccion.estado || !direccion.cp || !direccion.telefono)
      return res.status(400).json({ mensaje: "Faltan datos en la dirección" });

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const esValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValida)
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });

    if (!usuario.direcciones) usuario.direcciones = [];

    if (editIndex !== null && editIndex !== undefined && usuario.direcciones[editIndex]) {
      usuario.direcciones[editIndex] = direccion;
    } else {
      usuario.direcciones.push(direccion);
    }

    await usuario.save();

    const usuarioSinPass = usuario.toObject();
    delete usuarioSinPass.password;

    res.json({
      mensaje: "Dirección guardada correctamente",
      usuario: usuarioSinPass
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al guardar dirección" });
  }
});

// ===============================
// ✅ ELIMINAR DIRECCIÓN
// ===============================
router.delete("/:id/direcciones/:index", async (req, res) => {
  try {
    const { id, index } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (!usuario.direcciones.length)
      return res.status(400).json({ mensaje: "No hay direcciones para eliminar" });

    usuario.direcciones.splice(index, 1);
    await usuario.save();

    const usuarioSinPass = usuario.toObject();
    delete usuarioSinPass.password;

    res.json({
      mensaje: "Dirección eliminada correctamente",
      usuario: usuarioSinPass
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar dirección" });
  }
});

// ===============================
// ✅ ELIMINAR CUENTA COMPLETA
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json({ mensaje: "Cuenta eliminada correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar cuenta" });
  }
});

export default router;
