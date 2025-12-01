import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema({
  usuario: { type: String, required: true }, // email del cliente
  vendedor: { type: String, required: true }, // email del vendedor 🔥
  estado: {
    type: String,
    default: "Pendiente",
    enum: ["Pendiente", "Enviado", "Entregado", "Cancelado"]
  },
  productos: [
    {
      nombre: { type: String, required: true },
      cantidad: { type: Number, default: 1 },
      precio: { type: Number, required: true },
      descripcionPersonalizada: String,
      imagen: String,
    }
  ],
  total: { type: Number, required: true },
  metodoPago: String,
  fecha: { type: Date, default: Date.now },
  direccion: {
    calle: String,
    numero: String,
    colonia: String,
    ciudad: String,
    estado: String,
    pais: String,
    codigoPostal: String
  }
}, { timestamps: true });

export default mongoose.model("Pedido", PedidoSchema);
