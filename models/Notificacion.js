import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema({
  usuario: { type: String, required: true }, // email o "vendedor"
  titulo: { type: String, default: "Notificación" },
  mensaje: { type: String, required: true },
  leido: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
});

// Nombre exacto de la colección: "notificacions"
export default mongoose.model("Notificacion", notificacionSchema, "notificacions");
