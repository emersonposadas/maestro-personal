import { useState } from 'react';
import { instruments, type Session } from '../domain/model';
import { analyzeProgress } from '../domain/progress';

export function ProgressAnalysis({ sessions }: { sessions: Session[] }) {
  const [instrument, setInstrument] = useState<typeof instruments[number]>('Acordeón');
  const area = analyzeProgress(sessions).find(a => a.instrument === instrument)!;
  return <section className="card progress-analysis" aria-labelledby="analysis-title">
    <h2 id="analysis-title">Análisis por área</h2>
    <label>Área que quieres revisar<select value={instrument} onChange={e => setInstrument(e.target.value as typeof instrument)}>{instruments.map(i => <option key={i}>{i}</option>)}</select></label>
    <div aria-live="polite">
      <h3>{instrument}</h3>
      <p>{area.sessionCount === 0 ? 'Todavía no hay intentos registrados en esta área.' : area.sessionCount === 1 ? 'Punto de partida: una sesión con intentos registrados. Aún no permite valorar evolución.' : `${area.sessionCount} sesiones con intentos registrados. Podemos revisar tus observaciones; todavía no determinar una mejora técnica.`}</p>
      {area.skills.length > 0 && <p className="muted">{area.attempts} resultados de intentos · {area.omitted} omisiones. No son puntuaciones de nivel.</p>}
      {area.skills.map(skill => <article className="skill-progress" key={skill.key}>
        <h4>{skill.skill}</h4><p><strong>{skill.status}</strong></p><p>{skill.suggestion}</p>
        <details><summary>Evidencias y evolución de tus observaciones</summary>
          <p>{skill.title} · versión {skill.version}. Cada resultado es una autoevaluación con confianza no determinada.</p>
          <ol>{skill.observations.map(o => <li key={o.sessionId}><strong>{o.date} · {o.result.outcome}</strong>{o.partial && <span> · sesión parcial</span>}<p>{o.result.note || 'Sin observación adicional.'}</p></li>)}</ol>
          <p className="muted">Compartir ejercicio y versión no garantiza las mismas condiciones. No están verificados el tempo, la frase interpretada ni el entorno; estos cambios de autoevaluación no equivalen a una medición de progreso.</p>
        </details>
      </article>)}
      <details><summary>Qué falta para evaluar el progreso técnico</summary><p>Se necesitan referencias comparables, con el mismo ejercicio, versión, tempo y condiciones, y evidencias revisadas por el tutor.</p>
        <p>{instrument === 'Acordeón' ? 'Pendiente: precisión de notas, estabilidad del pulso, control del fuelle, digitación y coordinación con el canto.' : instrument === 'Bajo quinto' ? 'Pendiente: limpieza de acordes, continuidad de los cambios, pulso y técnica de púa.' : 'Pendiente: afinación, respiración, fraseo y coordinación con el instrumento.'}</p>
        <p>Esta versión no registra BPM, recuentos de errores ni mediciones de afinación. Tampoco atribuye el tiempo total de la clase a un instrumento concreto.</p>
      </details>
    </div>
  </section>;
}
