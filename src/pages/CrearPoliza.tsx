import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  CreditCard,
  Shield,
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type {
  Productor,
  Aseguradora,
  Ramo,
  Cobertura,
} from "../types/database.types";

const FRECUENCIAS = {
  anual: 1,
  semestral: 2,
  trimestral: 4,
  mensual: 12,
} as const;

type FrecuenciaPago = keyof typeof FRECUENCIAS;

export default function CrearPoliza() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const totalPasos = 4;

  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productores, setProductores] = useState<Productor[]>([]);
  const [aseguradoras, setAseguradoras] = useState<Aseguradora[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [coberturas, setCoberturas] = useState<Cobertura[]>([]);

  // Paso 1 - Producto
  const [productorId, setProductorId] = useState("");
  const [aseguradoraId, setAseguradoraId] = useState("");
  const [ramoId, setRamoId] = useState("");
  const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<
    string[]
  >([]);

  // Paso 2 - Cliente / tomador
  const [tipoDocumento, setTipoDocumento] = useState<"V" | "E" | "J" | "G" | "P">("V");
  const [documentoIdentidad, setDocumentoIdentidad] = useState("");
  const [tipoPersona, setTipoPersona] = useState<"natural" | "juridica">("natural");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [estadoGeografico, setEstadoGeografico] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [parroquia, setParroquia] = useState("");

  // Paso 3 - Finanzas
  const [numeroPoliza, setNumeroPoliza] = useState("");
  const [sumaAsegurada, setSumaAsegurada] = useState<number | "">("");
  const [primaTotal, setPrimaTotal] = useState<number | "">("");
  const [moneda, setMoneda] = useState<"USD" | "VES" | "EUR">("USD");
  const [frecuenciaPago, setFrecuenciaPago] = useState<FrecuenciaPago>("anual");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const cuota = primaTotal
    ? (
        Number(primaTotal) /
        FRECUENCIAS[frecuenciaPago]
      ).toFixed(2)
    : "0.00";

  useEffect(() => {
    async function cargarCatalogos() {
      setLoadingCatalogos(true);
      try {
        const [prodRes, asegRes, ramoRes, cobRes] = await Promise.all([
          supabase
            .from("productores")
            .select("*")
            .eq("activo", true)
            .order("nombre_completo"),
          supabase
            .from("aseguradoras")
            .select("*")
            .eq("activo", true)
            .order("nombre"),
          supabase.from("ramos").select("*").eq("activo", true).order("nombre"),
          supabase
            .from("coberturas")
            .select("*, ramo:ramo_id(nombre)")
            .eq("activo", true)
            .order("nombre"),
        ]);

        if (prodRes.error) throw prodRes.error;
        if (asegRes.error) throw asegRes.error;
        if (ramoRes.error) throw ramoRes.error;
        if (cobRes.error) throw cobRes.error;

        setProductores(prodRes.data || []);
        setAseguradoras(asegRes.data || []);
        setRamos(ramoRes.data || []);
        setCoberturas(cobRes.data || []);
      } catch (err: any) {
        setError("Error cargando catálogos: " + err.message);
      } finally {
        setLoadingCatalogos(false);
      }
    }

    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (fechaInicio && frecuenciaPago) {
      const inicio = new Date(fechaInicio);
      if (!isNaN(inicio.getTime())) {
        const fin = new Date(inicio);
        switch (frecuenciaPago) {
          case "mensual":
            fin.setMonth(fin.getMonth() + 12);
            break;
          case "trimestral":
            fin.setMonth(fin.getMonth() + 12);
            break;
          case "semestral":
            fin.setMonth(fin.getMonth() + 12);
            break;
          case "anual":
            fin.setFullYear(fin.getFullYear() + 1);
            break;
        }
        setFechaVencimiento(fin.toISOString().split("T")[0]);
      }
    }
  }, [fechaInicio, frecuenciaPago]);

  useEffect(() => {
    setCoberturasSeleccionadas([]);
  }, [ramoId]);

  function toggleCobertura(id: string) {
    setCoberturasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function validarPaso(): string | null {
    if (paso === 1) {
      if (!productorId) return "Selecciona un productor.";
      if (!aseguradoraId) return "Selecciona una aseguradora.";
      if (!ramoId) return "Selecciona un ramo.";
    }
    if (paso === 2) {
      if (!documentoIdentidad.trim()) return "El documento de identidad es obligatorio.";
      if (!nombreCompleto.trim()) return "El nombre completo es obligatorio.";
      if (!direccion.trim()) return "La dirección es obligatoria.";
    }
    if (paso === 3) {
      if (!numeroPoliza.trim()) return "El número de póliza es obligatorio.";
      if (!primaTotal || Number(primaTotal) <= 0) return "La prima total debe ser mayor a cero.";
      if (!fechaInicio) return "La fecha de inicio es obligatoria.";
      if (!fechaVencimiento) return "La fecha de vencimiento es obligatoria.";
      if (new Date(fechaVencimiento) <= new Date(fechaInicio)) {
        return "La fecha de vencimiento debe ser posterior a la de inicio.";
      }
    }
    return null;
  }

  function avanzar() {
    const err = validarPaso();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPaso((p) => Math.min(p + 1, totalPasos));
  }

  async function guardarPoliza(e?: FormEvent) {
    e?.preventDefault();
    const err = validarPaso();
    if (err) {
      setError(err);
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      // 1. Buscar o crear cliente
      const { data: clienteExistente, error: errCliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("tipo_documento", tipoDocumento)
        .eq("documento_identidad", documentoIdentidad)
        .maybeSingle();

      if (errCliente) throw errCliente;

      let clienteId = clienteExistente?.id;

      if (!clienteId) {
        const { data: nuevoCliente, error: errInsertCliente } = await supabase
          .from("clientes")
          .insert({
            tipo_persona: tipoPersona,
            tipo_documento: tipoDocumento,
            documento_identidad: documentoIdentidad,
            nombre_completo: nombreCompleto.trim().toUpperCase(),
            telefono: telefono || null,
            celular: celular || null,
            email: email || null,
            direccion: direccion.trim(),
            estado_geografico: estadoGeografico.trim() || null,
            municipio: municipio.trim() || null,
            parroquia: parroquia.trim() || null,
          })
          .select("id")
          .single();

        if (errInsertCliente) throw errInsertCliente;
        clienteId = nuevoCliente.id;
      }

      // 2. Crear póliza
      const { data: poliza, error: errPoliza } = await supabase
        .from("polizas")
        .insert({
          numero_poliza: numeroPoliza.trim().toUpperCase(),
          aseguradora_id: aseguradoraId,
          ramo_id: ramoId,
          tomador_id: clienteId,
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVencimiento,
          prima_total: Number(primaTotal),
          suma_asegurada: sumaAsegurada ? Number(sumaAsegurada) : null,
          moneda,
          frecuencia_pago: frecuenciaPago,
          estado: "activa",
          observaciones: observaciones.trim() || null,
        })
        .select("id")
        .single();

      if (errPoliza) throw errPoliza;

      // 3. Asociar productor
      const { error: errProductor } = await supabase
        .from("poliza_productores")
        .insert({
          poliza_id: poliza.id,
          productor_id: productorId,
          rol: "principal",
          porcentaje_participacion: 100,
        });

      if (errProductor) throw errProductor;

      // 4. Asociar coberturas
      if (coberturasSeleccionadas.length > 0) {
        const { error: errCoberturas } = await supabase
          .from("poliza_coberturas")
          .insert(
            coberturasSeleccionadas.map((coberturaId) => ({
              poliza_id: poliza.id,
              cobertura_id: coberturaId,
            }))
          );
        if (errCoberturas) throw errCoberturas;
      }

      // 5. Generar cuotas
      const cantidadCuotas = FRECUENCIAS[frecuenciaPago];
      const montoCuota = Number(primaTotal) / cantidadCuotas;
      const cuotas = [];
      let fechaCuota = new Date(fechaInicio);

      for (let i = 1; i <= cantidadCuotas; i++) {
        cuotas.push({
          poliza_id: poliza.id,
          numero_cuota: i,
          monto: montoCuota,
          saldo: montoCuota,
          fecha_vencimiento: fechaCuota.toISOString().split("T")[0],
          estado: "pendiente",
          moneda,
        });

        const siguiente = new Date(fechaCuota);
        switch (frecuenciaPago) {
          case "mensual":
            siguiente.setMonth(siguiente.getMonth() + 1);
            break;
          case "trimestral":
            siguiente.setMonth(siguiente.getMonth() + 3);
            break;
          case "semestral":
            siguiente.setMonth(siguiente.getMonth() + 6);
            break;
          case "anual":
            siguiente.setFullYear(siguiente.getFullYear() + 1);
            break;
        }
        fechaCuota = siguiente;
      }

      const { error: errCuotas } = await supabase
        .from("poliza_cuotas")
        .insert(cuotas);

      if (errCuotas) throw errCuotas;

      navigate("/suscripcion");
    } catch (err: any) {
      setError(err.message || "Error al guardar la póliza.");
    } finally {
      setGuardando(false);
    }
  }

  if (loadingCatalogos) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando catálogos...
      </div>
    );
  }

  const Stepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-300"
          style={{ width: `${((paso - 1) / (totalPasos - 1)) * 100}%` }}
        ></div>

        {[
          { id: 1, icon: <Building2 className="w-5 h-5" />, label: "Producto" },
          { id: 2, icon: <Users className="w-5 h-5" />, label: "Involucrados" },
          { id: 3, icon: <CreditCard className="w-5 h-5" />, label: "Finanzas" },
          { id: 4, icon: <FileText className="w-5 h-5" />, label: "Resumen" },
        ].map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300 ${
                paso >= step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"
              } shadow-md`}
            >
              {paso > step.id ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                step.icon
              )}
            </div>
            <span
              className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                paso >= step.id ? "text-blue-700" : "text-gray-400"
              }`}
            >
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Nueva Suscripción
            </h1>
            <p className="text-gray-500 mt-1">
              Crea una nueva cotización o póliza paso a paso.
            </p>
          </div>
          <Link
            to="/suscripcion"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Bandeja
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <Stepper />

            {paso === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Definición del Producto
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Productor / Asesor *
                    </label>
                    <select
                      value={productorId}
                      onChange={(e) => setProductorId(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Seleccione un productor...</option>
                      {productores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Empresa Aseguradora *
                    </label>
                    <select
                      value={aseguradoraId}
                      onChange={(e) => setAseguradoraId(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Seleccione aseguradora...</option>
                      {aseguradoras.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Ramo *
                    </label>
                    <select
                      value={ramoId}
                      onChange={(e) => setRamoId(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Seleccione un ramo...</option>
                      {ramos.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {ramoId && (
                  <div className="mt-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <label className="text-sm font-semibold text-gray-800 mb-3 block">
                      Coberturas Disponibles
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {coberturas
                        .filter((c) => c.ramo_id === ramoId)
                        .map((c) => (
                          <label
                            key={c.id}
                            className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border shadow-sm cursor-pointer hover:border-blue-400"
                          >
                            <input
                              type="checkbox"
                              checked={coberturasSeleccionadas.includes(c.id)}
                              onChange={() => toggleCobertura(c.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">{c.nombre}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Datos del Tomador
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Tipo *
                    </label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) =>
                        setTipoDocumento(e.target.value as typeof tipoDocumento)
                      }
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Documento de Identidad *
                    </label>
                    <input
                      type="text"
                      value={documentoIdentidad}
                      onChange={(e) => setDocumentoIdentidad(e.target.value)}
                      placeholder="12345678"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Tipo de Persona *
                    </label>
                    <select
                      value={tipoPersona}
                      onChange={(e) =>
                        setTipoPersona(e.target.value as typeof tipoPersona)
                      }
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="natural">Natural</option>
                      <option value="juridica">Jurídica</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Nombre Completo / Razón Social *
                    </label>
                    <input
                      type="text"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      placeholder="EJ: JUAN PÉREZ"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="0212-1234567"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="0414-1234567"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cliente@ejemplo.com"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Urbanización, calle, casa/apto"
                    className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={estadoGeografico}
                      onChange={(e) => setEstadoGeografico(e.target.value)}
                      placeholder="Estado"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Municipio
                    </label>
                    <input
                      type="text"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Municipio"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Parroquia
                    </label>
                    <input
                      type="text"
                      value={parroquia}
                      onChange={(e) => setParroquia(e.target.value)}
                      placeholder="Parroquia"
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Finanzas y Cuotas
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Número de Póliza *
                    </label>
                    <input
                      type="text"
                      value={numeroPoliza}
                      onChange={(e) => setNumeroPoliza(e.target.value)}
                      placeholder="Ej: POL-2026-00001"
                      className="w-full h-11 border-2 border-blue-200 rounded-lg px-4 focus:border-blue-500 outline-none font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Moneda *
                    </label>
                    <select
                      value={moneda}
                      onChange={(e) =>
                        setMoneda(e.target.value as typeof moneda)
                      }
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="VES">VES</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Suma Asegurada
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-bold">
                        {moneda}
                      </span>
                      <input
                        type="number"
                        value={sumaAsegurada}
                        onChange={(e) =>
                          setSumaAsegurada(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        placeholder="0.00"
                        className="w-full h-11 border border-gray-300 rounded-lg pl-14 pr-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Prima Total (Costo Anual) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-bold">
                        {moneda}
                      </span>
                      <input
                        type="number"
                        value={primaTotal}
                        onChange={(e) =>
                          setPrimaTotal(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        placeholder="0.00"
                        className="w-full h-11 border-2 border-blue-200 rounded-lg pl-14 pr-4 focus:border-blue-500 outline-none font-mono text-lg font-bold text-blue-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Frecuencia de Pago *
                    </label>
                    <select
                      value={frecuenciaPago}
                      onChange={(e) =>
                        setFrecuenciaPago(e.target.value as FrecuenciaPago)
                      }
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="anual">Anual (1 Pago)</option>
                      <option value="semestral">Semestral (2 Pagos)</option>
                      <option value="trimestral">Trimestral (4 Pagos)</option>
                      <option value="mensual">Mensual (12 Pagos)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Fecha de Inicio de Vigencia *
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Fecha de Vencimiento *
                    </label>
                    <input
                      type="date"
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 text-white rounded-xl p-6 mt-6 flex justify-between items-center shadow-lg">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      Cuota Estimada
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {FRECUENCIAS[frecuenciaPago]} pagos durante la vigencia
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black font-mono text-emerald-400">
                      {moneda} {cuota}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">por cuota</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Observaciones Internas
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    placeholder="Notas internas sobre la póliza..."
                    className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {paso === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 border-b pb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Resumen y Emisión
                  </h2>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-blue-900 mb-2">
                    ¿Todo listo?
                  </h3>
                  <p className="text-sm text-blue-800">
                    Revisa los datos. Al guardar se crearán el cliente, la
                    póliza, las coberturas seleccionadas y las{" "}
                    {FRECUENCIAS[frecuenciaPago]} cuotas de cobranza.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Productor</p>
                    <p className="text-gray-900">
                      {productores.find((p) => p.id === productorId)
                        ?.nombre_completo || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Aseguradora</p>
                    <p className="text-gray-900">
                      {aseguradoras.find((a) => a.id === aseguradoraId)
                        ?.nombre || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Ramo</p>
                    <p className="text-gray-900">
                      {ramos.find((r) => r.id === ramoId)?.nombre || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Póliza</p>
                    <p className="text-gray-900">{numeroPoliza || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Cliente</p>
                    <p className="text-gray-900">
                      {tipoDocumento}-{documentoIdentidad} {nombreCompleto}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-700">Prima Total</p>
                    <p className="text-gray-900">
                      {moneda} {primaTotal || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPaso(paso - 1)}
              disabled={paso === 1 || guardando}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                paso === 1
                  ? "opacity-0 cursor-default"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Atrás
            </button>

            {paso < totalPasos ? (
              <button
                onClick={avanzar}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Siguiente <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={guardarPoliza}
                disabled={guardando}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70"
              >
                <Save className="w-5 h-5" />
                {guardando ? "Guardando..." : "Guardar en Base de Datos"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
