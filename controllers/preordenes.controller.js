import Preorden from "../models/Preorden.js";

// === GET todas para vendedor ===
export const obtenerPreordenes = async (req, res) => {
  try {
    const email = req.params.email;
    const lista = await Preorden.find({ vendedor: email }).sort({ createdAt: -1 });
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === GET para cliente ===
export const obtenerPreordenesCliente = async (req, res) => {
  try {
    const email = req.params.email;
    const lista = await Preorden.find({ usuario: email }).sort({ createdAt: -1 });
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === CREAR ===
export const crearPreorden = async (req, res) => {
  try {
    const nueva = new Preorden(req.body);
    await nueva.save();
    res.json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === ACTUALIZAR estado ===
export const actualizarEstadoPreorden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const actualizada = await Preorden.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    res.json(actualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === BORRAR (opcional) ===
export const eliminarPreorden = async (req, res) => {
  try {
    const { id } = req.params;
    await Preorden.findByIdAndDelete(id);
    res.json({ mensaje: "Preorden eliminada" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
