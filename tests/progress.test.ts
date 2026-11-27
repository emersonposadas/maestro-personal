import { it, expect } from 'vitest';
import { analyzeProgress } from '../src/domain/progress';
import { initialLesson, recordResult, startSession } from '../src/domain/lesson';
import type { ExerciseResult } from '../src/domain/model';
const sample = (outcome: ExerciseResult['outcome'], date: string) => recordResult(startSession(initialLesson(date)), outcome, 'Referencia personal', `${date}T18:00:00.000Z`);
it('mantiene las tres áreas sin inventar datos', () => {
  const areas = analyzeProgress([]);
  expect(areas.map(a => a.instrument)).toEqual(['Acordeón', 'Bajo quinto', 'Canto']);
  expect(areas.every(a => a.attempts === 0 && a.skills.length === 0)).toBe(true);
});
it('ordena cronológicamente e identifica dificultad repetida en el mismo ejercicio', () => {
  const a = sample('dificultad', '2026-11-26');
  const b = sample('dificultad', '2026-11-27');
  const area = analyzeProgress([b, a])[0];
  expect(area.sessionCount).toBe(2);
  expect(area.skills[0].status).toContain('dos últimos intentos');
  expect(area.skills[0].observations[0].date).toBe('2026-11-26');
  expect(area.skills[0].observations[0].partial).toBe(true);
});
it('las omisiones no cuentan como intentos ni como retrocesos', () => {
  const area = analyzeProgress([sample('omitido', '2026-11-27')])[0];
  expect(area.attempts).toBe(0);
  expect(area.sessionCount).toBe(0);
  expect(area.omitted).toBe(1);
  expect(area.skills[0].suggestion).toContain('no demuestra un retroceso');
});
it('no mezcla versiones ni contenido cambiado', () => {
  const a = sample('dificultad', '2026-11-26');
  const b = sample('dificultad', '2026-11-27');
  b.lesson.exercises[0].version = 2;
  b.results[0].exerciseVersion = 2;
  expect(analyzeProgress([a, b])[0].skills).toHaveLength(2);
  b.lesson.exercises[0].version = 1;
  b.results[0].exerciseVersion = 1;
  b.lesson.exercises[0].steps = ['Otro ejercicio'];
  expect(analyzeProgress([a, b])[0].skills).toHaveLength(2);
});
it('no transforma conseguido en dominio ni duplica sesiones', () => {
  const s = sample('conseguido', '2026-11-27');
  const area = analyzeProgress([s, s])[0];
  expect(area.attempts).toBe(1);
  expect(area.skills[0].suggestion).toContain('no acredita dominio');
  expect(analyzeProgress([s])[1].attempts).toBe(0);
});
it('no mantiene dificultad repetida cuando el último intento necesita repetir', () => {
  const area = analyzeProgress([sample('dificultad', '2026-11-25'), sample('dificultad', '2026-11-26'), sample('necesita repetir', '2026-11-27')])[0];
  expect(area.skills[0].status).toBe('Pendiente de refuerzo');
});
