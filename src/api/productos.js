const API_URL = "http://localhost:5000/api/productos";

export async function obtenerProductos(vendedorEmail) {
  const res = await fetch(`${API_URL}?vendedor=${vendedorEmail}`);
  return res.json();
}

export async function agregarProducto(producto) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  return res.json();
}

export async function editarProducto(id, producto) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  return res.json();
}

export async function eliminarProducto(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}
