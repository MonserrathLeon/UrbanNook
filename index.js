// index.js (servidor backend)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Rutas
import authRoutes from "./routes/auth.js";
import productosRoutes from "./routes/productos.js";
import usuariosRoutes from "./routes/usuario.js";
import pedidosRoutes from "./routes/pedidos.js";
import notificacionesRoutes from "./routes/notificaciones.js";
import preordenesRoutes from "./routes/preordenes.js"; // 
import direccionesRoutes from "./routes/direcciones.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();

// =======================
// ✅ Middlewares globales
// =======================

// Permitir peticiones desde el frontend
app.use(cors());

// Aumentar límite del body (evita PayloadTooLargeError)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =======================
// ✅ Conexión a MongoDB
// =======================
mongoose
  .connect(
    "mongodb+srv://Elote:bananacat_1@clusterprueba.dhaaqfr.mongodb.net/urbannook?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// =======================
// ✅ Rutas del backend
// =======================
app.use("/api", authRoutes);                         // login / registro
app.use("/api/productos", productosRoutes);          // productos
app.use("/api/usuarios", usuariosRoutes);            // usuarios
app.use("/api/pedidos", pedidosRoutes);              // pedidos
app.use("/api/notificaciones", notificacionesRoutes); // notificaciones
app.use("/api/preordenes", preordenesRoutes);        // ✅ PREORDENES NUEVO
app.use("/api/direcciones", direccionesRoutes);
app.use("/api/reviews", reviewsRouter);

// =======================
// ✅ Manejo global de 404
// =======================
// Esta versión NO rompe Express y captura cualquier ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// =======================
// ✅ Iniciar servidor
// =======================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
