import express from "express";
import Review from "../models/Review.js";
import Notificacion from "../models/Notificacion.js";

const router = express.Router();


// =========================
// 🟢 CREAR REVIEW
// =========================
router.post("/", async (req, res) => {
  try {
    const {
      usuario,        // email del usuario
      nombreUsuario,  // nombre o email
      productoId,
      productoNombre,
      vendedor,       // email del vendedor
      rating,
      comentario
    } = req.body;

    // Validación
    if (!usuario || !productoId || !productoNombre || !vendedor || rating === undefined) {
      return res.status(400).json({ error: "Datos incompletos para crear review" });
    }

    // Crear review
    const review = await Review.create({
      usuario,
      nombreUsuario: nombreUsuario || usuario,
      productoId,
      productoNombre,
      vendedor,
      rating,
      comentario,
      fecha: new Date()
    });

    // Crear notificación para el vendedor
    try {
      await Notificacion.create({
        usuario: vendedor,
        titulo: "Nueva reseña",
        mensaje: `📣 ${nombreUsuario || usuario} dejó una reseña en ${productoNombre}`,
        fecha: new Date(),
        leido: false
      });
    } catch (err) {
      console.warn("No se pudo crear notificación:", err.message);
    }

    res.status(201).json(review);

  } catch (err) {
    console.error("Error creando review:", err);
    res.status(500).json({ error: "Error creando review" });
  }
});


// =========================
// 🟡 OBTENER REVIEWS POR PRODUCTO
// =========================
router.get("/", async (req, res) => {
  try {
    const { productoId } = req.query;

    if (!productoId) {
      return res.status(400).json({ error: "productoId requerido" });
    }

    const reviews = await Review.find({ productoId }).sort({ fecha: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error obteniendo reviews:", err);
    res.status(500).json({ error: "Error obteniendo reviews" });
  }
});


// =========================
// 🟠 OBTENER REVIEWS POR VENDEDOR
// =========================
router.get("/vendedor/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const reviews = await Review.find({ vendedor: email }).sort({ fecha: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error obteniendo reviews vendedor:", err);
    res.status(500).json({ error: "Error obteniendo reviews vendedor" });
  }
});


export default router;
