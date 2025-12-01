import express from "express";
import Direccion from "../models/Direccion.js";

const router = express.Router();

// 🟢 AGREGAR DIRECCIÓN
router.post("/agregar", async (req, res) => {
  try {
    const { usuarioId, pais, estado, ciudad, calle, numero, colonia, codigoPostal } = req.body;

    if (!usuarioId || !pais || !estado || !ciudad || !calle || !numero || !colonia || !codigoPostal) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const nuevaDireccion = new Direccion({
      usuarioId,
      pais,
      estado,
      ciudad,
      calle,
      numero,
      colonia,
      codigoPostal,
    });

    await nuevaDireccion.save();
    res.json({ mensaje: "Dirección agregada correctamente", direccion: nuevaDireccion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al guardar la dirección" });
  }
});

// 🟡 OBTENER TODAS LAS DIRECCIONES DE UN USUARIO
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const direcciones = await Direccion.find({ usuarioId: req.params.usuarioId });
    res.json(direcciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener direcciones" });
  }
});

// 🟠 EDITAR DIRECCIÓN
router.patch("/:id", async (req, res) => {
  try {
    const { pais, estado, ciudad, calle, numero, colonia, codigoPostal } = req.body;
    const direccion = await Direccion.findById(req.params.id);

    if (!direccion) return res.status(404).json({ mensaje: "Dirección no encontrada" });

    direccion.pais = pais ?? direccion.pais;
    direccion.estado = estado ?? direccion.estado;
    direccion.ciudad = ciudad ?? direccion.ciudad;
    direccion.calle = calle ?? direccion.calle;
    direccion.numero = numero ?? direccion.numero;
    direccion.colonia = colonia ?? direccion.colonia;
    direccion.codigoPostal = codigoPostal ?? direccion.codigoPostal;

    await direccion.save();
    res.json({ mensaje: "Dirección actualizada correctamente", direccion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar dirección" });
  }
});

// 🔴 ELIMINAR DIRECCIÓN
router.delete("/:id", async (req, res) => {
  try {
    const direccion = await Direccion.findByIdAndDelete(req.params.id);
    if (!direccion) return res.status(404).json({ mensaje: "Dirección no encontrada" });
    res.json({ mensaje: "Dirección eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar dirección" });
  }
});

export default router;
