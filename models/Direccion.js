import mongoose from "mongoose";

const direccionSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  pais: { type: String, required: true },
  estado: { type: String, required: true },
  ciudad: { type: String, required: true },
  calle: { type: String, required: true },
  numero: { type: String, required: true },
  colonia: { type: String, required: true },
  codigoPostal: { type: String, required: true },
});

export default mongoose.model("Direccion", direccionSchema, "direcciones");
