import express from "express";
import Notificacion from "../models/Notificacion.js";

const router = express.Router();

// Crear notificación
router.post("/", async (req, res) => {
  try {
    const { usuario, mensaje, titulo } = req.body;
    if (!usuario || !mensaje)
      return res.status(400).json({ error: "Faltan datos" });

    const nueva = new Notificacion({
      usuario: usuario.trim().toLowerCase(),
      mensaje,
      titulo: titulo || "Notificación",
      fecha: new Date(),
    });
    await nueva.save();
    res.json({ message: "Notificación creada ✅", notificacion: nueva });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear notificación" });
  }
});

// Obtener notificaciones por usuario
router.get("/:usuario", async (req, res) => {
  try {
    const { usuario } = req.params;
    const notificaciones = await Notificacion.find({ usuario: usuario.trim().toLowerCase() }).sort({ fecha: -1 });
    res.json(Array.isArray(notificaciones) ? notificaciones : []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

export default router;
