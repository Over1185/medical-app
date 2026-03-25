# Medical App - Gestion de Citas

Aplicacion sencilla para gestion de citas medicas, construida con Next.js.

El proyecto tiene dos frentes principales:

- Backend API REST para citas.
- Frontend para consumo y gestion visual.

## Estado del proyecto

Actualmente el backend incluye:

- CRUD de citas.
- Cambio de estado con endpoint dedicado.
- Persistencia en Turso.
- Validacion con Zod.
- Contrato de errores estable para frontend.
- Tests de integracion reales contra Turso.

## Documentacion

- Backend extendido: [docs/backend/README.md](docs/backend/README.md)
- Frontend: [docs/frontend/README.md](docs/frontend/README.md)
- Despliegue: [docs/deployment/README.md](docs/deployment/README.md)

## Requisitos

- Node.js 20+
- [PNPM](https://pnpm.io/) (Para mas informacion sobre instalacion, [consulta la documentacion oficial de PNPM](https://pnpm.io/installation))
- [Turso CLI](https://github.com/tursodatabase/turso-cli) (si vas a ejecutar schema/seed desde scripts)

## Variables de entorno

Usa [/.example.env](.example.env) como referencia.

Variables runtime obligatorias:

- ALLOWED_ORIGINS
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN

Variable opcional para scripts:

- TURSO_DB_NAME

## Instalacion

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

## Base de datos (Turso)

Aplicar schema:

```bash
pnpm db:schema
```

Cargar seed:

```bash
pnpm db:seed
```

Reinicializar schema + seed:

```bash
pnpm db:reset
```

## Testing

Backend integracion real:

```bash
pnpm test:backend
```

Todos los tests:

```bash
pnpm test
```

## Build de produccion

```bash
pnpm build
pnpm start
```
