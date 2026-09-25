# Siasesores V2 - Esquema Supabase Staging

Archivo principal:

- `supabase/migrations/20260924000000_siasesores_v2_schema.sql`

Este esquema esta pensado para probar en Supabase staging antes de tocar produccion. No migra datos automaticamente desde la base actual ni desde `kv_store_08511a94`.

## Modulos cubiertos

| Modulo | Tablas principales |
|---|---|
| Suscripcion | `polizas`, `poliza_asegurados`, `poliza_beneficiarios`, `poliza_coberturas`, `bienes_asegurados`, `poliza_movimientos`, `solicitudes_autorizacion`, `renovaciones_poliza` |
| Fraccionamiento | `poliza_cuotas`, `pagos`, `recordatorios_cobranza`, `comisiones` |
| Administracion | `aseguradoras`, `ramos`, `coberturas`, `convenios_aseguradora`, `parametros_sistema` |
| Reportes | `reportes_guardados` |
| Motos Convenio | `motos_convenio`, conectada con `clientes`, `vehiculos`, `polizas` y `aseguradoras` |
| Siniestros | `siniestros`, `siniestro_movimientos`, `documentos` |
| Asesores y Aseguradoras | `productores`, `poliza_productores`, `aseguradoras`, `convenios_aseguradora` |
| Cumpleanos | `clientes.fecha_nacimiento`, `notificaciones_cumpleanos` |
| Gestion de Usuarios | `usuarios_sistema`, `roles`, `permisos`, `usuario_roles`, `rol_permisos` |
| Log de Actividades | `log_actividad`, `tareas_operativas` |
| Mensajeria | `mensajes` |

## Decisiones de diseno

- Sin referencias fiscales de Mexico: no usa `rfc`, `curp`, `mxn` ni `nit`.
- Documentos venezolanos: `V`, `E`, `J`, `G`, `P`.
- Monedas permitidas: `USD`, `VES`, `EUR`.
- `clientes` es la entidad comun para tomador, asegurado, beneficiario y propietario.
- `poliza_productores` permite uno o varios productores por poliza.
- `vehiculos` y `bienes_asegurados` separan datos estructurados del bien asegurado.
- `solicitudes_autorizacion`, `renovaciones_poliza`, `recordatorios_cobranza` y `tareas_operativas` hacen visibles procesos que normalmente quedan ocultos en codigo.
- RLS esta habilitado. Varias tablas quedan disponibles principalmente para backend con service role hasta definir politicas finas por modulo.

## Como aplicarlo en staging

Opcion SQL Editor:

1. Abre tu proyecto Supabase staging.
2. Ve a SQL Editor.
3. Copia el contenido de `supabase/migrations/20260924000000_siasesores_v2_schema.sql`.
4. Ejecutalo completo.
5. Verifica que se creen las tablas y los roles semilla.

Opcion Supabase CLI, si el proyecto esta vinculado:

```powershell
cd D:\Proyectos\SiAsesoresV2
supabase link --project-ref TU_PROJECT_REF_STAGING
supabase db push
```

## Validaciones sugeridas despues de aplicar

```sql
select count(*) as tablas_siasesores
from information_schema.tables
where table_schema = 'public';

select codigo, nombre
from public.roles
order by nivel desc;

select codigo, nombre
from public.ramos
order by nombre;
```

## Siguiente paso recomendado

Antes de conectar el frontend, crear un script de migracion desde los datos actuales hacia este modelo:

- `kv_store_08511a94` `poliza:*` -> `clientes`, `polizas`, `poliza_cuotas`, `vehiculos`, `bienes_asegurados`.
- `productor:*` -> `productores`.
- `siniestro:*` -> `siniestros`.
- `motoconvenio:*` -> `motos_convenio`, `vehiculos`, `clientes`.
- `comision:*` -> `comisiones`.