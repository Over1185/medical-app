# Deployment en Vercel

Esta guia documenta como desplegar el proyecto en Vercel y que necesitas tener listo para que funcione correctamente en produccion.

## 1. Requisitos previos

Antes de desplegar, necesitas:

- Cuenta en Vercel.
- Repositorio en GitHub con este proyecto.
- Base de datos Turso creada y accesible.
- Token de autenticacion de Turso con permisos para la base de datos.
- Node.js 20+ para validaciones locales (opcional, pero recomendado).
- PNPM instalado para correr build/tests localmente.

## 2. Variables de entorno requeridas

Estas variables son obligatorias en runtime (API y app en Vercel):

- `ALLOWED_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Referencia local: `.example.env`

Ejemplo para produccion:

```env
ALLOWED_ORIGINS=https://tu-dominio.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=TU_TOKEN_TURSO
```

Notas importantes:

- `ALLOWED_ORIGINS` acepta una lista separada por comas.
- Si usas dominio personalizado, agrega ese dominio en `ALLOWED_ORIGINS`.
- `TURSO_DB_NAME` no es variable de runtime; solo aplica para scripts CLI locales (`db:schema`, `db:seed`).

## 3. Preparar Turso (schema y seed)

El deployment no aplica migraciones automaticamente. Debes preparar la base de datos antes (o como parte de tu proceso CI/CD).

### Opcion A: Preparar desde local

1. Configura tus variables localmente (`TURSO_DB_NAME` si aplica).
2. Ejecuta:

```bash
pnpm install
pnpm db:schema
pnpm db:seed
```

### Opcion B: Preparar manualmente con Turso CLI

1. Aplica `db/schema.sql` en la base objetivo.
2. Carga `db/seed.sql` si necesitas datos iniciales.

## 4. Validar antes de desplegar

Recomendado ejecutar en local:

```bash
pnpm install
pnpm test:backend
pnpm test:frontend
pnpm build
```

Si todo pasa, el deploy tendra menor riesgo de fallar.

## 5. Despliegue en Vercel (paso a paso)

1. En Vercel, selecciona `Add New > Project`.
2. Importa el repositorio `medical-app`.
3. Verifica la configuracion del proyecto:
 - Framework Preset: `Next.js`
 - Root Directory: `/` (raiz del repositorio)
 - Install Command: `pnpm install`
 - Build Command: `pnpm build`
 - Output Directory: dejar default de Next.js
4. En `Environment Variables`, agrega todas las variables obligatorias de la seccion 2.
5. Guarda y ejecuta `Deploy`.

## 6. Verificacion post-deploy

Despues del despliegue, valida:

1. Abre la URL publicada de Vercel.
2. Crea una cita desde la UI.
3. Edita la cita (flujo PUT) y confirma persistencia.
4. Cambia estado de la cita.
5. Elimina la cita.
6. Revisa logs en Vercel para confirmar ausencia de errores 5xx.

## 7. Troubleshooting rapido

### Error: Variables de entorno invalidas

Causa probable: falta una variable o esta vacia.

Accion:

- Revisa `Settings > Environment Variables` en Vercel.
- Verifica nombres exactos y vuelve a desplegar.

### Error de CORS (`CORS_FORBIDDEN`)

Causa probable: dominio no incluido en `ALLOWED_ORIGINS`.

Accion:

- Agrega el dominio real de Vercel (o dominio custom) a `ALLOWED_ORIGINS`.
- Si son varios, separalos por comas.

### Error de conexion a Turso

Causa probable: `TURSO_DATABASE_URL` o `TURSO_AUTH_TOKEN` incorrectos.

Accion:

- Reemplaza por valores validos y redeploy.
- Verifica permisos del token en Turso.
