import Producto from "../models/Producto.js";

// GET todos
export const getProductos = async (req, res) => {
  try {
    const data = await Producto.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET por vendedor
export const getProductosVendedor = async (req, res) => {
  try {
    const data = await Producto.find({ vendedor: req.params.email });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST crear
export const crearProducto = async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT editar
export const editarProducto = async (req, res) => {
  try {
    const prod = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(prod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const eliminarProducto = async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ msg: "Producto eliminado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
