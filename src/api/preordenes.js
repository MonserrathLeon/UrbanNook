const API_URL = "http://localhost:5000/api/preordenes";

export async function obtenerPreordenes(vendedorEmail) {
  const res = await fetch(`${API_URL}/vendedor/${vendedorEmail}`);
  return res.json();
}

export async function actualizarEstado(id, estado) {
  await fetch(`${API_URL}/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
}
