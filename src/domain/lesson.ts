import type { Lesson, Session, ExerciseResult } from './model';

export function initialLesson(date: string): Lesson {
  return {
    id: 'linea-base-v1', date, level: 'diagnóstico pendiente',
    objective: 'Conocer tu punto de partida en los tres instrumentos.', activeMinutes: 12, breakMinutes: 2,
    completion: 'Registrar una observación por instrumento, o justificar su omisión. El tutor deberá revisar el diagnóstico.',
    exercises: [
      { id: 'base-acordeon', version: 1, instrument: 'Acordeón', skill: 'Familiaridad con el instrumento',
        title: 'Tu punto de partida con el acordeón', why: 'Identificar lo que ya conoces antes de asignar digitaciones o notas.',
        steps: ['Coloca el acordeón en una posición cómoda y estable. Si produce dolor, detente.', 'Si ya conoces una frase breve, tócala dos veces a una velocidad cómoda. Si aún no conoces ninguna, no adivines los botones: registra «necesita repetir».', 'En la observación, anota qué frase tocaste y dónde perdiste continuidad. Si estás empezando, escribe «sin experiencia». No se presupone ningún mapa de botones.'],
        minutes: 5, success: 'Identificas una frase conocida y sus dificultades, o dejas constancia de que necesitas empezar desde cero.', tool: 'temporizador' },
      { id: 'base-bajo', version: 1, instrument: 'Bajo quinto', skill: 'Limpieza y continuidad',
        title: 'Escucha un cambio que ya conoces', why: 'Elegir una referencia sencilla para trabajar la limpieza del acompañamiento.',
        steps: ['Elige dos acordes que ya sabes formar y anota sus nombres.', 'Alterna entre ellos cuatro veces, despacio. Escucha si alguna cuerda trastea o queda apagada.', 'Repite una vez. Anota qué cambio necesita atención; no aumentes la velocidad para completar la prueba.'],
        minutes: 4, success: 'Reconoces en qué cambio aparece una interrupción o una cuerda poco clara.', tool: 'temporizador' },
      { id: 'base-canto', version: 1, instrument: 'Canto', skill: 'Comodidad y continuidad vocal',
        title: 'Una frase en tu voz cómoda', why: 'Describir tu sensación al cantar sin atribuirle una medición de afinación.',
        steps: ['Elige una frase corta de una canción conocida y anota cuál es.', 'Cántala suavemente dos veces en una altura cómoda, sin forzar. Detente si aparece molestia.', 'Anota si puedes terminarla cómodamente o dónde necesitas respirar. La afinación queda pendiente de evaluación.'],
        minutes: 3, success: 'Identificas si terminas la frase con comodidad y dejas una referencia para el tutor.', tool: 'temporizador' },
    ],
  };
}
export function startSession(lesson: Lesson, now = new Date().toISOString()): Session {
  return { id: crypto.randomUUID(), lesson, status: 'en curso', index: 0, results: [], startedAt: now, updatedAt: now, completedAt: null, activeSeconds: 0, mood: 'bien' };
}
export function recordResult(s: Session, outcome: ExerciseResult['outcome'], note: string, now = new Date().toISOString()): Session {
  if (s.status !== 'en curso') throw new Error('Reanuda la sesión antes de registrar un resultado.');
  if (outcome === 'omitido' && !note.trim()) throw new Error('Escribe un motivo para omitir el ejercicio.');
  const exercise = s.lesson.exercises[s.index];
  const result: ExerciseResult = { exerciseId: exercise.id, exerciseVersion: exercise.version, outcome, note: note.trim(), source: 'autoevaluación', confidence: 'no determinada', timestamp: now };
  return { ...s, updatedAt: now, results: [...s.results.filter(r => r.exerciseId !== exercise.id), result], index: Math.min(s.index + 1, s.lesson.exercises.length - 1) };
}
export function finishSession(s: Session, now = new Date().toISOString()): Session {
  if (s.status !== 'en curso' || s.results.length !== s.lesson.exercises.length) throw new Error('Registra un resultado para cada ejercicio antes de finalizar.');
  return { ...s, status: 'completada', completedAt: now, updatedAt: now };
}
export function feedback(s: Session): string[] {
  const hard = s.results.find(r => r.outcome === 'dificultad');
  const repeat = s.results.find(r => r.outcome === 'necesita repetir');
  return [
    `Has registrado ${s.results.filter(r => r.outcome !== 'omitido').length} de ${s.lesson.exercises.length} ejercicios. Completar la clase no acredita dominio.`,
    s.mood === 'cansado' ? 'Propuesta: reducir la próxima carga porque registraste cansancio.' : hard ? `Propuesta: fragmentar «${s.lesson.exercises.find(e => e.id === hard.exerciseId)!.title}» porque registraste dificultad.` : repeat ? 'Propuesta: reforzar el ejercicio que marcaste «necesita repetir».' : 'Conserva estas referencias para una comparación futura; todavía no hay mediciones objetivas.',
    'Siguiente objetivo: revisar estas observaciones con el tutor antes de fijar metas técnicas.',
  ];
}
