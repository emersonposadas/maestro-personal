import { instruments, type ExerciseResult, type Session } from './model';

type Observation = { sessionId: string; date: string; result: ExerciseResult; partial: boolean };
export type SkillProgress = {
  key: string; title: string; skill: string; version: number; observations: Observation[];
  status: string; suggestion: string;
};
export function analyzeProgress(sessions: Session[]) {
  return instruments.map(instrument => {
    const groups = new Map<string, SkillProgress>();
    for (const session of sessions) {
      for (const result of session.results) {
        const exercise = session.lesson.exercises.find(e => e.id === result.exerciseId && e.version === result.exerciseVersion);
        if (!exercise || exercise.instrument !== instrument) continue;
        // Also separate altered content even if an imported exercise reused an ID/version.
        const key = JSON.stringify([exercise.id, exercise.version, exercise.skill, exercise.title, exercise.steps, exercise.success, exercise.minutes]);
        const group = groups.get(key) ?? { key, title: exercise.title, skill: exercise.skill, version: exercise.version, observations: [], status: '', suggestion: '' };
        if (!group.observations.some(o => o.sessionId === session.id)) group.observations.push({ sessionId: session.id, date: session.lesson.date, result, partial: session.status !== 'completada' });
        groups.set(key, group);
      }
    }
    const skills = [...groups.values()].map(group => {
      group.observations.sort((a, b) => a.result.timestamp.localeCompare(b.result.timestamp) || a.sessionId.localeCompare(b.sessionId));
      const attempted = group.observations.filter(o => o.result.outcome !== 'omitido');
      const latest = group.observations.at(-1)!;
      const lastTwo = attempted.slice(-2);
      const repeatedDifficulty = lastTwo.length === 2 && lastTwo.every(o => o.result.outcome === 'dificultad');
      if (latest.result.outcome === 'omitido') {
        group.status = 'Último ejercicio omitido';
        group.suggestion = 'Revisa el motivo de la omisión antes de retomar. Omitir no demuestra un retroceso.';
      } else if (repeatedDifficulty) {
        group.status = 'Dificultad declarada en los dos últimos intentos';
        group.suggestion = 'Propuesta para el tutor: trabajar un fragmento más corto, porque los dos últimos intentos de este ejercicio registran dificultad.';
      } else if (latest.result.outcome === 'dificultad') {
        group.status = 'Dificultad en el último intento';
        group.suggestion = 'Propuesta para el tutor: fragmentar el ejercicio y revisar el punto concreto de dificultad que anotaste.';
      } else if (latest.result.outcome === 'necesita repetir') {
        group.status = 'Pendiente de refuerzo';
        group.suggestion = 'Propuesta para el tutor: repetir esta referencia antes de aumentar la dificultad, porque marcaste «necesita repetir».';
      } else {
        group.status = 'Criterio declarado como conseguido';
        group.suggestion = 'Conserva la referencia y confirma el resultado con el tutor. Esta autoevaluación no acredita dominio ni justifica subir de nivel.';
      }
      return group;
    });
    const observations = skills.flatMap(s => s.observations);
    return {
      instrument, skills,
      attempts: observations.filter(o => o.result.outcome !== 'omitido').length,
      omitted: observations.filter(o => o.result.outcome === 'omitido').length,
      sessionCount: new Set(observations.filter(o => o.result.outcome !== 'omitido').map(o => o.sessionId)).size,
    };
  });
}
