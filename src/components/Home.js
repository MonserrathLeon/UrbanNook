// src/components/Home.js
import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import MenuPrincipal from "./MenuPrincipal";
import logo from "../assets/UrbanLogo.PNG"; 
import { useNavigate } from "react-router-dom";

const Home = ({ usuario, onLogout }) => {
  const [verMenu, setVerMenu] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const navigate = useNavigate();

  const irAlMenu = () => setVerMenu(true);

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("usuario");
      navigate("/");
    }
  };

  // Traer productos desde backend
  useEffect(() => {
    fetch("http://localhost:5000/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  if (verMenu) return <MenuPrincipal usuario={usuario} onLogout={handleLogout} />;

  // Filtrado de productos por categoría
  const productosFiltrados =
    categoriaFiltro === "Todos"
      ? productos
      : productos.filter((prod) => prod.categoria === categoriaFiltro);

  // Obtener categorías únicas
  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria))];

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="UrbanNook Logo" className="logo-img" />
          <h1 className="logo-text">UrbanNook</h1>
        </div>
        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="home-header">
        <div className="home-overlay">
          <h1 className="home-title">Bienvenido a UrbanNook</h1>
          <p className="home-description">Descubre lo único. Apoya lo urbano.</p>
          <button className="home-btn" onClick={irAlMenu}>
            Explora lo urbano
          </button>
        </div>
      </header>

      {/* Sección de categorías */}
      <section className="categoria-filtro">
        <p>Filtrar por categoría:</p>
        <div className="categoria-buttons">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={categoriaFiltro === cat ? "active" : ""}
              onClick={() => setCategoriaFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Sección de productos */}
      <section className="productos-section">
        <h2 className="productos-title">
          {categoriaFiltro === "Todos" ? "Productos Destacados" : categoriaFiltro}
        </h2>
        <div className="productos-grid">
          {productosFiltrados.length === 0 && <p>Cargando productos...</p>}
          {productosFiltrados.slice(0, 3).map((prod) => (
            <div key={prod._id} className="producto-card">
              <img src={prod.imagen} alt={prod.nombre} className="producto-img" />
              <div className="producto-info">
                <h3>{prod.nombre}</h3>
                <p className="categoria">{prod.categoria}</p>
                <p className="estrellas">
                  {"★".repeat(Math.round(prod.calificacion))}{" "}
                  {"☆".repeat(5 - Math.round(prod.calificacion))}
                </p>
                <button
                  className="ver-btn"
                  onClick={() => navigate(`/categoria/${prod.categoria}`)}
                >
                  Ver más
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="contact-info">
          <p><strong>Dirección:</strong> Calle 45, Col. Centro, Ciudad de México.</p>
          <p><strong>Teléfono:</strong> +52 123 456 7890</p>
          <p><strong>Redes Sociales:</strong></p>
          <div className="social-links">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn-icons-png.flaticon.com/512/220/220200.png" alt="Facebook" className="social-icon" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/1024px-Instagram_logo_2022.svg.png" alt="Instagram" className="social-icon" />
            </a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
              <img src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg" alt="Twitter" className="social-icon" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
