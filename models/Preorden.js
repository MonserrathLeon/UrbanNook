// src/models/Preorden.js
import mongoose from "mongoose";

const PreordenSchema = new mongoose.Schema({
  productoNombre: { type: String, required: true },
  imagen: { type: String },
  descripcionPersonalizada: { type: String },
  cantidad: { type: Number, default: 1 },
  precioBase: { type: Number, required: true },
  recargoPersonalizado: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Relación
  usuario: { type: String, required: true }, // email del comprador
  vendedor: { type: String, required: true }, // email del vendedor

  // Datos extras
  direccion: { type: String, required: true },
  metodoPago: { type: String, required: true },

  estado: {
    type: String,
    default: "Pendiente",
    enum: ["Pendiente", "Aceptado", "En proceso", "En camino", "Entregado", "Rechazado"]
  }
}, {
  timestamps: true
});

export default mongoose.model("Preorden", PreordenSchema);
