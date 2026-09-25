# SiAsesores V2

Sistema de gestión de seguros para productores y asesores de aseguradoras.

## Requisitos

- Node.js 20+
- npm
- Cuenta en Supabase

## Instalación local

```bash
npm install
```

## Configuración de entorno

Copia el archivo de ejemplo y completa tus credenciales de Supabase:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

> **Importante:** nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

## Levantar en desarrollo

```bash
npm run dev
```

## Compilar para producción

```bash
npm run build
```

## Base de datos

El esquema principal está en:

- `supabase/migrations/20260924000000_siasesores_v2_schema.sql`
- `supabase/migrations/20260924010000_migrate_legacy_data.sql`
- `database/README-staging-schema-v2.md`

Aplica las migraciones en tu proyecto de Supabase staging antes de conectar el frontend.

## Estructura del proyecto

```
src/
  App.tsx              # Routing principal
  main.tsx             # Punto de entrada
  components/          # Componentes reutilizables
  lib/supabase.ts      # Cliente de Supabase
  pages/               # Pantallas del sistema
  types/               # Tipos TypeScript
supabase/migrations/   # Esquema y migraciones SQL
```
