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
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` es solo para el servidor. No la publiques ni la expongas en el navegador; se usa para tareas administrativas como crear cuentas, firmar descargas privadas y operaciones controladas por rol.

## 3. Base de datos

En Supabase SQL Editor ejecuta, en orden:

1. Todas las migraciones de `supabase/migrations`, desde `0001_tipos.sql` hasta la última disponible.
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

## 6. Despliegue en Vercel

Si subes solo esta carpeta (`dns`) a GitHub, Vercel detecta Next.js automáticamente.

Si subes la carpeta padre `WEB DNS`, en Vercel configura:

- Root Directory: `dns`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: dejar vacío

En Project Settings > Environment Variables agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Usa los valores reales de tu proyecto Supabase. La `SUPABASE_SERVICE_ROLE_KEY` debe quedar solo como variable del servidor en Vercel; no la pongas en código ni la compartas.

## Estructura

- `src/app`: rutas y composición
- `src/features`: lógica por dominio
- `src/components`: UI compartida
- `src/lib`: Supabase, auth y utilidades
- `supabase/migrations`: esquema versionado
- `supabase/tests`: pruebas de BD

La base de datos es la fuente de verdad. Google Sheets queda para exportación/sincronización futura.

## Verificación antes de compartir

```bash
npm run lint
npm run build
```

No compartas `.env.local`, `.next`, `node_modules` ni archivos generados localmente. Ya están incluidos en `.gitignore`.
