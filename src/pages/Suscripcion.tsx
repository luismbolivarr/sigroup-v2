import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Suscripcion() {
  const [tab, setTab] = useState('polizas');

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#1e293b" }}>Suscripción (Pólizas y Clientes)</h2>
        <Link to="/crear-poliza" style={{ background: "#0ea5e9", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>
          + Crear Nueva Póliza
        </Link>
      </div>
      
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab('polizas')} style={{ background: tab === 'polizas' ? "#0f172a" : "transparent", color: tab === 'polizas' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Bandeja de Pólizas</button>
        <button onClick={() => setTab('clientes')} style={{ background: tab === 'clientes' ? "#0f172a" : "transparent", color: tab === 'clientes' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Directorio de Clientes</button>
      </div>

      {tab === 'polizas' && (
        <div>
          <h4 style={{ color: "#334155" }}>Pólizas Vigentes, Cotizaciones y Renovaciones</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Listado maestro de todo tu portafolio de seguros emitidos.</p>
        </div>
      )}

      {tab === 'clientes' && (
        <div>
          <h4 style={{ color: "#334155" }}>Base de Datos de Tomadores y Asegurados</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Centralización de contactos (Módulo de cumpleaños saldrá de aquí).</p>
        </div>
      )}
    </div>
  );
}

