import Pedido from "../models/Pedido.js";
import Notificacion from "../models/Notificacion.js";
// ======================
// 🔹 OBTENER PEDIDOS (comprador o vendedor)
// ======================
export const obtenerPedidos = async (req, res) => {
  try {
    const { vendedor, usuario } = req.query;

    let filtro = {};
    if (vendedor) filtro.vendedor = vendedor;
    if (usuario) filtro.usuario = usuario;

    const pedidos = await Pedido.find(filtro).sort({ fecha: -1 });

    return res.json({
      ok: true,
      pedidos,
    });
  } catch (err) {
    console.error("❌ Error obteniendo pedidos:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener pedidos",
    });
  }
};

// ======================
// 🔥 OBTENER HISTORIAL (solo ENTREGADOS)
// ======================
export const obtenerHistorialPedidos = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ mensaje: "Email requerido" });
    }

    const pedidos = await Pedido.find({
      usuario: email,
      estado: { $in: ["Entregado", "Finalizado"] },
    }).sort({ fecha: -1 });

    // ⚠️ DEVOLVER ARRAY DIRECTO
    return res.json(pedidos);

  } catch (err) {
    console.error("❌ Error obteniendo historial:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener historial de pedidos",
    });
  }
};

// ======================
// 🔹 CREAR PEDIDO
// ======================
export const crearPedido = async (req, res) => {
  try {
    const { usuario, productos, total, metodoPago, direccion } = req.body;

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta el usuario",
      });
    }

    if (!productos || productos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No hay productos en el pedido",
      });
    }

    const vendedor = productos[0]?.vendedor;
    if (!vendedor) {
      return res.status(400).json({
        ok: false,
        mensaje: "Cada producto necesita un vendedor",
      });
    }

    // Normalizar productos
    const productosLimpios = productos.map((p) => ({
      nombre: p.nombre,
      cantidad: Number(p.cantidad || 1),
      precio: Number(p.precio || 0),
      descripcionPersonalizada: p.descripcionPersonalizada || "",
      imagen: p.imagen || "",
  
    }));

    const nuevoPedido = new Pedido({
      usuario,
      vendedor,
      productos: productosLimpios,
      total,
      metodoPago,
      direccion,
      fecha: new Date(),
      estado: "Pendiente",
    });

    const pedidoGuardado = await nuevoPedido.save();

    return res.status(201).json({
      ok: true,
      pedido: pedidoGuardado,
    });

  } catch (err) {
    console.error("❌ Error creando pedido:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear pedido",
    });
  }
};

// ======================
// 🔹 ACTUALIZAR TODA LA DATA DEL PEDIDO
// ======================
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Campos que NO se pueden editar
    const camposBloqueados = ["vendedor", "usuario", "productos"];
    camposBloqueados.forEach((c) => delete datos[c]);

    const estadosPermitidos = ["Pendiente", "Enviado", "Entregado", "Cancelado"];
    if (datos.estado && !estadosPermitidos.includes(datos.estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Estado inválido (${datos.estado}). Permitidos: ${estadosPermitidos.join(", ")}`,
      });
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      datos,
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    return res.json({
      ok: true,
      pedido: pedidoActualizado,
    });

  } catch (err) {
    console.error("❌ Error actualizando pedido:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar pedido",
    });
  }
};

// ======================
// 🔥 CAMBIAR SOLO EL ESTADO
// ======================

export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["Pendiente", "Enviado", "Entregado", "Cancelado"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Estado inválido (${estado}). Permitidos: ${estadosPermitidos.join(", ")}`,
      });
    }

    // Buscar el pedido
    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    // Actualizar el estado
    pedido.estado = estado;
    await pedido.save();

    // Crear notificación para el comprador
    await Notificacion.create({
      usuario: pedido.usuario, // email del comprador
      titulo: "Actualización de pedido",
      mensaje: `Tu pedido ${pedido._id} cambió a estado: ${estado}`,
    });

    return res.json({
      ok: true,
      mensaje: "Estado actualizado y notificación enviada",
      pedido,
    });

  } catch (err) {
    console.error("❌ Error modificando estado:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al modificar estado del pedido",
    });
  }
};

// ======================
// 🔹 ELIMINAR PEDIDO
// ======================
export const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Pedido.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Pedido eliminado correctamente",
    });

  } catch (err) {
    console.error("❌ Error eliminando pedido:", err);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar pedido",
    });
  }
};
