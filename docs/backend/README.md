# Backend - Sistema de Gestion de Citas

## 1. Resumen

Este backend implementa una API REST sobre Next.js App Router para gestionar citas medicas. La persistencia se realiza en Turso (libSQL) y la validacion de entrada se hace con Zod.

El backend incluye:

- Endpoints CRUD de citas.
- Endpoint especifico para cambio de estado.
- Validacion de payload y parametros.
- CORS con allowlist.
- Rate limiting para endpoints de escritura.
- Contrato de errores estable para frontend (code, message, details, requestId).

## 2. Stack tecnico

- Runtime API: Next.js App Router (Node runtime)
- Lenguaje: TypeScript
- Base de datos: Turso (libSQL)
- Cliente DB: @libsql/client
- Validacion: Zod
- Testing: Vitest (integracion real contra Turso)

## 3. Arquitectura

La implementacion sigue capas separadas para facilitar mantenimiento y evolucion:

- Capa HTTP (rutas): manejo de request/response y status HTTP.
- Capa de validacion: esquemas Zod para query, params y body.
- Capa de negocio (service): reglas de negocio y errores de dominio.
- Capa de persistencia (repository): SQL y mapeo entre dominio y base de datos.
- Capa transversal: seguridad HTTP, rate limit, entorno y catalogo de errores.

## 4. Estructura de carpetas (backend)

- app/appointments/route.ts
- app/appointments/[id]/route.ts
- app/appointments/[id]/status/route.ts
- lib/appointments/types.ts
- lib/appointments/validation.ts
- lib/appointments/service.ts
- lib/appointments/repository.ts
- lib/http/security.ts
- lib/http/rate-limit.ts
- lib/http/response.ts
- lib/errors/catalog.ts
- lib/config/env.ts
- lib/db/turso.ts
- db/schema.sql
- db/seed.sql

## 5. Modelo de datos

Tabla principal: appointments

- id: TEXT (UUID), PK
- patient_name: TEXT, obligatorio
- doctor_name: TEXT, obligatorio
- appointment_date: TEXT (ISO), obligatorio
- reason: TEXT, obligatorio
- status: TEXT, obligatorio con constraint
- created_at: TEXT, obligatorio
- updated_at: TEXT, obligatorio

Estados permitidos:

- pendiente
- confirmada
- cancelada

## 6. Endpoints

### 6.1 GET /appointments

Lista citas con paginacion.

Query params:

- limit: entero entre 1 y 100 (default 20)
- offset: entero mayor o igual a 0 (default 0)

Respuesta 200:

- data: arreglo de citas
- total
- limit
- offset

### 6.2 POST /appointments

Crea una cita nueva.

Body requerido:

- patientName
- doctorName
- appointmentDate (ISO datetime con offset)
- reason

Respuesta 201:

- Cita creada con status inicial pendiente

### 6.3 PUT /appointments/:id

Actualiza campos de una cita existente.

Body permitido:

- patientName
- doctorName
- appointmentDate
- reason
- status

Respuesta:

- 200 si actualiza
- 404 si no existe

### 6.4 PATCH /appointments/:id/status

Actualiza solo el estado de una cita.

Body requerido:

- status (pendiente | confirmada | cancelada)

Respuesta:

- 200 si actualiza
- 404 si no existe
- 422 si estado invalido

### 6.5 DELETE /appointments/:id

Elimina una cita existente.

Respuesta:

- 204 si elimina
- 404 si no existe

## 7. Seguridad y politicas HTTP

### 7.1 CORS

- Se valida origen contra ALLOWED_ORIGINS.
- Si origen no permitido, responde 403.

### 7.2 Rate limit

- Aplica a endpoints de escritura: POST, PUT, PATCH, DELETE.
- Configurable con:
  - RATE_LIMIT_WINDOW_MS
  - RATE_LIMIT_MAX_REQUESTS

Nota operacional:

- El rate limit actual usa memoria en proceso. En entornos serverless con multiples instancias no es un limite global compartido.

### 7.3 Headers y trazabilidad

Se incluyen:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: no-referrer
- X-Request-Id para trazabilidad

## 8. Contrato de errores

Todas las respuestas de error siguen la misma forma:

{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje para UI",
    "requestId": "uuid",
    "details": {}
  }
}

Catalogo actual de codigos:

- VALIDATION_ERROR
- APPOINTMENT_NOT_FOUND
- RATE_LIMIT_EXCEEDED
- INVALID_JSON_BODY
- CORS_FORBIDDEN
- INTERNAL_ERROR

## 9. Variables de entorno

Variables runtime obligatorias:

- ALLOWED_ORIGINS
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN

Variable solo para scripts de CLI:

- TURSO_DB_NAME

## 10. Scripts de base de datos

- pnpm db:schema
  - Aplica esquema en Turso desde db/schema.sql

- pnpm db:seed
  - Carga datos base desde db/seed.sql

- pnpm db:reset
  - Ejecuta schema y luego seed

## 11. Testing backend

Comando principal:

- pnpm test:backend

Los tests actuales son de integracion real:

- Ejecutan handlers reales.
- Persisten datos reales en Turso.
- Hacen cleanup manual por id para mantener pruebas repetibles.
