import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CrearPoliza from "./pages/CrearPoliza";
import Suscripcion from "./pages/Suscripcion";
import Finanzas from "./pages/Finanzas";
import Siniestros from "./pages/Siniestros";
import Configuracion from "./pages/Configuracion";
import Auditoria from "./pages/Auditoria";

// Menú lateral estático (Layout)
function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const getLinkStyle = (matchPath: string) => ({
    display: "block",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    background: path === matchPath ? "#e0f2fe" : "transparent",
    color: path === matchPath ? "#0369a1" : "#475569",
    transition: "all 0.2s"
  });

  return (
    <div style={{ width: "260px", background: "white", minHeight: "100vh", borderRight: "1px solid #e2e8f0", padding: "20px" }}>
      <h1 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "30px" }}>SiAsesores V2</h1>
      
      <nav>
        <Link style={getLinkStyle("/")} to="/">Inicio (Dashboard)</Link>
        <Link style={getLinkStyle("/suscripcion")} to="/suscripcion">Suscripción</Link>
        <Link style={getLinkStyle("/finanzas")} to="/finanzas">Finanzas</Link>
        <Link style={getLinkStyle("/siniestros")} to="/siniestros">Siniestros</Link>
        <Link style={getLinkStyle("/configuracion")} to="/configuracion">Configuración</Link>
        <Link style={getLinkStyle("/auditoria")} to="/auditoria">Sistema</Link>
      </nav>
    </div>
  );
}

// Pantalla de Inicio / Dashboard temporal
function Dashboard() {
  return (
    <div>
      <h2 style={{ color: "#1e293b", marginTop: 0 }}>Dashboard Global</h2>
      <p style={{ color: "#64748b" }}>Aquí irán las gráficas, comisiones del mes y pólizas por vencer.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        
        {/* Panel Lateral Izquierdo */}
        <Sidebar />

        {/* Contenido Dinámico (Derecha) */}
        <div style={{ flex: 1, padding: "30px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/suscripcion" element={<Suscripcion />} />
            <Route path="/crear-poliza" element={<CrearPoliza />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/siniestros" element={<Siniestros />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/auditoria" element={<Auditoria />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}
