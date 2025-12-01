import React, { useState, useEffect } from "react";
import "../styles/LoginRegister.css";
import AdminDashboard from "./AdminDashboard";
import VendedorDashboard from "./VendedorDashboard";
import MenuPrincipal from "./MenuPrincipal";
import Home from "./Home";
import logo from "../assets/Urban.png";

export default function LoginRegister() {
  const [activeForm, setActiveForm] = useState(null); // "login" o "register"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verHome, setVerHome] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [rolError, setRolError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetFields = () => {
    setNombre(""); setPassword(""); setRol("");
    setPasswordError(""); setRolError("");
  };

  useEffect(() => {
    if (password.length === 0) setPasswordError("");
    else if (password.length < 8 && !/\d/.test(password))
      setPasswordError("Mínimo 8 caracteres y al menos 1 número.");
    else if (password.length < 8) setPasswordError("Mínimo 8 caracteres.");
    else if (!/\d/.test(password)) setPasswordError("Debe contener al menos 1 número.");
    else setPasswordError("");
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeForm === "register" && !rol) {
      setRolError("Debes seleccionar un rol");
      return;
    } else { setRolError(""); }

    if (passwordError) return;

    const formData =
      activeForm === "register"
        ? { nombre, email, password, rol }
        : { email, password };

    try {
      setLoading(true);
      setStatusMessage("Cargando...");
      setSuccess(false);

      const url = activeForm === "register"
        ? "http://localhost:5000/api/register"
        : "http://localhost:5000/api/login";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (data.error) {
        setPasswordError(data.error);
        setStatusMessage("");
        return;
      }

      if (activeForm === "register") {
        // Registro exitoso → ir automáticamente a login
        setStatusMessage("¡Registro exitoso! Redirigiendo a inicio de sesión...");
        setSuccess(true);
        setTimeout(() => {
          setActiveForm("login");
          setStatusMessage("");
          setSuccess(false);
          setPassword("");
        }, 1500);
        return;
      }

      // Login exitoso
      setStatusMessage("¡Sesión iniciada correctamente!");
      setSuccess(true);

      if (data.usuario) {
        setUsuario(data.usuario);
        if (data.usuario.rol === "comprador") setVerHome(true);
      }

      setTimeout(() => {
        setStatusMessage("");
        setSuccess(false);
        resetFields();
      }, 1500);

    } catch (err) {
      console.error(err);
      setPasswordError("Error de conexión");
      setStatusMessage("");
      setLoading(false);
    }
  };

  const handleLogout = () => { setUsuario(null); resetFields(); setActiveForm(null); setVerHome(false); };

  // Redirección según rol
  if (usuario) {
    if (usuario.rol === "administrador") return <AdminDashboard usuario={usuario} onLogout={handleLogout} />;
    if (usuario.rol === "vendedor") return <VendedorDashboard usuario={usuario} onLogout={handleLogout} />;
    if (usuario.rol === "comprador" && verHome) return <Home usuario={usuario} onLogout={handleLogout} />;
    return <MenuPrincipal usuario={usuario} onLogout={handleLogout} />;
  }

  // Pantalla inicial
  if (!activeForm) {
    return (
      <div className="intro-screen">
        <div className="intro-card">
          <h1 className="intro-title">UrbanNook</h1>
          <p className="intro-subtitle">Tu espacio urbano para todo lo que imaginas 🏙️</p>
          <div className="intro-buttons">
            <button onClick={() => setActiveForm("login")}>Iniciar sesión</button>
            <button onClick={() => setActiveForm("register")}>Registrarse</button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de login o registro
  return (
    <div className="container">
      <div className="left-panel">
        <img src={logo} alt="UrbanNook logo" className="logo" />
        <h1>UrbanNook</h1>
        <p className="slogan">Tu espacio urbano para todo lo que imaginas 🏙️</p>
      </div>
      <div className="right-panel">
        <div className="card">
          <h2>{activeForm === "register" ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
          <form onSubmit={handleSubmit}>
            {activeForm === "register" && (
              <>
                <div className="form-group">
                  <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e)=>setNombre(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <select value={rol} onChange={(e)=>setRol(e.target.value)} required>
                    <option value="">Selecciona un rol</option>
                    <option value="administrador">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="comprador">Comprador</option>
                  </select>
                  {rolError && <div className="error-message">{rolError}</div>}
                </div>
              </>
            )}
            <div className="form-group">
              <input type="email" placeholder="Correo electrónico" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div className="form-group password-container">
              <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
              <span className="toggle-password" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"\u{1F441}":"\u{1F441}"}</span>
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>

            {statusMessage && (
              <div className={`status-message ${loading ? "loading" : ""}`}>
                {success && !loading && <span className="checkmark">✔️</span>} {statusMessage}
              </div>
            )}

            <button type="submit">{activeForm==="register"?"Registrarse":"Entrar"}</button>
            <button type="button" className="volver-btn" onClick={()=>{setActiveForm(null); resetFields();}}>⬅ Volver</button>
          </form>
        </div>
      </div>
    </div>
  );
}

