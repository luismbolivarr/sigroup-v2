import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Aseguradora } from "../types/database.types";

export default function DiagnosticoBD() {
  const [estado, setEstado] = useState<string>("Iniciando prueba...");
  const [datos, setDatos] = useState<Aseguradora[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const probarConexion = async () => {
    setLoading(true);
    setError(null);
    setEstado("1. Probando lectura de la tabla Aseguradoras...");
    
    try {
      // 1. Leer aseguradoras
      const { data: aseguradoras, error: readError } = await supabase
        .from("aseguradoras")
        .select("*")
        .limit(5);

      if (readError) throw readError;
      
      setDatos(aseguradoras || []);
      setEstado("✅ ¡Conexión exitosa! Base de datos respondiendo.");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error desconocido");
      setEstado("❌ Falló la prueba.");
    } finally {
      setLoading(false);
    }
  };

  const insertarPrueba = async () => {
    setLoading(true);
    setError(null);
    setEstado("Insertando dato de prueba...");

    try {
      // Validado por TypeScript gracias a database.types.ts
      const { error: insertError } = await supabase
        .from("aseguradoras")
        .insert({
          nombre: "Seguros de Prueba " + Math.floor(Math.random() * 1000),
          rif_nit: "J-" + Math.floor(Math.random() * 99999999),
          estado: true,
        });

      if (insertError) throw insertError;
      
      setEstado("✅ ¡Dato insertado correctamente!");
      probarConexion(); // Refrescar la lista

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al insertar");
      setEstado("❌ Falló la inserción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginTop: "20px" }}>
      <h3 style={{ marginTop: 0 }}>🧪 Diagnóstico de Base de Datos (V2)</h3>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Esta es una prueba técnica para validar que la estructura SQL que insertamos y los tipos TypeScript funcionan perfectamente.
      </p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={probarConexion} 
          disabled={loading}
          style={{ padding: "8px 16px", background: "#0066cc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Cargando..." : "1️⃣ Leer Base de Datos"}
        </button>
        <button 
          onClick={insertarPrueba} 
          disabled={loading}
          style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Insertando..." : "2️⃣ Insertar Seguro de Prueba"}
        </button>
      </div>

      <div style={{ padding: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", fontFamily: "monospace" }}>
        <strong>Estado:</strong> {estado}
        
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <strong>Error:</strong> {JSON.stringify(error, null, 2)}
          </div>
        )}
      </div>

      {datos.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Datos reales obtenidos de Supabase:</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "8px", borderBottom: "1px solid #cbd5e1" }}>Nombre</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #cbd5e1" }}>RIF/NIT</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #cbd5e1" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{d.nombre}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{d.rif_nit}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ background: d.estado ? "#dcfce7" : "#fee2e2", color: d.estado ? "#166534" : "#991b1b", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {d.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

