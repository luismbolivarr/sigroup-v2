import { useState } from 'react';

export default function Finanzas() {
  const [tab, setTab] = useState('recaudacion');

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>💰 Finanzas (Cartera y Liquidaciones)</h2>
      
      {/* Navegación de Pestañas (Subniveles) */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab('recaudacion')} style={{ background: tab === 'recaudacion' ? "#0f172a" : "transparent", color: tab === 'recaudacion' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>1. Recaudación (Clientes)</button>
        <button onClick={() => setTab('aseguradoras')} style={{ background: tab === 'aseguradoras' ? "#0f172a" : "transparent", color: tab === 'aseguradoras' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>2. Gestión Aseguradoras</button>
        <button onClick={() => setTab('liquidaciones')} style={{ background: tab === 'liquidaciones' ? "#0f172a" : "transparent", color: tab === 'liquidaciones' ? "white" : "#64748b", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>3. Liquidación a Asesores</button>
      </div>

      {/* Contenido de cada pestaña */}
      {tab === 'recaudacion' && (
        <div>
          <h4 style={{ color: "#334155" }}>Por Cobrar y Conciliación Interna</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Aquí el asesor reporta que el cliente pagó y Administración concilia que el dinero cayó en el banco.</p>
        </div>
      )}

      {tab === 'aseguradoras' && (
        <div>
          <h4 style={{ color: "#334155" }}>Flujo de Aseguradoras</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Subniveles planificados aquí:</p>
          <ul style={{ color: "#475569", fontSize: "14px" }}>
            <li><strong>En Tránsito:</strong> Reloj de 7 días de los tickets enviados.</li>
            <li><strong>Cuadre de Comisiones:</strong> Comparar Estimado vs Real cuando la aseguradora nos paga.</li>
            <li><strong>En Reconsideración:</strong> La "zona de cuarentena" para comisiones en disputa.</li>
          </ul>
        </div>
      )}

      {tab === 'liquidaciones' && (
        <div>
          <h4 style={{ color: "#334155" }}>Comisiones Liberadas</h4>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Aquí solo cae el dinero que superó con éxito la gestión con aseguradoras, listo para transferirle a tu Asesor/Productor.</p>
        </div>
      )}
    </div>
  );
}

