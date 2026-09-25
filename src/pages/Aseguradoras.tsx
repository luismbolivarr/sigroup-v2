import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { Aseguradora } from "../types/database.types";

export default function Aseguradoras() {
  const [aseguradoras, setAseguradoras] = useState<Aseguradora[]>([]);
  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar aseguradoras al abrir la pantalla
  useEffect(() => {
    fetchAseguradoras();
  }, []);

  async function fetchAseguradoras() {
    const { data, error } = await supabase
      .from("aseguradoras")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) console.error("Error cargando:", error);
    else setAseguradoras(data || []);
  }

  // Guardar nueva aseguradora
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("aseguradoras")
      .insert([{ nombre, rif }]);

    setLoading(false);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      setNombre("");
      setRif("");
      fetchAseguradoras(); // Recargar la tabla
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Gestión de Aseguradoras</h2>

      {/* Interfaz de Usuario: Formulario para agregar */}
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h3 style={{ marginTop: 0 }}>Agregar Nueva Aseguradora</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Nombre (Ej. Mapfre)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ padding: "8px", flex: 1 }}
          />
          <input
            type="text"
            placeholder="RIF / NIT"
            value={rif}
            onChange={(e) => setRif(e.target.value)}
            style={{ padding: "8px", flex: 1 }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "8px 16px", background: "#0066cc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>

      {/* Interfaz de Usuario: Tabla de datos */}
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Nombre</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>RIF / NIT</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {aseguradoras.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: "10px", textAlign: "center", color: "#666" }}>
                No hay aseguradoras registradas aún.
              </td>
            </tr>
          ) : (
            aseguradoras.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{a.nombre}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{a.rif || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  {a.activo ? "✅ Activa" : "❌ Inactiva"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
