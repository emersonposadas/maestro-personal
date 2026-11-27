import { describe, it, expect } from 'vitest';
import { dateInZone, emptyData, dataSchema } from '../src/domain/model';
import { initialLesson, startSession, recordResult, finishSession, feedback } from '../src/domain/lesson';
import { weeklyTotals } from '../src/domain/planning';
import { mergeBackup, parseBackup, serializeBackup } from '../src/storage/repository';
const start = () => startSession(initialLesson('2026-11-27'));
describe('Calendario y fecha local', () => {
  it('suma 915 minutos sin pausas ni ensayos', () => expect(weeklyTotals()).toEqual({ accordion: 600, bass: 225, voice: 90, total: 915 }));
  it('usa la fecha de la zona configurada', () => expect(dateInZone('Europe/Berlin', new Date('2026-11-27T23:30:00Z'))).toBe('2026-11-28'));
});
describe('Clase y adaptación transparente', () => {
  it('no permite finalizar sin todos los resultados', () => expect(() => finishSession(start())).toThrow());
  it('exige motivo de omisión y reanudar antes de registrar', () => {
    expect(() => recordResult(start(), 'omitido', ' ')).toThrow();
    expect(() => recordResult({ ...start(), status: 'pausada' }, 'conseguido', '')).toThrow();
  });
  it('conserva resultados parciales y sustituye sin duplicar al volver', () => {
    const s = recordResult(start(), 'dificultad', 'Sin continuidad');
    expect(s.index).toBe(1);
    const edited = recordResult({ ...s, index: 0 }, 'necesita repetir', 'Revisado');
    expect(edited.results).toHaveLength(1);
    expect(edited.results[0].outcome).toBe('necesita repetir');
  });
  it('propone fragmentar por dificultad y no acredita dominio', () => {
    let s = recordResult(start(), 'dificultad', 'Una frase');
    s = recordResult(s, 'conseguido', 'Sol y Do');
    s = finishSession(recordResult(s, 'conseguido', 'Frase cómoda'));
    expect(s.status).toBe('completada');
    expect(feedback(s).join(' ')).toContain('fragmentar');
    expect(feedback(s).join(' ')).toContain('no acredita dominio');
    expect(dataSchema.safeParse({ ...emptyData(), sessions: [s] }).success).toBe(true);
  });
  it('reduce la carga por cansancio', () => expect(feedback({ ...start(), mood: 'cansado' })[1]).toContain('reducir'));
});
describe('Intercambio validado', () => {
  it('recupera datos y evita duplicados al importar dos veces', () => {
    const data = { ...emptyData(), sessions: [start()] };
    expect(parseBackup(serializeBackup(data))).toEqual(data);
    expect(mergeBackup(data, data)).toEqual(data);
  });
  it('rechaza conflictos sin alterar el registro original', () => {
    const original = { ...emptyData(), sessions: [start()] };
    const changed = { ...original, sessions: [{ ...original.sessions[0], activeSeconds: 10 }] };
    expect(() => mergeBackup(original, changed)).toThrow('mismo identificador');
    expect(original.sessions[0].activeSeconds).toBe(0);
  });
  it('rechaza versiones, fechas, resultados e índices inválidos', () => {
    expect(() => parseBackup('{"schemaVersion":2}')).toThrow();
    expect(dataSchema.safeParse({ ...emptyData(), sessions: [{ ...start(), index: 100 }] }).success).toBe(false);
    expect(dataSchema.safeParse({ ...emptyData(), sessions: [{ ...start(), lesson: initialLesson('2026-02-31') }] }).success).toBe(false);
    expect(dataSchema.safeParse({ ...emptyData(), sessions: [start(), start()] }).success).toBe(false);
  });
});
