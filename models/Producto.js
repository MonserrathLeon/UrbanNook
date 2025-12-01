import mongoose from "mongoose";

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  imagen: { type: String },
  descripcion: { type: String },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  vendedor: { type: String, required: true }, // email del vendedor
}, { timestamps: true });

export default mongoose.model("Producto", ProductoSchema);
