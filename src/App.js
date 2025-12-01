// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./components/LoginRegister";
import Home from "./components/Home";
import MenuPrincipal from "./components/MenuPrincipal";
import VendedorDashboard from "./components/VendedorDashboard";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });

  // Mantiene el usuario guardado siempre actualizado
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("usuario");
    }
  }, [usuario]);

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<LoginRegister actualizarUsuario={setUsuario} />}
        />

        {/* HOME */}
        <Route
          path="/home"
          element={usuario ? <Home usuario={usuario} /> : <Navigate to="/" />}
        />

        {/* MENÚ PRINCIPAL */}
        <Route
          path="/menu"
          element={
            usuario ? (
              <MenuPrincipal usuario={usuario} actualizarUsuario={setUsuario} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* DASHBOARD VENDEDOR */}
        <Route
          path="/vendedor"
          element={
            usuario ? (
              <VendedorDashboard usuario={usuario} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
