// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// ==========================
// ✅ REGISTRO
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: "El correo ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordHasheada,
      rol,
      imagen: "",
      direcciones: []
    });

    await nuevoUsuario.save();

    res.json({ message: "Usuario registrado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ==========================
// ✅ LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: "Usuario no encontrado" });

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    const usuarioSinPass = usuario.toObject();
    delete usuarioSinPass.password;

    res.json({
      message: "Inicio de sesión exitoso",
      usuario: usuarioSinPass,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
