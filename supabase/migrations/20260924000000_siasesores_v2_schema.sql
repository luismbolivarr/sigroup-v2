-- ============================================================
-- Siasesores V2 - Esquema relacional inicial para Supabase staging
-- Fecha: 2026-09-24
-- Objetivo: modelo modular, normalizado y sin referencias fiscales de Mexico.
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- ============================================================
-- Utilidades
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_usuario_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- ============================================================
-- Gestion de usuarios y seguridad aplicativa
-- ============================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  descripcion text,
  nivel integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_codigo_check check (codigo in ('superadmin', 'admin', 'coordinador', 'operador', 'asesor', 'visualizador'))
);

create table if not exists public.permisos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  modulo text not null,
  accion text not null,
  descripcion text,
  created_at timestamptz not null default now(),
  constraint permisos_modulo_check check (modulo in (
    'suscripcion', 'fraccionamiento', 'administracion', 'reportes',
    'motos_convenio', 'siniestros', 'asesores_aseguradoras',
    'cumpleanos', 'usuarios', 'log_actividad', 'mensajeria'
  ))
);

create table if not exists public.rol_permisos (
  rol_id uuid not null references public.roles(id) on delete cascade,
  permiso_id uuid not null references public.permisos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rol_id, permiso_id)
);

create table if not exists public.usuarios_sistema (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null,
  telefono text,
  rol_principal text not null default 'visualizador',
  activo boolean not null default true,
  configuracion jsonb not null default '{}'::jsonb,
  ultimo_acceso_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usuarios_sistema_rol_check check (rol_principal in ('superadmin', 'admin', 'coordinador', 'operador', 'asesor', 'visualizador'))
);

create table if not exists public.usuario_roles (
  usuario_id uuid not null references public.usuarios_sistema(id) on delete cascade,
  rol_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (usuario_id, rol_id)
);

-- ============================================================
-- Administracion: catalogos base
-- ============================================================

create table if not exists public.aseguradoras (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  rif text,
  telefono text,
  email text,
  direccion text,
  sitio_web text,
  contacto_nombre text,
  contacto_telefono text,
  contacto_email text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ramos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null unique,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coberturas (
  id uuid primary key default gen_random_uuid(),
  ramo_id uuid not null references public.ramos(id) on delete restrict,
  codigo text,
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coberturas_ramo_nombre_unique unique (ramo_id, nombre)
);

create table if not exists public.convenios_aseguradora (
  id uuid primary key default gen_random_uuid(),
  aseguradora_id uuid not null references public.aseguradoras(id) on delete restrict,
  ramo_id uuid references public.ramos(id) on delete restrict,
  cobertura_id uuid references public.coberturas(id) on delete restrict,
  porcentaje_agencia numeric(8,4) not null default 0,
  porcentaje_productor numeric(8,4) not null default 0,
  porcentaje_islr numeric(8,4) not null default 0,
  moneda text not null default 'USD',
  vigente_desde date,
  vigente_hasta date,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint convenios_porcentajes_check check (
    porcentaje_agencia >= 0 and porcentaje_productor >= 0 and porcentaje_islr >= 0
  ),
  constraint convenios_alcance_check check (ramo_id is not null or cobertura_id is not null),
  constraint convenios_vigencia_check check (vigente_hasta is null or vigente_desde is null or vigente_hasta >= vigente_desde)
);

create table if not exists public.parametros_sistema (
  clave text primary key,
  valor jsonb not null,
  descripcion text,
  updated_by uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Asesores, productores y aseguradoras
-- ============================================================

create table if not exists public.productores (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios_sistema(id) on delete set null,
  codigo_interno text unique,
  nombre_completo text not null,
  tipo_documento text,
  documento_identidad text,
  telefono text,
  celular text,
  email text,
  direccion text,
  porcentaje_comision_base numeric(8,4) not null default 0,
  porcentaje_islr numeric(8,4) not null default 0,
  activo boolean not null default true,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint productores_tipo_documento_check check (tipo_documento is null or tipo_documento in ('V', 'E', 'J', 'G', 'P')),
  constraint productores_porcentajes_check check (porcentaje_comision_base >= 0 and porcentaje_islr >= 0)
);

-- ============================================================
-- Clientes, cumpleanos y contactos
-- ============================================================

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  tipo_persona text not null default 'natural',
  tipo_documento text not null,
  documento_identidad text not null,
  nombre_completo text not null,
  fecha_nacimiento date,
  telefono text,
  celular text,
  email text,
  direccion text,
  estado_geografico text,
  municipio text,
  parroquia text,
  consentimiento_datos boolean not null default true,
  activo boolean not null default true,
  notas text,
  created_by uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clientes_tipo_persona_check check (tipo_persona in ('natural', 'juridica')),
  constraint clientes_tipo_documento_check check (tipo_documento in ('V', 'E', 'J', 'G', 'P')),
  constraint clientes_documento_unique unique (tipo_documento, documento_identidad)
);

create table if not exists public.cliente_contactos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo text not null,
  valor text not null,
  principal boolean not null default false,
  observaciones text,
  created_at timestamptz not null default now(),
  constraint cliente_contactos_tipo_check check (tipo in ('telefono', 'celular', 'email', 'whatsapp', 'otro'))
);

create table if not exists public.notificaciones_cumpleanos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  anio integer not null,
  fecha_programada date not null,
  estado text not null default 'pendiente',
  canal text,
  mensaje text,
  enviado_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notificaciones_cumpleanos_estado_check check (estado in ('pendiente', 'enviada', 'omitida', 'fallida')),
  constraint notificaciones_cumpleanos_unique unique (cliente_id, anio)
);

-- ============================================================
-- Suscripcion
-- ============================================================

create table if not exists public.polizas (
  id uuid primary key default gen_random_uuid(),
  numero_poliza text unique,
  numero_cotizacion text,
  aseguradora_id uuid not null references public.aseguradoras(id) on delete restrict,
  ramo_id uuid not null references public.ramos(id) on delete restrict,
  tomador_id uuid not null references public.clientes(id) on delete restrict,
  fecha_emision date,
  fecha_inicio date not null,
  fecha_vencimiento date not null,
  fecha_ingreso date not null default current_date,
  prima_total numeric(14,2) not null default 0,
  suma_asegurada numeric(14,2),
  moneda text not null default 'USD',
  frecuencia_pago text not null default 'anual',
  estado text not null default 'cotizada',
  estado_autorizacion text not null default 'autorizado',
  requiere_autorizacion boolean not null default false,
  carga_destiempo boolean not null default false,
  dias_habiles_emision integer,
  dias_habiles_vigencia integer,
  autorizado_por uuid references public.usuarios_sistema(id) on delete set null,
  autorizado_at timestamptz,
  observaciones text,
  created_by uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint polizas_fechas_check check (fecha_vencimiento >= fecha_inicio),
  constraint polizas_montos_check check (prima_total >= 0 and (suma_asegurada is null or suma_asegurada >= 0)),
  constraint polizas_moneda_check check (moneda in ('USD', 'VES', 'EUR')),
  constraint polizas_frecuencia_check check (frecuencia_pago in ('unico', 'anual', 'semestral', 'cuatrimestral', 'trimestral', 'bimestral', 'mensual', 'decenal')),
  constraint polizas_estado_check check (estado in ('cotizada', 'pendiente', 'activa', 'vencida', 'anulada', 'cancelada', 'renovada')),
  constraint polizas_estado_autorizacion_check check (estado_autorizacion in ('autorizado', 'pendiente', 'rechazado'))
);

create table if not exists public.poliza_asegurados (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  relacion text not null default 'titular',
  created_at timestamptz not null default now(),
  constraint poliza_asegurados_unique unique (poliza_id, cliente_id)
);

create table if not exists public.poliza_beneficiarios (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  parentesco text,
  porcentaje_participacion numeric(8,4) not null,
  created_at timestamptz not null default now(),
  constraint poliza_beneficiarios_porcentaje_check check (porcentaje_participacion > 0 and porcentaje_participacion <= 100),
  constraint poliza_beneficiarios_unique unique (poliza_id, cliente_id)
);

create table if not exists public.poliza_coberturas (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  cobertura_id uuid not null references public.coberturas(id) on delete restrict,
  suma_asegurada numeric(14,2),
  deducible numeric(14,2),
  prima numeric(14,2),
  observaciones text,
  created_at timestamptz not null default now(),
  constraint poliza_coberturas_unique unique (poliza_id, cobertura_id)
);

create table if not exists public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  placa text unique,
  marca text,
  modelo text,
  version text,
  anio integer,
  color text,
  serial_motor text,
  serial_carroceria text,
  uso text,
  clase text,
  tipo text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehiculos_anio_check check (anio is null or (anio >= 1900 and anio <= 2100))
);

create table if not exists public.bienes_asegurados (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  tipo text not null,
  vehiculo_id uuid references public.vehiculos(id) on delete set null,
  descripcion text,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bienes_asegurados_tipo_check check (tipo in ('vehiculo', 'moto', 'persona', 'patrimonial', 'salud', 'vida', 'otro'))
);

create table if not exists public.poliza_productores (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  productor_id uuid not null references public.productores(id) on delete restrict,
  rol text not null default 'principal',
  porcentaje_participacion numeric(8,4) not null default 100,
  porcentaje_comision numeric(8,4),
  created_at timestamptz not null default now(),
  constraint poliza_productores_rol_check check (rol in ('principal', 'coproductor', 'referidor')),
  constraint poliza_productores_porcentaje_check check (porcentaje_participacion > 0 and porcentaje_participacion <= 100),
  constraint poliza_productores_unique unique (poliza_id, productor_id)
);

create table if not exists public.poliza_movimientos (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  tipo text not null,
  estado_anterior text,
  estado_nuevo text,
  descripcion text,
  datos jsonb not null default '{}'::jsonb,
  usuario_id uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint poliza_movimientos_tipo_check check (tipo in ('creacion', 'emision', 'autorizacion', 'rechazo', 'renovacion', 'anulacion', 'cancelacion', 'actualizacion'))
);

create table if not exists public.solicitudes_autorizacion (
  id uuid primary key default gen_random_uuid(),
  modulo text not null,
  entidad_tipo text not null,
  entidad_id uuid not null,
  tipo text not null,
  estado text not null default 'pendiente',
  motivo text,
  datos jsonb not null default '{}'::jsonb,
  solicitado_por uuid references public.usuarios_sistema(id) on delete set null,
  solicitado_at timestamptz not null default now(),
  resuelto_por uuid references public.usuarios_sistema(id) on delete set null,
  resuelto_at timestamptz,
  observaciones_resolucion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint solicitudes_autorizacion_modulo_check check (modulo in ('suscripcion', 'fraccionamiento', 'motos_convenio', 'siniestros', 'administracion')),
  constraint solicitudes_autorizacion_estado_check check (estado in ('pendiente', 'aprobada', 'rechazada', 'anulada')),
  constraint solicitudes_autorizacion_tipo_check check (tipo in ('carga_destiempo', 'anulacion', 'modificacion_sensible', 'pago_manual', 'reverso_pago', 'otro'))
);

create table if not exists public.renovaciones_poliza (
  id uuid primary key default gen_random_uuid(),
  poliza_origen_id uuid not null references public.polizas(id) on delete restrict,
  poliza_nueva_id uuid references public.polizas(id) on delete set null,
  estado text not null default 'pendiente',
  fecha_programada date,
  fecha_renovacion date,
  prima_anterior numeric(14,2),
  prima_nueva numeric(14,2),
  observaciones text,
  gestionado_por uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint renovaciones_poliza_estado_check check (estado in ('pendiente', 'en_gestion', 'renovada', 'no_renovada', 'anulada'))
);

-- ============================================================
-- Fraccionamiento, pagos y comisiones
-- ============================================================

create table if not exists public.poliza_cuotas (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  numero_cuota integer not null,
  monto numeric(14,2) not null,
  saldo numeric(14,2) not null,
  moneda text not null default 'USD',
  fecha_vencimiento date not null,
  fecha_pago date,
  estado text not null default 'pendiente',
  metodo_pago text,
  referencia_pago text,
  monto_pagado numeric(14,2) not null default 0,
  gastos_administrativos numeric(14,2) not null default 0,
  comision_agencia numeric(14,2),
  comision_productor numeric(14,2),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poliza_cuotas_unique unique (poliza_id, numero_cuota),
  constraint poliza_cuotas_estado_check check (estado in ('pendiente', 'pagada', 'parcial', 'vencida', 'anulada')),
  constraint poliza_cuotas_montos_check check (monto >= 0 and saldo >= 0 and monto_pagado >= 0 and gastos_administrativos >= 0),
  constraint poliza_cuotas_moneda_check check (moneda in ('USD', 'VES', 'EUR'))
);

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  cuota_id uuid references public.poliza_cuotas(id) on delete restrict,
  poliza_id uuid not null references public.polizas(id) on delete restrict,
  monto numeric(14,2) not null,
  moneda text not null default 'USD',
  metodo_pago text not null,
  referencia text,
  fecha_pago date not null default current_date,
  estado text not null default 'confirmado',
  registrado_por uuid references public.usuarios_sistema(id) on delete set null,
  comprobante_url text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pagos_monto_check check (monto > 0),
  constraint pagos_estado_check check (estado in ('pendiente', 'confirmado', 'rechazado', 'reversado')),
  constraint pagos_moneda_check check (moneda in ('USD', 'VES', 'EUR'))
);

create table if not exists public.recordatorios_cobranza (
  id uuid primary key default gen_random_uuid(),
  cuota_id uuid not null references public.poliza_cuotas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  canal text not null default 'whatsapp',
  fecha_programada date not null,
  estado text not null default 'pendiente',
  mensaje text,
  enviado_at timestamptz,
  respuesta text,
  gestionado_por uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recordatorios_cobranza_canal_check check (canal in ('whatsapp', 'email', 'telefono', 'sms', 'otro')),
  constraint recordatorios_cobranza_estado_check check (estado in ('pendiente', 'enviado', 'respondido', 'omitido', 'fallido'))
);

create table if not exists public.comisiones (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete cascade,
  cuota_id uuid references public.poliza_cuotas(id) on delete set null,
  productor_id uuid references public.productores(id) on delete restrict,
  tipo text not null default 'productor',
  base_calculo numeric(14,2) not null,
  porcentaje numeric(8,4) not null,
  monto_bruto numeric(14,2) not null,
  porcentaje_islr numeric(8,4) not null default 0,
  monto_islr numeric(14,2) not null default 0,
  monto_neto numeric(14,2) not null,
  moneda text not null default 'USD',
  estado text not null default 'pendiente',
  fecha_generacion date not null default current_date,
  fecha_pago date,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comisiones_tipo_check check (tipo in ('agencia', 'productor', 'coproductor', 'referidor')),
  constraint comisiones_estado_check check (estado in ('pendiente', 'pagada', 'retenida', 'anulada')),
  constraint comisiones_productor_requerido_check check (tipo = 'agencia' or productor_id is not null),
  constraint comisiones_montos_check check (base_calculo >= 0 and porcentaje >= 0 and monto_bruto >= 0 and monto_islr >= 0 and monto_neto >= 0),
  constraint comisiones_moneda_check check (moneda in ('USD', 'VES', 'EUR'))
);

-- ============================================================
-- Motos Convenio
-- ============================================================

create table if not exists public.motos_convenio (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid references public.polizas(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete restrict,
  vehiculo_id uuid references public.vehiculos(id) on delete set null,
  aseguradora_id uuid references public.aseguradoras(id) on delete restrict,
  convenio text,
  concesionario text,
  listado text,
  estado text not null default 'pendiente_emision',
  documentos_completos boolean not null default false,
  checklist_documentos jsonb not null default '{}'::jsonb,
  fecha_recepcion date not null default current_date,
  fecha_emision date,
  observaciones text,
  created_by uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint motos_convenio_estado_check check (estado in ('pendiente_emision', 'activa', 'observada', 'anulada', 'vencida'))
);

-- ============================================================
-- Siniestros
-- ============================================================

create table if not exists public.siniestros (
  id uuid primary key default gen_random_uuid(),
  poliza_id uuid not null references public.polizas(id) on delete restrict,
  numero_siniestro text unique,
  fecha_ocurrencia date not null,
  fecha_reporte date not null default current_date,
  tipo text,
  descripcion text,
  ubicacion text,
  monto_reclamado numeric(14,2),
  monto_aprobado numeric(14,2),
  monto_pagado numeric(14,2),
  deducible numeric(14,2),
  estado text not null default 'abierto',
  ajustador_nombre text,
  observaciones text,
  created_by uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint siniestros_estado_check check (estado in ('abierto', 'en_proceso', 'aprobado', 'rechazado', 'pagado', 'cerrado')),
  constraint siniestros_montos_check check (
    (monto_reclamado is null or monto_reclamado >= 0) and
    (monto_aprobado is null or monto_aprobado >= 0) and
    (monto_pagado is null or monto_pagado >= 0) and
    (deducible is null or deducible >= 0)
  )
);

create table if not exists public.siniestro_movimientos (
  id uuid primary key default gen_random_uuid(),
  siniestro_id uuid not null references public.siniestros(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text,
  descripcion text,
  datos jsonb not null default '{}'::jsonb,
  usuario_id uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Documentos y archivos
-- ============================================================

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  entidad_tipo text not null,
  entidad_id uuid not null,
  tipo_documento text,
  nombre_archivo text not null,
  storage_bucket text,
  storage_path text,
  mime_type text,
  tamano_bytes bigint,
  subido_por uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint documentos_entidad_tipo_check check (entidad_tipo in ('cliente', 'poliza', 'cuota', 'pago', 'siniestro', 'moto_convenio', 'vehiculo', 'productor', 'aseguradora'))
);

-- ============================================================
-- Mensajeria interna
-- ============================================================

create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  tipo text not null default 'canal',
  emisor_id uuid not null references public.usuarios_sistema(id) on delete cascade,
  emisor_nombre text not null default '',
  emisor_email text not null default '',
  destinatario_id uuid references public.usuarios_sistema(id) on delete cascade,
  menciones uuid[] not null default array[]::uuid[],
  leido_at timestamptz,
  created_at timestamptz not null default now(),
  constraint mensajes_texto_check check (char_length(texto) > 0 and char_length(texto) <= 2000),
  constraint mensajes_tipo_check check (tipo in ('canal', 'directo')),
  constraint mensajes_directo_destinatario_check check (tipo = 'canal' or destinatario_id is not null)
);

-- ============================================================
-- Log de actividades y auditoria
-- ============================================================

create table if not exists public.log_actividad (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios_sistema(id) on delete set null,
  usuario_email text,
  modulo text not null,
  accion text not null,
  entidad_tipo text,
  entidad_id uuid,
  descripcion text,
  datos_antes jsonb,
  datos_despues jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint log_actividad_modulo_check check (modulo in (
    'suscripcion', 'fraccionamiento', 'administracion', 'reportes',
    'motos_convenio', 'siniestros', 'asesores_aseguradoras',
    'cumpleanos', 'usuarios', 'log_actividad', 'mensajeria'
  ))
);

create table if not exists public.tareas_operativas (
  id uuid primary key default gen_random_uuid(),
  modulo text not null,
  entidad_tipo text,
  entidad_id uuid,
  titulo text not null,
  descripcion text,
  estado text not null default 'pendiente',
  prioridad text not null default 'media',
  asignado_a uuid references public.usuarios_sistema(id) on delete set null,
  creado_por uuid references public.usuarios_sistema(id) on delete set null,
  fecha_limite date,
  completado_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tareas_operativas_modulo_check check (modulo in (
    'suscripcion', 'fraccionamiento', 'administracion', 'reportes',
    'motos_convenio', 'siniestros', 'asesores_aseguradoras',
    'cumpleanos', 'usuarios', 'log_actividad', 'mensajeria'
  )),
  constraint tareas_operativas_estado_check check (estado in ('pendiente', 'en_progreso', 'bloqueada', 'completada', 'cancelada')),
  constraint tareas_operativas_prioridad_check check (prioridad in ('baja', 'media', 'alta', 'urgente'))
);

create table if not exists public.reportes_guardados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  modulo text not null,
  descripcion text,
  filtros jsonb not null default '{}'::jsonb,
  columnas jsonb not null default '[]'::jsonb,
  visibilidad text not null default 'privado',
  creado_por uuid references public.usuarios_sistema(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reportes_guardados_modulo_check check (modulo in (
    'suscripcion', 'fraccionamiento', 'administracion', 'reportes',
    'motos_convenio', 'siniestros', 'asesores_aseguradoras',
    'cumpleanos', 'usuarios', 'log_actividad', 'mensajeria'
  )),
  constraint reportes_guardados_visibilidad_check check (visibilidad in ('privado', 'equipo', 'todos'))
);

-- ============================================================
-- Indices principales
-- ============================================================

create index if not exists idx_usuarios_sistema_email on public.usuarios_sistema(email);
create index if not exists idx_usuarios_sistema_rol on public.usuarios_sistema(rol_principal);

create index if not exists idx_clientes_documento on public.clientes(tipo_documento, documento_identidad);
create index if not exists idx_clientes_nombre on public.clientes using gin (to_tsvector('simple', coalesce(nombre_completo, '')));
create index if not exists idx_clientes_cumpleanos on public.clientes((extract(month from fecha_nacimiento)), (extract(day from fecha_nacimiento))) where fecha_nacimiento is not null;

create index if not exists idx_productores_nombre on public.productores using gin (to_tsvector('simple', coalesce(nombre_completo, '')));
create index if not exists idx_aseguradoras_nombre on public.aseguradoras using gin (to_tsvector('simple', coalesce(nombre, '')));

create index if not exists idx_polizas_numero on public.polizas(numero_poliza);
create index if not exists idx_polizas_tomador on public.polizas(tomador_id);
create index if not exists idx_polizas_aseguradora on public.polizas(aseguradora_id);
create index if not exists idx_polizas_ramo on public.polizas(ramo_id);
create index if not exists idx_polizas_estado on public.polizas(estado);
create index if not exists idx_polizas_vencimiento on public.polizas(fecha_vencimiento);
create index if not exists idx_polizas_autorizacion on public.polizas(estado_autorizacion) where estado_autorizacion <> 'autorizado';
create index if not exists idx_solicitudes_autorizacion_estado on public.solicitudes_autorizacion(estado, modulo);
create index if not exists idx_solicitudes_autorizacion_entidad on public.solicitudes_autorizacion(entidad_tipo, entidad_id);
create index if not exists idx_renovaciones_poliza_estado on public.renovaciones_poliza(estado, fecha_programada);

create index if not exists idx_poliza_cuotas_poliza on public.poliza_cuotas(poliza_id);
create index if not exists idx_poliza_cuotas_estado on public.poliza_cuotas(estado);
create index if not exists idx_poliza_cuotas_vencimiento on public.poliza_cuotas(fecha_vencimiento);
create index if not exists idx_recordatorios_cobranza_estado on public.recordatorios_cobranza(estado, fecha_programada);

create index if not exists idx_pagos_poliza on public.pagos(poliza_id);
create index if not exists idx_pagos_cuota on public.pagos(cuota_id);
create index if not exists idx_pagos_fecha on public.pagos(fecha_pago);

create index if not exists idx_comisiones_productor on public.comisiones(productor_id);
create index if not exists idx_comisiones_estado on public.comisiones(estado);
create index if not exists idx_comisiones_poliza on public.comisiones(poliza_id);

create index if not exists idx_siniestros_poliza on public.siniestros(poliza_id);
create index if not exists idx_siniestros_estado on public.siniestros(estado);
create index if not exists idx_siniestros_fecha on public.siniestros(fecha_ocurrencia);

create index if not exists idx_motos_convenio_estado on public.motos_convenio(estado);
create index if not exists idx_motos_convenio_poliza on public.motos_convenio(poliza_id);

create index if not exists idx_log_actividad_modulo_fecha on public.log_actividad(modulo, created_at desc);
create index if not exists idx_log_actividad_entidad on public.log_actividad(entidad_tipo, entidad_id);
create index if not exists idx_tareas_operativas_estado on public.tareas_operativas(estado, prioridad, fecha_limite);
create index if not exists idx_tareas_operativas_asignado on public.tareas_operativas(asignado_a, estado);
create index if not exists idx_reportes_guardados_modulo on public.reportes_guardados(modulo, visibilidad);

-- ============================================================
-- Triggers updated_at
-- ============================================================

drop trigger if exists set_roles_updated_at on public.roles;
drop trigger if exists set_usuarios_sistema_updated_at on public.usuarios_sistema;
drop trigger if exists set_aseguradoras_updated_at on public.aseguradoras;
drop trigger if exists set_ramos_updated_at on public.ramos;
drop trigger if exists set_coberturas_updated_at on public.coberturas;
drop trigger if exists set_convenios_updated_at on public.convenios_aseguradora;
drop trigger if exists set_parametros_updated_at on public.parametros_sistema;
drop trigger if exists set_productores_updated_at on public.productores;
drop trigger if exists set_clientes_updated_at on public.clientes;
drop trigger if exists set_polizas_updated_at on public.polizas;
drop trigger if exists set_vehiculos_updated_at on public.vehiculos;
drop trigger if exists set_bienes_asegurados_updated_at on public.bienes_asegurados;
drop trigger if exists set_solicitudes_autorizacion_updated_at on public.solicitudes_autorizacion;
drop trigger if exists set_renovaciones_poliza_updated_at on public.renovaciones_poliza;
drop trigger if exists set_poliza_cuotas_updated_at on public.poliza_cuotas;
drop trigger if exists set_pagos_updated_at on public.pagos;
drop trigger if exists set_recordatorios_cobranza_updated_at on public.recordatorios_cobranza;
drop trigger if exists set_comisiones_updated_at on public.comisiones;
drop trigger if exists set_motos_convenio_updated_at on public.motos_convenio;
drop trigger if exists set_siniestros_updated_at on public.siniestros;
drop trigger if exists set_tareas_operativas_updated_at on public.tareas_operativas;
drop trigger if exists set_reportes_guardados_updated_at on public.reportes_guardados;

create trigger set_roles_updated_at before update on public.roles for each row execute function public.set_updated_at();
create trigger set_usuarios_sistema_updated_at before update on public.usuarios_sistema for each row execute function public.set_updated_at();
create trigger set_aseguradoras_updated_at before update on public.aseguradoras for each row execute function public.set_updated_at();
create trigger set_ramos_updated_at before update on public.ramos for each row execute function public.set_updated_at();
create trigger set_coberturas_updated_at before update on public.coberturas for each row execute function public.set_updated_at();
create trigger set_convenios_updated_at before update on public.convenios_aseguradora for each row execute function public.set_updated_at();
create trigger set_parametros_updated_at before update on public.parametros_sistema for each row execute function public.set_updated_at();
create trigger set_productores_updated_at before update on public.productores for each row execute function public.set_updated_at();
create trigger set_clientes_updated_at before update on public.clientes for each row execute function public.set_updated_at();
create trigger set_polizas_updated_at before update on public.polizas for each row execute function public.set_updated_at();
create trigger set_vehiculos_updated_at before update on public.vehiculos for each row execute function public.set_updated_at();
create trigger set_bienes_asegurados_updated_at before update on public.bienes_asegurados for each row execute function public.set_updated_at();
create trigger set_solicitudes_autorizacion_updated_at before update on public.solicitudes_autorizacion for each row execute function public.set_updated_at();
create trigger set_renovaciones_poliza_updated_at before update on public.renovaciones_poliza for each row execute function public.set_updated_at();
create trigger set_poliza_cuotas_updated_at before update on public.poliza_cuotas for each row execute function public.set_updated_at();
create trigger set_pagos_updated_at before update on public.pagos for each row execute function public.set_updated_at();
create trigger set_recordatorios_cobranza_updated_at before update on public.recordatorios_cobranza for each row execute function public.set_updated_at();
create trigger set_comisiones_updated_at before update on public.comisiones for each row execute function public.set_updated_at();
create trigger set_motos_convenio_updated_at before update on public.motos_convenio for each row execute function public.set_updated_at();
create trigger set_siniestros_updated_at before update on public.siniestros for each row execute function public.set_updated_at();
create trigger set_tareas_operativas_updated_at before update on public.tareas_operativas for each row execute function public.set_updated_at();
create trigger set_reportes_guardados_updated_at before update on public.reportes_guardados for each row execute function public.set_updated_at();

-- ============================================================
-- RLS base para staging
-- Nota: el backend con service role puede operar sin depender de estas politicas.
-- ============================================================

alter table public.roles enable row level security;
alter table public.permisos enable row level security;
alter table public.rol_permisos enable row level security;
alter table public.usuarios_sistema enable row level security;
alter table public.usuario_roles enable row level security;
alter table public.aseguradoras enable row level security;
alter table public.ramos enable row level security;
alter table public.coberturas enable row level security;
alter table public.convenios_aseguradora enable row level security;
alter table public.parametros_sistema enable row level security;
alter table public.productores enable row level security;
alter table public.clientes enable row level security;
alter table public.cliente_contactos enable row level security;
alter table public.notificaciones_cumpleanos enable row level security;
alter table public.polizas enable row level security;
alter table public.poliza_asegurados enable row level security;
alter table public.poliza_beneficiarios enable row level security;
alter table public.poliza_coberturas enable row level security;
alter table public.vehiculos enable row level security;
alter table public.bienes_asegurados enable row level security;
alter table public.poliza_productores enable row level security;
alter table public.poliza_movimientos enable row level security;
alter table public.solicitudes_autorizacion enable row level security;
alter table public.renovaciones_poliza enable row level security;
alter table public.poliza_cuotas enable row level security;
alter table public.pagos enable row level security;
alter table public.recordatorios_cobranza enable row level security;
alter table public.comisiones enable row level security;
alter table public.motos_convenio enable row level security;
alter table public.siniestros enable row level security;
alter table public.siniestro_movimientos enable row level security;
alter table public.documentos enable row level security;
alter table public.mensajes enable row level security;
alter table public.log_actividad enable row level security;
alter table public.tareas_operativas enable row level security;
alter table public.reportes_guardados enable row level security;

create or replace function public.es_usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios_sistema u
    where u.id = auth.uid()
      and u.activo = true
  );
$$;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios_sistema u
    where u.id = auth.uid()
      and u.activo = true
      and u.rol_principal in ('superadmin', 'admin')
  );
$$;

drop policy if exists usuarios_ven_su_perfil_o_admin on public.usuarios_sistema;
drop policy if exists usuarios_admin_modifica on public.usuarios_sistema;
drop policy if exists lectura_catalogos_autenticados on public.aseguradoras;
drop policy if exists escritura_catalogos_admin on public.aseguradoras;
drop policy if exists lectura_ramos_autenticados on public.ramos;
drop policy if exists escritura_ramos_admin on public.ramos;
drop policy if exists lectura_coberturas_autenticados on public.coberturas;
drop policy if exists escritura_coberturas_admin on public.coberturas;
drop policy if exists lectura_general_autenticados on public.clientes;
drop policy if exists escritura_general_autenticados on public.clientes;
drop policy if exists lectura_polizas_autenticados on public.polizas;
drop policy if exists escritura_polizas_autenticados on public.polizas;
drop policy if exists lectura_cuotas_autenticados on public.poliza_cuotas;
drop policy if exists escritura_cuotas_autenticados on public.poliza_cuotas;
drop policy if exists lectura_siniestros_autenticados on public.siniestros;
drop policy if exists escritura_siniestros_autenticados on public.siniestros;
drop policy if exists lectura_log_admin on public.log_actividad;
drop policy if exists insert_log_autenticados on public.log_actividad;
drop policy if exists lectura_tareas_autenticados on public.tareas_operativas;
drop policy if exists escritura_tareas_autenticados on public.tareas_operativas;
drop policy if exists lectura_reportes_autenticados on public.reportes_guardados;
drop policy if exists escritura_reportes_autenticados on public.reportes_guardados;

create policy usuarios_ven_su_perfil_o_admin on public.usuarios_sistema
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy usuarios_admin_modifica on public.usuarios_sistema
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy lectura_catalogos_autenticados on public.aseguradoras
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_catalogos_admin on public.aseguradoras
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy lectura_ramos_autenticados on public.ramos
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_ramos_admin on public.ramos
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy lectura_coberturas_autenticados on public.coberturas
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_coberturas_admin on public.coberturas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy lectura_general_autenticados on public.clientes
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_general_autenticados on public.clientes
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy lectura_polizas_autenticados on public.polizas
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_polizas_autenticados on public.polizas
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy lectura_cuotas_autenticados on public.poliza_cuotas
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_cuotas_autenticados on public.poliza_cuotas
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy lectura_siniestros_autenticados on public.siniestros
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_siniestros_autenticados on public.siniestros
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy lectura_log_admin on public.log_actividad
  for select to authenticated using (public.es_admin());
create policy insert_log_autenticados on public.log_actividad
  for insert to authenticated with check (public.es_usuario_activo());

create policy lectura_tareas_autenticados on public.tareas_operativas
  for select to authenticated using (public.es_usuario_activo());
create policy escritura_tareas_autenticados on public.tareas_operativas
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy lectura_reportes_autenticados on public.reportes_guardados
  for select to authenticated using (
    public.es_usuario_activo()
    and (visibilidad in ('equipo', 'todos') or creado_por = auth.uid() or public.es_admin())
  );
create policy escritura_reportes_autenticados on public.reportes_guardados
  for all to authenticated using (public.es_usuario_activo()) with check (public.es_usuario_activo());

-- En staging, el resto de tablas queda protegido por RLS y usable desde service role.
-- Agrega politicas finas por modulo cuando se conecte el frontend directamente a cada tabla.

-- ============================================================
-- Datos semilla minimos
-- ============================================================

insert into public.roles (codigo, nombre, descripcion, nivel) values
  ('superadmin', 'Superadministrador', 'Acceso total al sistema', 100),
  ('admin', 'Administrador', 'Administra usuarios, catalogos y operaciones', 80),
  ('coordinador', 'Coordinador', 'Supervisa operaciones y autorizaciones', 60),
  ('operador', 'Operador', 'Gestiona operaciones diarias', 40),
  ('asesor', 'Asesor', 'Gestiona cartera asignada', 30),
  ('visualizador', 'Visualizador', 'Consulta informacion sin modificar', 10)
on conflict (codigo) do nothing;

insert into public.ramos (codigo, nombre, descripcion) values
  ('auto', 'Automovil', 'Polizas de automovil y camioneta'),
  ('moto', 'Moto', 'Polizas de motocicleta y motos convenio'),
  ('vida', 'Vida', 'Polizas de vida'),
  ('salud', 'Salud', 'Polizas de salud y personas'),
  ('patrimonial', 'Patrimonial', 'Bienes, hogar, comercio y otros riesgos patrimoniales')
on conflict (codigo) do nothing;

comment on table public.polizas is 'Modulo Suscripcion: cabecera de cotizaciones y polizas emitidas.';
comment on table public.poliza_cuotas is 'Modulo Fraccionamiento: cuotas esperadas por poliza.';
comment on table public.pagos is 'Pagos reales registrados contra polizas o cuotas.';
comment on table public.motos_convenio is 'Flujo especializado de motos convenio conectado a clientes, vehiculos y polizas.';
comment on table public.siniestros is 'Modulo Siniestros: reclamos asociados a polizas.';
comment on table public.log_actividad is 'Auditoria funcional transversal de la aplicacion.';
comment on table public.solicitudes_autorizacion is 'Procesos de autorizacion visibles: carga a destiempo, anulaciones, reversos y cambios sensibles.';
comment on table public.tareas_operativas is 'Bandeja transversal de pendientes operativos por modulo y entidad.';
comment on table public.reportes_guardados is 'Configuraciones de reportes reutilizables por usuario, equipo o todos.';

commit;