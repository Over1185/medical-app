# Frontend - Medical App

## 1. Objetivo

Este documento describe la arquitectura, decisiones técnicas y flujo funcional del frontend de la aplicación de gestión de citas médicas.

Su propósito es que cualquier desarrollador pueda:

- Entender rápidamente cómo está construido el frontend.
- Ubicar dónde hacer cambios según el tipo de requerimiento.
- Mantener consistencia visual y de comportamiento.
- Validar cambios con pruebas unitarias de frontend.

---

## 2. Stack y herramientas

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Sonner (toasts)
- Tabler Icons
- Vitest + Testing Library para unit tests

Scripts relevantes:

```bash
pnpm run dev
pnpm run test:frontend
pnpm run lint
pnpm run format
```

---

## 3. Estructura frontend

```text
app/
 layout.tsx
 globals.css
 page.tsx
 citas/
  [id]/
   page.tsx

components/
 appointments/
  CreateAppointmentForm.tsx
 ui/
  Badge.tsx
  Button.tsx
  Card.tsx
  Modal.tsx
  Skeleton.tsx
  Spinner.tsx

hooks/
 useAppointments.ts

__test__/frontend/
 page.test.tsx
 useAppointments.test.tsx
 CreateAppointmentForm.test.tsx
```

---

## 4. Rutas de UI

### 4.1 Dashboard de citas

- Archivo: `app/page.tsx`
- Función principal:
  - Lista citas.
  - Permite crear una cita en modal.
  - Permite confirmar/cancelar cita pendiente.
  - Permite eliminar cita con confirmación en modal.
  - Navega al detalle de una cita.

Estados manejados en pantalla:

- `loading` inicial con skeleton + spinner.
- estado vacío cuando no hay citas.
- estado de error cuando falla la carga.
- estado normal con listado completo.

### 4.2 Detalle de cita

- Archivo: `app/citas/[id]/page.tsx`
- Función principal:
  - Busca la cita por `id` desde el estado del hook.
  - Muestra información completa de cita.
  - Permite editar datos de la cita (paciente, doctor, fecha y motivo).
  - Permite cambiar estado (confirmada/cancelada).
  - Permite eliminar con modal de confirmación.

Notas:

- Si no encuentra la cita, muestra pantalla de “no encontrada”.
- Usa `router.push("/")` luego de eliminar exitosamente.

---

## 5. Gestión de datos en frontend

### 5.1 Hook central: `useAppointments`

Archivo: `hooks/useAppointments.ts`

Estado expuesto:

- `appointments`: lista en memoria.
- `loading`: carga en curso.
- `error`: error de carga/listado.

Acciones expuestas:

- `createAppointment(input)`
- `updateAppointment(id, input)`
- `updateStatus(id, status)`
- `deleteAppointment(id)`
- `refresh()`

Comportamiento clave:

1. Carga inicial al montar (`useEffect` + `fetchAppointments`).
2. `createAppointment` hace `POST /appointments` y luego `refresh`.
3. `updateAppointment` consume `PUT /appointments/:id` y sincroniza estado local.
4. `updateStatus` aplica actualización optimista local y rollback si falla.
5. `deleteAppointment` aplica eliminación optimista local y rollback si falla.

### 5.2 Endpoints consumidos por el frontend

- `GET /appointments`
- `POST /appointments`
- `PUT /appointments/:id`
- `PATCH /appointments/:id/status`
- `DELETE /appointments/:id`

---

## 6. Componentes de negocio

### 6.1 `CreateAppointmentForm`

Archivo: `components/appointments/CreateAppointmentForm.tsx`

Responsabilidades:

- Control de formulario (campos: paciente, doctor, fecha/hora, motivo).
- Transformación de fecha local a ISO antes de enviar.
- Render de errores por campo provenientes del backend.
- Manejo de estados de envío (`isSubmitting`).
- Emisión de callbacks:
  - `onSuccess()` cuando se crea correctamente.
  - `onCancel()` cuando el usuario cierra/cancela.

Validación y errores:

- El backend puede devolver `fieldErrors`; se muestran bajo cada campo.
- Errores generales se muestran en toast.

---

## 7. Design system (componentes UI)

### 7.1 Botón

- Archivo: `components/ui/Button.tsx`
- Variantes: `primary`, `secondary`, `danger`, `ghost`
- Tamaños: `sm`, `md`, `lg`
- Soporta `disabled` y `forwardRef`.

### 7.2 Badge

- Archivo: `components/ui/Badge.tsx`
- Variantes: `default`, `success`, `warning`, `danger`
- Usado para representar estado de cita.

### 7.3 Card

- Archivo: `components/ui/Card.tsx`
- Subcomponentes: `Card`, `CardHeader`, `CardTitle`, `CardContent`
- Contenedor visual estándar para bloques de información.

### 7.4 Modal

- Archivo: `components/ui/Modal.tsx`
- Controlado externamente por `isOpen`.
- Cierre por backdrop y botón explícito.
- Estructura accesible (`role="dialog"`, `aria-modal`).

### 7.5 Skeleton y Spinner

- Archivos:
  - `components/ui/Skeleton.tsx`
  - `components/ui/Spinner.tsx`
- Se usan para percepción de carga y continuidad visual.

---

## 8. Estilos globales y tema

Archivo: `app/globals.css`

Puntos clave:

- Define tokens CSS en `:root` para fondo, foreground, primario, card y border.
- Expone tokens a Tailwind v4 con `@theme inline`.
- Fuerza paleta clara incluso con preferencia dark del sistema (decisión UX actual).

Archivo: `app/layout.tsx`

- Inyecta fuentes `Geist` y `Geist Mono`.
- Configura `<html lang="es">`.
- Renderiza `Toaster` global para notificaciones.

---

## 9. Convenciones de UX y comportamiento

### 9.1 Mensajería

- Éxitos y errores de acciones del usuario se notifican con toasts.
- Errores de validación detallados se muestran inline cuando aplica.

### 9.2 Confirmaciones destructivas

- Eliminación siempre pasa por modal de confirmación.

### 9.3 Localización

- Fechas en UI se renderizan con `es-ES`.
- Copys en español, orientados a contexto médico.

---

## 10. Pruebas unitarias de frontend

Ubicación:

- `__test__/frontend/page.test.tsx`
- `__test__/frontend/useAppointments.test.tsx`
- `__test__/frontend/CreateAppointmentForm.test.tsx`
- `__test__/frontend/appointment-detail-page.test.tsx`

Ejecución:

```bash
pnpm run test:frontend
```

Cobertura funcional actual:

- Render principal de dashboard.
- Ciclo de datos del hook (`load`, `create`, rollback en `updateStatus`).
- Flujo del formulario (`submit`, errores de validación, cancelación).
- Estados del detalle (`loading`, cita no encontrada).
- Apertura de modal de eliminación en detalle.

---
