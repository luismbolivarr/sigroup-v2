-- ============================================================
-- Siasesores V2 - Migracion de datos legacy a tablas nuevas
-- Ejecutar despues de 20260924000000_siasesores_v2_schema.sql
-- ============================================================

begin;

-- Conserva un campo de negocio que existia en el esquema anterior.
alter table public.polizas
  add column if not exists promocion_divisas boolean not null default false,
  add column if not exists datos_bien jsonb not null default '{}'::jsonb;

-- Catalogos base. Se conservan los UUID legacy para que las relaciones
-- de polizas sigan apuntando al mismo registro.
insert into public.aseguradoras (
  id, nombre, rif, activo, created_at
)
select
  id,
  nombre,
  rif_nit,
  coalesce(estado, true),
  coalesce(created_at, now())
from public.legacy_aseguradoras
on conflict (id) do nothing;

insert into public.ramos (
  id, codigo, nombre, activo, created_at
)
select
  id,
  lower(regexp_replace(trim(nombre), '[^a-zA-Z0-9]+', '_', 'g')),
  nombre,
  coalesce(estado, true),
  coalesce(created_at, now())
from public.legacy_ramos
on conflict (id) do nothing;

insert into public.productores (
  id,
  codigo_interno,
  nombre_completo,
  porcentaje_comision_base,
  porcentaje_islr,
  activo,
  created_at
)
select
  id,
  codigo_interno,
  nombre_completo,
  coalesce(porcentaje_comision_base, 0),
  coalesce(porcentaje_islr, 0),
  coalesce(estado, true),
  coalesce(created_at, now())
from public.legacy_productores
on conflict (id) do nothing;

-- Coberturas del catalogo. Deben existir antes de migrar
-- las coberturas asignadas a cada poliza.
insert into public.coberturas (
  id,
  ramo_id,
  nombre,
  descripcion,
  activo,
  created_at
)
select
  id,
  ramo_id,
  nombre,
  descripcion,
  coalesce(estado, true),
  coalesce(created_at, now())
from public.legacy_coberturas
on conflict (id) do nothing;

-- Clientes: NATURAL/JURIDICA se normalizan al catalogo nuevo y el prefijo
-- V/E/J/G/P se separa del numero de documento.
insert into public.clientes (
  id,
  tipo_persona,
  tipo_documento,
  documento_identidad,
  nombre_completo,
  fecha_nacimiento,
  telefono,
  celular,
  email,
  direccion,
  estado_geografico,
  municipio,
  parroquia,
  activo,
  created_at
)
select
  id,
  case
    when upper(tipo_persona) in ('JURIDICA', 'JURÍDICA', 'EMPRESA') then 'juridica'
    else 'natural'
  end,
  case
    when split_part(documento_identidad, '-', 1) in ('V', 'E', 'J', 'G', 'P')
      then split_part(documento_identidad, '-', 1)
    else 'V'
  end,
  case
    when position('-' in documento_identidad) > 0
      then substring(documento_identidad from position('-' in documento_identidad) + 1)
    else documento_identidad
  end,
  nombre_completo,
  fecha_nacimiento,
  telefono,
  celular,
  email,
  direccion,
  estado_geografico,
  municipio,
  parroquia,
  coalesce(estado, true),
  coalesce(created_at, now())
from public.legacy_clientes
on conflict (id) do nothing;

-- Polizas. Los catalogos y clientes mantienen el mismo UUID legacy.
insert into public.polizas (
  id,
  numero_poliza,
  aseguradora_id,
  ramo_id,
  tomador_id,
  fecha_emision,
  fecha_inicio,
  fecha_vencimiento,
  prima_total,
  frecuencia_pago,
  estado,
  created_at,
  moneda,
  suma_asegurada,
  promocion_divisas,
  carga_destiempo,
  datos_bien
)
select
  id,
  nullif(numero_poliza, ''),
  aseguradora_id,
  ramo_id,
  tomador_id,
  fecha_emision,
  fecha_inicio,
  fecha_vencimiento,
  coalesce(prima_total, 0),
  case lower(coalesce(frecuencia_pago, 'anual'))
    when 'unica' then 'unico'
    when 'única' then 'unico'
    when 'mensual' then 'mensual'
    when 'bimestral' then 'bimestral'
    when 'trimestral' then 'trimestral'
    when 'cuatrimestral' then 'cuatrimestral'
    when 'semestral' then 'semestral'
    when 'decenal' then 'decenal'
    else 'anual'
  end,
  case lower(coalesce(estado, 'cotizada'))
    when 'activa' then 'activa'
    when 'activo' then 'activa'
    when 'vigente' then 'activa'
    when 'vencida' then 'vencida'
    when 'anulada' then 'anulada'
    when 'cancelada' then 'cancelada'
    when 'renovada' then 'renovada'
    when 'pendiente' then 'pendiente'
    else 'cotizada'
  end,
  coalesce(created_at, now()),
  case upper(coalesce(moneda, 'USD'))
    when 'VES' then 'VES'
    when 'EUR' then 'EUR'
    else 'USD'
  end,
  suma_asegurada,
  coalesce(promocion_divisas, false),
  coalesce(carga_destiempo, false),
  coalesce(datos_bien, '{}'::jsonb)
from public.legacy_polizas
on conflict (id) do nothing;

-- Productores asociados a cada poliza.
insert into public.poliza_productores (
  id,
  poliza_id,
  productor_id,
  porcentaje_participacion,
  created_at
)
select
  id,
  poliza_id,
  productor_id,
  coalesce(porcentaje_participacion, 100),
  coalesce(created_at, now())
from public.legacy_poliza_productores
on conflict (id) do nothing;

-- Si la poliza antigua tenia productor_id pero no tenia fila intermedia,
-- se crea la asignacion principal.
insert into public.poliza_productores (
  poliza_id,
  productor_id,
  rol,
  porcentaje_participacion
)
select
  p.id,
  p.productor_id,
  'principal',
  100
from public.legacy_polizas p
where p.productor_id is not null
  and exists (select 1 from public.polizas np where np.id = p.id)
  and exists (select 1 from public.productores pr where pr.id = p.productor_id)
  and not exists (
    select 1
    from public.poliza_productores pp
    where pp.poliza_id = p.id
      and pp.productor_id = p.productor_id
  );

-- Asegurados relacionados a cada poliza.
insert into public.poliza_asegurados (
  id,
  poliza_id,
  cliente_id,
  relacion,
  created_at
)
select
  id,
  poliza_id,
  cliente_id,
  coalesce(parentesco, 'titular'),
  coalesce(created_at, now())
from public.legacy_poliza_asegurados
on conflict (id) do nothing;

-- Beneficiarios relacionados a cada poliza.
insert into public.poliza_beneficiarios (
  id,
  poliza_id,
  cliente_id,
  parentesco,
  porcentaje_participacion,
  created_at
)
select
  id,
  poliza_id,
  cliente_id,
  parentesco,
  porcentaje_participacion,
  coalesce(created_at, now())
from public.legacy_poliza_beneficiarios
on conflict (id) do nothing;

-- Coberturas especificas por poliza.
insert into public.poliza_coberturas (
  id,
  poliza_id,
  cobertura_id,
  suma_asegurada,
  deducible,
  created_at
)
select
  id,
  poliza_id,
  cobertura_id,
  suma_asegurada,
  deducible,
  coalesce(created_at, now())
from public.legacy_poliza_coberturas
on conflict (id) do nothing;

-- Cuotas existentes, si las hubiera.
insert into public.poliza_cuotas (
  id,
  poliza_id,
  numero_cuota,
  monto,
  saldo,
  fecha_vencimiento,
  estado,
  fecha_pago,
  moneda,
  metodo_pago,
  referencia_pago,
  monto_pagado,
  comision_agencia,
  comision_productor,
  created_at
)
select
  id,
  poliza_id,
  numero_cuota,
  coalesce(monto, 0),
  greatest(coalesce(monto, 0) - coalesce(monto_pagado, 0), 0),
  fecha_vencimiento,
  case lower(coalesce(estado, 'pendiente'))
    when 'pagado' then 'pagada'
    when 'pagada' then 'pagada'
    when 'vencido' then 'vencida'
    when 'vencida' then 'vencida'
    when 'cancelado' then 'anulada'
    when 'cancelada' then 'anulada'
    else 'pendiente'
  end,
  fecha_pago,
  case upper(coalesce(moneda, 'USD'))
    when 'VES' then 'VES'
    when 'EUR' then 'EUR'
    else 'USD'
  end,
  metodo_pago,
  referencia_pago,
  coalesce(monto_pagado, 0),
  comision_agencia,
  comision_productor,
  coalesce(created_at, now())
from public.legacy_poliza_cuotas
on conflict (id) do nothing;

commit;