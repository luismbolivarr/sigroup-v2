export interface Aseguradora {
  id: string;
  nombre: string;
  rif_nit: string | null;
  estado: boolean;
  created_at: string;
}

export interface Productor {
  id: string;
  nombre_completo: string;
  codigo_interno: string | null;
  porcentaje_comision_base: number;
  porcentaje_islr: number;
  estado: boolean;
  created_at: string;
}

export interface Ramo {
  id: string;
  nombre: string;
  estado: boolean;
  created_at: string;
}

export interface Cobertura {
  id: string;
  ramo_id: string;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  created_at: string;
}

export interface ConvenioAseguradora {
  id: string;
  aseguradora_id: string;
  cobertura_id: string;
  ramo_id: string | null;
  porcentaje_agencia: number;
  porcentaje_productor: number;
  created_at: string;
}

export interface Cliente {
  id: string;
  tipo_persona: string;
  nombre_completo: string;
  documento_identidad: string;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  estado_geografico: string | null;
  municipio: string | null;
  parroquia: string | null;
  estado: boolean;
  created_at: string;
}

export interface Poliza {
  id: string;
  numero_poliza: string;
  aseguradora_id: string;
  ramo_id: string;
  tomador_id: string;
  productor_id: string | null;
  fecha_emision: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  prima_total: number;
  prima_neta: number | null;
  suma_asegurada: number | null;
  moneda: string;
  frecuencia_pago: string;
  promocion_divisas: boolean;
  carga_destiempo: boolean;
  estado: string;
  datos_bien: any | null;
  created_at: string;
}

export interface PolizaAsegurado {
  id: string;
  poliza_id: string;
  cliente_id: string;
  parentesco: string;
  created_at?: string;
}

export interface PolizaCobertura {
  id: string;
  poliza_id: string;
  cobertura_id: string;
  suma_asegurada: number | null;
  deducible: number | null;
  created_at?: string;
}

export interface PolizaBeneficiario {
  id: string;
  poliza_id: string;
  cliente_id: string;
  parentesco: string;
  porcentaje_participacion: number;
  created_at?: string;
}

export interface PolizaCuota {
  id: string;
  poliza_id: string;
  numero_cuota: number;
  monto: number;
  moneda: string;
  monto_pagado: number | null;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  metodo_pago: string | null;
  referencia_pago: string | null;
  estado: string; // 'pendiente', 'reportado', 'pagado', 'rechazado'
  comision_agencia: number | null;
  comision_productor: number | null;
  created_at?: string;
}

export interface Comision {
  id: string;
  productor_id: string;
  poliza_id: string | null;
  cuota_id: string | null;
  monto: number;
  moneda: string;
  porcentaje: number;
  tipo: string; // 'productor' o 'agencia'
  estado: string; // 'pendiente' o 'pagada'
  fecha_generacion: string;
  fecha_pago: string | null;
  created_at?: string;
}

export interface Siniestro {
  id: string;
  poliza_id: string | null;
  numero_siniestro: string | null;
  tipo: string | null;
  descripcion: string | null;
  fecha_ocurrencia: string | null;
  fecha_reporte: string;
  estado: string; // 'abierto', 'en_proceso', 'cerrado', 'rechazado'
  observaciones: string | null;
  created_at?: string;
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
  created_at?: string;
}

export interface UsuarioSistema {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  permisos: any;
  created_at?: string;
}
