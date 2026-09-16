# DNS — Ministerio de Adolescentes

Plataforma web para gestionar clanes, ágapes, líderes, adolescentes, reuniones, asistencias, seguimiento, calendario y eventos.

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth + PostgreSQL + RLS
- Zod
- Lucide React

## 1. Instalar

```bash
npm install
```

## 2. Variables

Copia `.env.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 3. Base de datos

En Supabase SQL Editor ejecuta, en orden:

1. `supabase/migrations/0001_dns_core.sql`
2. `supabase/seed.sql`

El seed crea los cuatro clanes y los tipos iniciales. Los usuarios reales se crean mediante Supabase Auth.

## 4. Crear el primer administrador

Registra el usuario en Supabase Auth y luego ejecuta:

```sql
update public.profiles
set role = 'admin'
where email = 'TU_CORREO';
```

## 5. Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Estructura

- `src/app`: rutas y composición
- `src/features`: lógica por dominio
- `src/components`: UI compartida
- `src/lib`: Supabase, auth y utilidades
- `supabase/migrations`: esquema versionado
- `supabase/tests`: pruebas de BD

La base de datos es la fuente de verdad. Google Sheets queda para exportación/sincronización futura.
