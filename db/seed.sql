INSERT INTO appointments (
  id,
  patient_name,
  doctor_name,
  appointment_date,
  reason,
  status,
  created_at,
  updated_at
) VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'Ana Torres',
    'Dra. Martinez',
    '2026-03-25T10:00:00.000Z',
    'Chequeo general',
    'pendiente',
    '2026-03-24T09:00:00.000Z',
    '2026-03-24T09:00:00.000Z'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Luis Ramirez',
    'Dr. Gomez',
    '2026-03-25T11:30:00.000Z',
    'Dolor lumbar',
    'confirmada',
    '2026-03-24T09:05:00.000Z',
    '2026-03-24T09:05:00.000Z'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Maria Perez',
    'Dra. Salazar',
    '2026-03-25T15:00:00.000Z',
    'Control de resultados',
    'cancelada',
    '2026-03-24T09:10:00.000Z',
    '2026-03-24T09:10:00.000Z'
  )
ON CONFLICT(id) DO UPDATE SET
  patient_name = excluded.patient_name,
  doctor_name = excluded.doctor_name,
  appointment_date = excluded.appointment_date,
  reason = excluded.reason,
  status = excluded.status,
  updated_at = excluded.updated_at;