import { useState } from 'react';

export default function Auditoria() {
  const [tab, setTab] = useState('usuarios');

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Seguridad y Sistema</h2>
      
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab('usuarios')} style={{ background: tab === 'usuarios' ? "#0f172a" : "transparent", color: tab === 'usuarios' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Usuarios y Permisos</button>
        <button onClick={() => setTab('logs')} style={{ background: tab === 'logs' ? "#0f172a" : "transparent", color: tab === 'logs' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Log de Auditoría</button>
      </div>

      {tab === 'usuarios' && (
        <div>
          <h4 style={{ color: "#334155" }}>Control de Acceso</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Asignación de roles (Admin, Asesor, Visualizador) a tu equipo interno.</p>
        </div>
      )}

      {tab === 'logs' && (
        <div>
          <h4 style={{ color: "#334155" }}>Trazabilidad Total</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Historial inmutable de quién hizo qué (ej. "Luis borró una póliza a las 3:00 PM").</p>
        </div>
      )}
    </div>
  );
}

