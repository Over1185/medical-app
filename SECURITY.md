# Security Policy

Gracias por ayudar a mejorar la seguridad de este proyecto.

## Reportar una vulnerabilidad

Por favor **no publiques vulnerabilidades en issues públicos**.

Usa reporte privado en GitHub Security Advisories:

- https://github.com/Over1185/medical-app/security/advisories/new

Si no tienes acceso al formulario anterior, abre un issue pidiendo contacto privado **sin incluir detalles técnicos sensibles**.

## Qué incluir en el reporte

Incluye, en la medida de lo posible:

- Tipo de vulnerabilidad (inyección, exposición de secretos, bypass de validación, etc.).
- Impacto potencial.
- Pasos para reproducir.
- PoC mínima (request/response, payload, captura de headers/logs sanitizados).
- Versión/commit afectado.
- Propuesta de mitigación (opcional).

## Tiempos de respuesta (SLA objetivo)

- Confirmación de recepción: dentro de 72 horas.
- Evaluación inicial (severidad/alcance): dentro de 7 días.
- Actualizaciones de estado: al menos cada 7 días mientras siga abierto.
- Corrección y publicación de advisory: según severidad y complejidad.

Estos tiempos son objetivos y pueden variar según disponibilidad.

## Alcance

Se consideran en alcance:

- API de citas (rutas en `app/appointments/**`).
- Validaciones y manejo de errores.
- Configuración de seguridad HTTP y CORS.
- Lógica de rate limiting.
- Integración con Turso/libSQL.
- Manejo de secretos y variables de entorno.

Fuera de alcance (salvo que tengan impacto real explotable):

- Hallazgos solo teóricos sin PoC reproducible.
- Problemas de estilo/formato.
- Denegación de servicio no realista sin impacto práctico.
- Vulnerabilidades en dependencias sin ruta de explotación en este proyecto.

## Divulgación responsable

- No divulgues públicamente el hallazgo antes de que exista parche o mitigación.
- Da tiempo razonable para corregir.
- Evita pruebas destructivas sobre datos de producción.
- No accedas a información de terceros.

## Buenas prácticas de seguridad del proyecto

Este repositorio ya contempla medidas base y deben mantenerse:

- Validación estricta de entrada (Zod).
- CORS por allowlist (`ALLOWED_ORIGINS`).
- Rate limit para operaciones de escritura.
- Contrato de errores controlado (sin exponer trazas internas).
- Variables sensibles fuera del repositorio (`.env*` ignorado en git).

## Recomendaciones operativas para producción

- Rotar periódicamente `TURSO_AUTH_TOKEN`.
- Limitar `ALLOWED_ORIGINS` a dominios exactos.
- No reutilizar base de datos de producción en entornos preview.
- Revisar logs y eventos de error con `requestId`.
- Mantener dependencias actualizadas y ejecutar auditorías periódicas.

## Versiones soportadas

Actualmente se da soporte de seguridad a la rama principal activa:

- `main` (última versión desplegada)

Versiones antiguas o forks no tienen garantía de parches.
