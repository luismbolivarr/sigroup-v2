-- ============================================================
-- Siasesores V2 - Catálogos iniciales de prueba
-- Ejecutar después de 20260924000000_siasesores_v2_schema.sql
-- ============================================================

begin;

-- Roles base
insert into public.roles (codigo, nombre, descripcion, nivel) values
  ('superadmin', 'Super Administrador', 'Control total del sistema', 100),
  ('admin', 'Administrador', 'Gestión operativa y configuración', 80),
  ('coordinador', 'Coordinador', 'Supervisa operadores y asesores', 60),
  ('operador', 'Operador', 'Emite pólizas y gestiona siniestros', 40),
  ('asesor', 'Asesor / Productor', 'Vende y gestiona sus clientes', 20),
  ('visualizador', 'Visualizador', 'Solo lectura de información', 10)
on conflict (codigo) do nothing;

-- Aseguradoras
insert into public.aseguradoras (nombre, rif, telefono, email, activo) values
  ('Mapfre Seguros', 'J-000000000', '0212-1234567', 'contacto@mapfre.com', true),
  ('Mercantil Seguros', 'J-111111111', '0212-2345678', 'info@mercantilseguros.com', true),
  ('Seguros Caracas', 'J-222222222', '0212-3456789', 'atencion@seguroscaracas.com', true),
  ('Banesco Seguros', 'J-333333333', '0212-4567890', 'ventas@banescoseguros.com', true),
  ('Seguros La Vitalicia', 'J-444444444', '0212-5678901', 'servicio@lavitalicia.com', true)
on conflict (nombre) do nothing;

-- Ramos
insert into public.ramos (codigo, nombre, descripcion, activo) values
  ('hcm', 'Salud (HCM)', 'Hospitalización, cirugía y maternidad', true),
  ('auto', 'Automóvil', 'Vehículos livianos y pesados', true),
  ('vida', 'Vida', 'Seguros de vida individual y colectivos', true),
  ('hogar', 'Hogar', 'Protección de vivienda y contenido', true),
  ('empresarial', 'Empresarial', 'Pólizas para empresas y comercios', true),
  ('motos_convenio', 'Motos Convenio', 'Pólizas especiales para motocicletas', true)
on conflict (codigo) do nothing;

-- Coberturas
with ramos_map as (
  select id, codigo from public.ramos where codigo in ('hcm', 'auto', 'vida', 'hogar', 'empresarial')
)
insert into public.coberturas (ramo_id, codigo, nombre, descripcion, activo)
select r.id, c.codigo, c.nombre, c.descripcion, true
from ramos_map r
join (
  values
    ('hcm', 'hcm_basica', 'Cobertura Básica', 'Consultas, emergencias y hospitalización básica'),
    ('hcm', 'hcm_maternidad', 'Maternidad', 'Atención prenatal, parto y postparto'),
    ('hcm', 'hcm_odontologia', 'Odontología', 'Tratamientos dentales básicos'),
    ('hcm', 'hcm_lentes', 'Lentes', 'Reembolso de lentes y examen de la vista'),
    ('auto', 'auto_rc', 'Responsabilidad Civil', 'Daños a terceros en accidentes'),
    ('auto', 'auto_perdida_total', 'Pérdida Total', 'Indemnización por pérdida total del vehículo'),
    ('auto', 'auto_danios_propios', 'Daños Propios', 'Reparación de daños al vehículo asegurado'),
    ('auto', 'auto_asistencia', 'Asistencia en Carretera', 'Grúa, auxilio mecánico y pasaje de regreso'),
    ('vida', 'vida_basica', 'Vida Básica', 'Indemnización por fallecimiento'),
    ('vida', 'vida_accidentes', 'Accidentes Personales', 'Indemnización por muerte o invalidez accidental'),
    ('hogar', 'hogar_incendio', 'Incendio y Líneas Aliadas', 'Daños por incendio, rayo y explosión'),
    ('hogar', 'hogar_robo', 'Robo y Hurto', 'Protección ante robo de contenido'),
    ('empresarial', 'emp_rc', 'Responsabilidad Civil Empresarial', 'Daños a terceros derivados de la operación'),
    ('empresarial', 'emp_fidelidad', 'Fidelidad', 'Pérdidas por desfalco de empleados')
) as c(ramo_codigo, codigo, nombre, descripcion)
on c.ramo_codigo = r.codigo
on conflict (ramo_id, nombre) do nothing;

-- Productores
insert into public.productores (codigo_interno, nombre_completo, tipo_documento, documento_identidad, telefono, email, porcentaje_comision_base, porcentaje_islr, activo) values
  ('PROD-001', 'Luis Manuel Bolívar', 'V', '12345678', '0414-1111111', 'luis@siasesores.com', 70.0000, 3.0000, true),
  ('PROD-002', 'Ana María Pérez', 'V', '87654321', '0414-2222222', 'ana@siasesores.com', 65.0000, 3.0000, true),
  ('PROD-003', 'Carlos Andrés Rodríguez', 'V', '11223344', '0414-3333333', 'carlos@siasesores.com', 70.0000, 3.0000, true),
  ('PROD-004', 'María Fernanda Díaz', 'V', '44332211', '0414-4444444', 'maria@siasesores.com', 60.0000, 3.0000, true)
on conflict (codigo_interno) do nothing;

commit;
