import React, { createContext, useContext, useState } from "react";
import Notis from "../components/Notis";

const NotiCtx = createContext(null);

export function NotiProvider({ children }) {
  const [lista, setLista] = useState([]);

  const push = (mensaje, tipo = "info", duration = 2500) => {
    const id = Date.now();
    setLista((prev) => [...prev, { id, mensaje, tipo, duration }]);
  };

  const remove = (id) => setLista((prev) => prev.filter((n) => n.id !== id));

  const api = {
    ok: (m) => push(m, "ok"),
    success: (m) => push(m, "ok"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <NotiCtx.Provider value={api}>
      {children}

      <div className="notis-container">
        {lista.map((n) => (
          <Notis
            key={n.id}
            mensaje={n.mensaje}
            tipo={n.tipo}
            duration={n.duration}
            onClose={() => remove(n.id)}
          />
        ))}
      </div>
    </NotiCtx.Provider>
  );
}

export const useNotis = () => useContext(NotiCtx);
