import { Router } from "express";
import {
  obtenerPedidos,
  obtenerHistorialPedidos,
  crearPedido,
  actualizarPedido,
  actualizarEstadoPedido,
  eliminarPedido,
} from "../controllers/pedidos.controller.js";

const router = Router();

// ==============================
// 📦 1. Obtener pedidos (comprador o vendedor)
// /api/pedidos?vendedor=email  OR  /api/pedidos?usuario=email
// ==============================
router.get("/", obtenerPedidos);

// ==============================
// 📦 2. Obtener historial ENTREGADO / FINALIZADO
// /api/pedidos/historial/:email
// ==============================
router.get("/historial/:email", obtenerHistorialPedidos);

// ==============================
// 📦 3. Crear pedido
// ==============================
router.post("/", crearPedido);

// ==============================
// 📦 4. Actualización general (menos usuario/vendedor/productos)
// ==============================
router.patch("/:id", actualizarPedido);

// ==============================
// 📦 5. Actualizar SOLO el estado
// ==============================
router.patch("/:id/estado", actualizarEstadoPedido);


// ==============================
// 📦 6. Eliminar pedido
// ==============================
router.delete("/:id", eliminarPedido);

export default router;
