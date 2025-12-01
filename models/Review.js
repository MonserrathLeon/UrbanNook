import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  usuario: { type: String, required: true },     // email del usuario
  nombreUsuario: { type: String, default: "" },  // nombre visible
  productoId: { type: String, required: true },  // LO GUARDAMOS COMO STRING
  productoNombre: { type: String, required: true },
  vendedor: { type: String, required: true },    // email del vendedor
  rating: { type: Number, required: true, min: 0, max: 5 },
  comentario: { type: String, default: "" },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model("Review", reviewSchema, "reviews");
