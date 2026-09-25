export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Aseguradora {
  id: string;
  nombre: string;
  rif: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  sitio_web: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ramo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cobertura {
  id: string;
  ramo_id: string;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConvenioAseguradora {
  id: string;
  aseguradora_id: string;
  ramo_id: string | null;
  cobertura_id: string | null;
  porcentaje_agencia: number;
  porcentaje_productor: number;
  porcentaje_islr: number;
  moneda: string;
  vigente_desde: string | null;
  vigente_hasta: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Productor {
  id: string;
  usuario_id: string | null;
  codigo_interno: string | null;
  nombre_completo: string;
  tipo_documento: "V" | "E" | "J" | "G" | "P" | null;
  documento_identidad: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  porcentaje_comision_base: number;
  porcentaje_islr: number;
  activo: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  tipo_persona: "natural" | "juridica";
  tipo_documento: "V" | "E" | "J" | "G" | "P";
  documento_identidad: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  estado_geografico: string | null;
  municipio: string | null;
  parroquia: string | null;
  consentimiento_datos: boolean;
  activo: boolean;
  notas: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteContacto {
  id: string;
  cliente_id: string;
  tipo: "telefono" | "celular" | "email" | "whatsapp" | "otro";
  valor: string;
  principal: boolean;
  observaciones: string | null;
  created_at: string;
}

export interface Poliza {
  id: string;
  numero_poliza: string | null;
  numero_cotizacion: string | null;
  aseguradora_id: string;
  ramo_id: string;
  tomador_id: string;
  fecha_emision: string | null;
  fecha_inicio: string;
  fecha_vencimiento: string;
  fecha_ingreso: string;
  prima_total: number;
  suma_asegurada: number | null;
  moneda: "USD" | "VES" | "EUR";
  frecuencia_pago:
    | "unico"
    | "anual"
    | "semestral"
    | "cuatrimestral"
    | "trimestral"
    | "bimestral"
    | "mensual"
    | "decenal";
  estado: "cotizada" | "pendiente" | "activa" | "vencida" | "anulada" | "cancelada" | "renovada";
  estado_autorizacion: "autorizado" | "pendiente" | "rechazado";
  requiere_autorizacion: boolean;
  carga_destiempo: boolean;
  dias_habiles_emision: number | null;
  dias_habiles_vigencia: number | null;
  autorizado_por: string | null;
  autorizado_at: string | null;
  observaciones: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PolizaAsegurado {
  id: string;
  poliza_id: string;
  cliente_id: string;
  relacion: string;
  created_at: string;
}

export interface PolizaBeneficiario {
  id: string;
  poliza_id: string;
  cliente_id: string;
  parentesco: string | null;
  porcentaje_participacion: number;
  created_at: string;
}

export interface PolizaCobertura {
  id: string;
  poliza_id: string;
  cobertura_id: string;
  suma_asegurada: number | null;
  deducible: number | null;
  created_at: string;
}

export interface PolizaCuota {
  id: string;
  poliza_id: string;
  numero_cuota: number;
  monto: number;
  saldo: number;
  fecha_vencimiento: string;
  estado: string;
  fecha_pago: string | null;
  moneda: string;
  metodo_pago: string | null;
  referencia_pago: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  cuota_id: string;
  monto: number;
  moneda: string;
  metodo_pago: string;
  referencia: string | null;
  fecha_pago: string;
  registrado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comision {
  id: string;
  productor_id: string;
  poliza_id: string | null;
  cuota_id: string | null;
  monto: number;
  moneda: string;
  porcentaje: number;
  tipo: string;
  estado: string;
  fecha_generacion: string;
  fecha_pago: string | null;
  created_at: string;
  updated_at: string;
}

export interface Siniestro {
  id: string;
  poliza_id: string | null;
  numero_siniestro: string | null;
  tipo: string | null;
  descripcion: string | null;
  fecha_ocurrencia: string | null;
  fecha_reporte: string;
  estado: string;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface MotoConvenio {
  id: string;
  aseguradora_id: string | null;
  numero_placa: string;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  propietario_nombre: string | null;
  propietario_documento: string | null;
  telefono: string | null;
  estado_poliza: string;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  prima: number | null;
  moneda: string;
  created_at: string;
  updated_at: string;
}

export interface UsuarioSistema {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  rol_principal: "superadmin" | "admin" | "coordinador" | "operador" | "asesor" | "visualizador";
  activo: boolean;
  configuracion: Json;
  ultimo_acceso_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rol {
  id: string;
  codigo: "superadmin" | "admin" | "coordinador" | "operador" | "asesor" | "visualizador";
  nombre: string;
  descripcion: string | null;
  nivel: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permiso {
  id: string;
  codigo: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
  created_at: string;
}

export interface ParametroSistema {
  clave: string;
  valor: Json;
  descripcion: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BienAsegurado {
  id: string;
  poliza_id: string;
  tipo_bien: string;
  descripcion: string | null;
  datos_bien: Json;
  valor_asegurado: number | null;
  created_at: string;
  updated_at: string;
}

export interface Vehiculo {
  id: string;
  poliza_id: string;
  placa: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  serial_carroceria: string | null;
  serial_motor: string | null;
  color: string | null;
  uso: string | null;
  created_at: string;
  updated_at: string;
}

