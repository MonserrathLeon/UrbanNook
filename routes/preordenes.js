import { Router } from "express";
import {
  obtenerPreordenes,
  obtenerPreordenesCliente,
  crearPreorden,
  actualizarEstadoPreorden,
  eliminarPreorden
} from "../controllers/preordenes.controller.js";

const router = Router();

// CLIENTE
router.get("/cliente/:email", obtenerPreordenesCliente);

// VENDEDOR
router.get("/vendedor/:email", obtenerPreordenes);

// CREAR
router.post("/", crearPreorden);

// CAMBIAR ESTADO
router.patch("/:id/estado", actualizarEstadoPreorden);

// BORRAR (opcional)
router.delete("/:id", eliminarPreorden);

export default router;
