import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Users, CreditCard, Shield, FileText,
  ChevronRight, ChevronLeft, Save, CheckCircle2,
  ArrowLeft
} from "lucide-react";

export default function CrearPoliza() {
  // Estado del Wizard
  const [paso, setPaso] = useState(1);
  const totalPasos = 4;

  // Estados de datos (simplificados visualmente para el cascarón)
  const [primaTotal, setPrimaTotal] = useState<number | "">("");
  const [frecuenciaPago, setFrecuenciaPago] = useState("ANUAL");

  // Cálculo de cuota automático (demostración visual)
  const cuota = primaTotal ? (Number(primaTotal) / (frecuenciaPago === "MENSUAL" ? 12 : frecuenciaPago === "TRIMESTRAL" ? 4 : frecuenciaPago === "SEMESTRAL" ? 2 : 1)).toFixed(2) : "0.00";

  // Componente de barra de progreso superior
  const Stepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-300" style={{ width: `${((paso - 1) / (totalPasos - 1)) * 100}%` }}></div>
        
        {[
          { id: 1, icon: <Building2 className="w-5 h-5" />, label: "Producto" },
          { id: 2, icon: <Users className="w-5 h-5" />, label: "Involucrados" },
          { id: 3, icon: <CreditCard className="w-5 h-5" />, label: "Finanzas" },
          { id: 4, icon: <FileText className="w-5 h-5" />, label: "Resumen" },
        ].map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300 ${
              paso >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
            } shadow-md`}>
              {paso > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
            </div>
            <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${paso >= step.id ? "text-blue-700" : "text-gray-400"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header superior */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nueva Suscripción</h1>
            <p className="text-gray-500 mt-1">Crea una nueva cotización o póliza paso a paso.</p>
          </div>
          <Link to="/suscripcion" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a Bandeja
          </Link>
        </div>

        {/* Contenedor Principal del Wizard */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="p-8">
            <Stepper />

            {/* --- PASO 1: PRODUCTO --- */}
            {paso === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Definición del Producto</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Productor / Asesor *</label>
                    <select className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      <option>Seleccione un productor...</option>
                      <option>Asesor Demo 1</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Empresa Aseguradora *</label>
                    <select className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      <option>Seleccione aseguradora...</option>
                      <option>Mapfre</option>
                      <option>Mercantil</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Ramo *</label>
                    <select className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      <option>Salud (HCM)</option>
                      <option>Automóvil</option>
                      <option>Vida</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <label className="text-sm font-semibold text-gray-800 mb-3 block">Coberturas Adicionales</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border shadow-sm cursor-pointer hover:border-blue-400">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /> Maternidad
                    </label>
                    <label className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border shadow-sm cursor-pointer hover:border-blue-400">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /> Odontología
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* --- PASO 2: INVOLUCRADOS --- */}
            {paso === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Datos del Tomador y Asegurados</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Cédula / RIF *</label>
                    <div className="flex">
                      <select className="h-11 border border-gray-300 rounded-l-lg px-2 bg-gray-100 border-r-0"><option>V-</option><option>J-</option></select>
                      <input type="text" placeholder="12345678" className="w-full h-11 border border-gray-300 rounded-r-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Nombre Completo / Razón Social *</label>
                    <input type="text" placeholder="EJ: JUAN PÉREZ" className="w-full h-11 border border-gray-300 rounded-lg px-4 uppercase focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Teléfono Celular *</label>
                    <input type="tel" placeholder="0414-1234567" className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Correo Electrónico *</label>
                    <input type="email" placeholder="cliente@ejemplo.com" className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                    <div>
                      <span className="font-bold text-indigo-900 block">Asegurados Adicionales / Beneficiarios</span>
                      <span className="text-sm text-indigo-700">Marque aquí si la póliza cubre a dependientes (cónyuge, hijos) o tiene beneficiarios preferenciales.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* --- PASO 3: FINANZAS --- */}
            {paso === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Finanzas y Cuotas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Número de Póliza (Vacío = Cotización)</label>
                    <input type="text" placeholder="Dejar vacío si es cotización..." className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Suma Asegurada (Cobertura Total)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-bold">USD</span>
                      <input type="number" placeholder="0.00" className="w-full h-11 border border-gray-300 rounded-lg pl-14 pr-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Prima Total (Costo Anual) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-bold">USD</span>
                      <input 
                        type="number" 
                        value={primaTotal}
                        onChange={(e) => setPrimaTotal(e.target.value ? Number(e.target.value) : "")}
                        placeholder="0.00" 
                        className="w-full h-11 border-2 border-blue-200 rounded-lg pl-14 pr-4 focus:border-blue-500 outline-none font-mono text-lg font-bold text-blue-900" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Frecuencia de Pago *</label>
                    <select 
                      value={frecuenciaPago}
                      onChange={(e) => setFrecuenciaPago(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="ANUAL">Anual (1 Pago)</option>
                      <option value="SEMESTRAL">Semestral (2 Pagos)</option>
                      <option value="TRIMESTRAL">Trimestral (4 Pagos)</option>
                      <option value="MENSUAL">Mensual (12 Pagos)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-900 text-white rounded-xl p-6 mt-6 flex justify-between items-center shadow-lg transform transition-all hover:scale-[1.01]">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Cálculo de Cuota Estimada</p>
                    <p className="text-xs text-gray-500 mt-1">Dividido según la frecuencia elegida</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black font-mono text-emerald-400">USD {cuota}</span>
                    <p className="text-xs text-gray-400 mt-1">por cuota</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- PASO 4: RESUMEN Y GUARDAR --- */}
            {paso === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Resumen y Emisión</h2>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-blue-900 mb-2">¡Casi listo!</h3>
                  <p className="text-sm text-blue-800">Verifica que los datos sean correctos. Al guardar, el sistema generará automáticamente las cuotas en el módulo de Finanzas.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Enlace al Cuadro de Póliza (PDF externo)</label>
                  <input type="url" placeholder="https://drive.google.com/..." className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Observaciones Internas</label>
                  <textarea rows={4} placeholder="Condiciones especiales, notas para cobranza..." className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
              </div>
            )}

          </div>

          {/* Footer del Wizard (Botones de acción) */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
            <button 
              onClick={() => setPaso(paso - 1)}
              disabled={paso === 1}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                paso === 1 ? "opacity-0 cursor-default" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Atrás
            </button>

            {paso < totalPasos ? (
              <button 
                onClick={() => setPaso(paso + 1)}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Siguiente <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => alert("¡Cotización guardada exitosamente!")}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 animate-pulse-once"
              >
                <Save className="w-5 h-5" /> Guardar en Base de Datos
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
