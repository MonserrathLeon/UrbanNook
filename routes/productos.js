import { Router } from "express";
import {
  getProductos,
  getProductosVendedor,
  crearProducto,
  editarProducto,
  eliminarProducto
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", getProductos);
router.get("/vendedor/:email", getProductosVendedor);

router.post("/", crearProducto);

router.put("/:id", editarProducto);

router.delete("/:id", eliminarProducto);

export default router;
