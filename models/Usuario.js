// models/Usuario.js
import mongoose from "mongoose";

const direccionSchema = new mongoose.Schema({
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  estado: { type: String, required: true },
  cp: { type: String, required: true },
  telefono: { type: String, required: true },
});

// Esquema principal de usuario
const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: {
      type: String,
      enum: ["administrador", "vendedor", "comprador"],
      required: true,
    },
    imagen: { type: String, default: "" }, // Foto de perfil o URL
    direcciones: [direccionSchema], // Subdocumentos de direcciones
  },
  {
    timestamps: true, // Guarda createdAt y updatedAt automáticamente
    collection: "usuarios", // Nombre exacto de la colección
  }
);

// Exportar modelo
export default mongoose.model("Usuario", usuarioSchema);
