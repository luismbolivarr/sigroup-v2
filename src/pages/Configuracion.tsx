import { useState } from 'react';

export default function Configuracion() {
  const [tab, setTab] = useState('convenios');

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Configuración de Negocio</h2>
      
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab('convenios')} style={{ background: tab === 'convenios' ? "#0f172a" : "transparent", color: tab === 'convenios' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Aseguradoras y Convenios</button>
        <button onClick={() => setTab('asesores')} style={{ background: tab === 'asesores' ? "#0f172a" : "transparent", color: tab === 'asesores' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Directorio Asesores</button>
        <button onClick={() => setTab('ramos')} style={{ background: tab === 'ramos' ? "#0f172a" : "transparent", color: tab === 'ramos' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Ramos y Coberturas</button>
      </div>

      {tab === 'convenios' && (
        <div>
          <h4 style={{ color: "#334155" }}>Gestión de Aseguradoras</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Aquí configuras a la empresa de seguros y defines estrictamente el % de comisión que le pagan a tu agencia filtrado por <strong>Ramo y Cobertura</strong>.</p>
        </div>
      )}

      {tab === 'asesores' && (
        <div>
          <h4 style={{ color: "#334155" }}>Equipo de Ventas</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Alta de productores y configuración de sus condiciones base.</p>
        </div>
      )}

      {tab === 'ramos' && (
        <div>
          <h4 style={{ color: "#334155" }}>Catálogo de Productos</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Gestión global de los Ramos de seguro y sus Coberturas aplicables.</p>
        </div>
      )}
    </div>
  );
}

