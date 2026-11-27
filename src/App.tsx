import { useEffect, useRef, useState } from 'react';
import { dateInZone, outcomes, profileSchema, type AppData, type Session, type StudentProfile } from './domain/model';
import { feedback, finishSession, initialLesson, recordResult, startSession } from './domain/lesson';
import { baseWeek, weeklyTotals } from './domain/planning';
import { loadData, mergeBackup, parseBackup, saveData, serializeBackup } from './storage/repository';

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
export function App() {
  const [data, setData] = useState<AppData>();
  const [tab, setTab] = useState('Clase');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [pending, setPending] = useState<AppData>();
  const [showLesson, setShowLesson] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const segment = useRef<number | null>(null);
  const [summary, setSummary] = useState<Session>();
  useEffect(() => { loadData().then(setData).catch(() => setError('No se pudieron leer tus datos locales. No se ha sobrescrito nada. Comprueba que el navegador permita IndexedDB y vuelve a cargar.')); }, []);
  const active = data?.sessions.find(s => s.status !== 'completada');
  const running = showLesson && tab === 'Clase' && active?.status === 'en curso';
  useEffect(() => {
    if (!running) return;
    segment.current = performance.now();
    const timer = window.setInterval(() => setElapsed((performance.now() - segment.current!) / 1000), 500);
    return () => { clearInterval(timer); segment.current = null; setElapsed(0); };
  }, [running, active?.updatedAt]);
  async function commit(next: AppData): Promise<boolean> {
    if (saving.current) return false;
    saving.current = true; setBusy(true); setError(''); setNotice('');
    try { await saveData(next); setData(next); return true; }
    catch { setError('No se pudo guardar. Tu último guardado permanece intacto. Libera espacio y vuelve a intentarlo antes de salir.'); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  function timed(s: Session): Session {
    return { ...s, activeSeconds: s.activeSeconds + (segment.current === null ? 0 : (performance.now() - segment.current) / 1000), updatedAt: new Date().toISOString() };
  }
  async function update(s: Session) { return commit({ ...data!, sessions: data!.sessions.map(old => old.id === s.id ? s : old) }); }
  async function navigate(next: string) {
    if (active && running && !await update({ ...timed(active), status: 'pausada' })) return;
    setShowLesson(false); setTab(next); setSummary(undefined);
  }
  if (!data) return <main><h1>Maestro Personal</h1><p role={error ? 'alert' : 'status'}>{error || 'Abriendo tu clase…'}</p></main>;
  const lesson = active?.lesson ?? initialLesson(dateInZone(data.profile.timezone));
  const completed = data.sessions.filter(s => s.status === 'completada');
  return <div className="app">
    <header><a className="brand" href="#main" onClick={e => { e.preventDefault(); void navigate('Clase'); }}><span className="brand-icon" aria-hidden="true">♫</span><span>Maestro Personal<small>MÚSICA NORTEÑA · TU ESPACIO DE PRÁCTICA</small></span></a><span className="local">Guardado en este dispositivo</span></header>
    <nav aria-label="Principal">{['Clase', 'Calendario', 'Progreso'].map(name => <button disabled={busy} aria-current={tab === name ? 'page' : undefined} key={name} onClick={() => void navigate(name)}>{name}</button>)}</nav>
    <main id="main">
      {error && <p className="alert" role="alert">{error}</p>}{notice && <p role="status" className="notice">{notice}</p>}
      <fieldset disabled={busy} className="workspace">
      {tab === 'Clase' && (summary ? <section className="card"><p className="eyebrow">CLASE GUARDADA</p><h1>Un primer paso para conocerte.</h1>{feedback(summary).map(t => <p key={t}>{t}</p>)}<button className="primary" onClick={() => void navigate('Progreso')}>Ver mi registro</button></section> : showLesson && active ? active.status === 'pausada' ? <section className="card"><p className="eyebrow">A TU RITMO</p><h1>Tu clase está en pausa.</h1><p>Descansa cuando lo necesites. Tus resultados están guardados.</p><p>La clase prevé 2 minutos de pausa; puedes tomar más.</p><button className="primary" onClick={() => void update({ ...active, status: 'en curso', updatedAt: new Date().toISOString() })}>Reanudar</button></section> : <ExerciseView key={`${active.id}-${active.index}`} session={active} elapsed={active.activeSeconds + elapsed}
        onPause={() => void update({ ...timed(active), status: 'pausada' })}
        onBack={() => void update({ ...timed(active), index: Math.max(0, active.index - 1) })}
        onNext={async (outcome, note, mood) => {
          try {
            let next = recordResult({ ...timed(active), mood }, outcome, note);
            const last = active.index === active.lesson.exercises.length - 1;
            if (last) next = finishSession(next);
            if (await update(next) && last) { setSummary(next); setShowLesson(false); }
          } catch (err) { setError((err as Error).message); }
        }} /> : <>
          <p className="eyebrow">TU CLASE · {new Intl.DateTimeFormat('es', { dateStyle: 'long', timeZone: data.profile.timezone }).format(new Date())}</p>
          <section className="card hero"><span className="badge">{active ? 'Clase pendiente de finalizar' : completed.length ? 'Pendiente de revisión del tutor' : 'Primera clase · evaluación inicial'}</span>
          <h1>{completed.length && !active ? 'Ya tenemos un punto de partida.' : 'Primero, vamos a escucharte.'}</h1>
          <p className="lead">{completed.length && !active ? 'Tus observaciones están guardadas. Revisa el registro con tu tutor para definir la siguiente clase.' : lesson.objective}</p>
          {(!completed.length || active) && <><p className="duration"><strong>{lesson.activeMinutes} min</strong> de práctica <span>+ {lesson.breakMinutes} min de pausa</span></p><p>Acordeón · Bajo quinto · Canto</p>
          <button className="primary" onClick={async () => { if (active) { if (await update({ ...active, status: 'en curso', updatedAt: new Date().toISOString() })) setShowLesson(true); } else if (await commit({ ...data, sessions: [...data.sessions, startSession(lesson)] })) setShowLesson(true); }}>{active ? 'Continuar clase' : 'Comenzar clase'}</button>
          <details><summary>Qué vamos a observar</summary><p>{lesson.completion}</p><p>No necesitas grabar ni activar el micrófono. «Conseguido» significa cumplir el criterio de observación, no dominar el instrumento.</p></details></>}
          {completed.length > 0 && !active && <button className="primary" onClick={() => void navigate('Progreso')}>Consultar mi registro</button>}</section>
          <details className="settings"><summary>Mi perfil y ajustes</summary><ProfileForm profile={data.profile} onSave={async profile => { if (await commit({ ...data, profile })) setNotice('Perfil guardado.'); }} /></details>
        </>)}
      {tab === 'Calendario' && <><p className="eyebrow">RITMO SEMANAL</p><h1>Un plan que parte de ti.</h1><p>Referencia inicial: {weeklyTotals().total} minutos activos por semana. La clase de diagnóstico es una sesión reducida de 12 minutos.</p><section className="card"><div className="table-wrap"><table><caption>Calendario base · minutos activos</caption><thead><tr><th>Día</th><th>Acordeón</th><th>Bajo quinto</th><th>Canto</th><th>Total</th></tr></thead><tbody>{baseWeek.map(d => <tr key={d.day}><th scope="row">{d.day}</th><td>{d.accordion}</td><td>{d.bass}</td><td>{d.voice}</td><td>{d.accordion + d.bass + d.voice}</td></tr>)}</tbody></table></div></section><p className="muted">Referencia sin asignación de horarios. La edición del calendario, los ensayos y el ajuste a disponibilidad se implementarán en el siguiente incremento. Las horas de silencio siguen pendientes; no hay sesiones automáticas ni deuda de estudio.</p></>}
      {tab === 'Progreso' && <><p className="eyebrow">TU RECORRIDO</p><h1>Lo que vas descubriendo.</h1><p>Autoevaluaciones personales. Diagnóstico técnico pendiente; aún no hay mediciones acústicas ni revisión del tutor.</p>{!data.sessions.length && <section className="card"><h2>Tu historia empieza con una clase.</h2><p>Cuando practiques, aquí aparecerán tus resultados reales.</p><button onClick={() => void navigate('Clase')}>Ir a mi clase</button></section>}{data.sessions.map(s => <section className="card history" key={s.id}><p className="eyebrow">{s.lesson.date} · {s.status}</p><h2>{s.lesson.objective}</h2><p>{clock(s.activeSeconds)} de tiempo registrado en pantalla · {s.lesson.activeMinutes} min previstos. No acredita práctica efectiva.</p>{s.results.map(r => <details key={r.exerciseId}><summary>{s.lesson.exercises.find(e => e.id === r.exerciseId)!.instrument}: {r.outcome}</summary><p>{r.note || 'Sin observación adicional.'}</p><small>Autoevaluación · confianza no determinada · sin medición objetiva</small></details>)}{s.status === 'completada' && <details><summary>Propuesta para revisar con el tutor</summary>{feedback(s).map(t => <p key={t}>{t}</p>)}</details>}</section>)}
      <details className="settings"><summary>Exportar o importar un registro</summary><p>La copia contiene tu perfil, clases y resultados. No incluye grabaciones. Tus datos son locales: el navegador puede perderlos y no se sincronizan entre dispositivos.</p><button onClick={() => { const url = URL.createObjectURL(new Blob([serializeBackup(data)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `maestro-personal-${dateInZone(data.profile.timezone)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Exportar copia JSON</button><label>Seleccionar copia JSON<input type="file" accept=".json,application/json" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; setPending(undefined); if (!file) return; try { if (file.size > 10_000_000) throw new Error(); setPending(parseBackup(await file.text())); setError(''); } catch { setError('Copia no válida o incompatible. No se ha cambiado ningún dato.'); } }} /></label>
      {pending && <div className="notice"><p>Copia válida: {pending.sessions.length} sesiones. Se añadirán las nuevas y se conservará tu perfil actual. Los conflictos se rechazan sin sobrescribir.</p><button onClick={async () => { try { const merged = mergeBackup(data, pending); if (await commit(merged)) { setPending(undefined); setNotice('Importación terminada. No se han duplicado sesiones.'); } } catch (err) { setError((err as Error).message); } }}>Importar sesiones</button><button onClick={() => setPending(undefined)}>Cancelar</button></div>}</details></>}
      </fieldset>
    </main><footer>Un ejercicio a la vez. A tu ritmo.<span>Fase 1A · primer incremento</span></footer>
  </div>;
}
function ExerciseView({ session, elapsed, onPause, onBack, onNext }: { session: Session; elapsed: number; onPause: () => void; onBack: () => void; onNext: (outcome: typeof outcomes[number], note: string, mood: Session['mood']) => Promise<void> }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const exercise = session.lesson.exercises[session.index];
  const previous = session.results.find(r => r.exerciseId === exercise.id);
  const [outcome, setOutcome] = useState<typeof outcomes[number] | ''>(previous?.outcome ?? '');
  const [note, setNote] = useState(previous?.note ?? '');
  const [mood, setMood] = useState(session.mood);
  const last = session.index === session.lesson.exercises.length - 1;
  return <section className="card"><div className="exercise-top"><p className="eyebrow">{exercise.instrument} · {session.index + 1} DE {session.lesson.exercises.length}</p><button onClick={onPause}>Pausar</button></div><h1 tabIndex={-1} ref={heading}>{exercise.title}</h1><p>{exercise.why}</p><p className="duration">{exercise.minutes} min previstos <span>· Sesión: {clock(elapsed)}</span></p><ol>{exercise.steps.map(step => <li key={step}>{step}</li>)}</ol><aside><strong>Lo que buscamos</strong><p>{exercise.success}</p></aside><form onSubmit={e => { e.preventDefault(); if (outcome) void onNext(outcome, note, mood); }}><fieldset><legend>¿Cómo te fue?</legend><div className="outcomes">{outcomes.map(o => <label key={o}><input type="radio" name="outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} required />{o.charAt(0).toUpperCase() + o.slice(1)}</label>)}</div></fieldset><label>{outcome === 'omitido' ? 'Motivo de la omisión' : 'Observación (opcional)'}<textarea value={note} maxLength={1000} required={outcome === 'omitido'} onChange={e => setNote(e.target.value)} rows={2} /></label>{last && <label>¿Cómo te encuentras?<select value={mood} onChange={e => setMood(e.target.value as Session['mood'])}><option value="bien">Bien</option><option value="cansado">Cansado</option><option value="dificultades">Con dificultades</option></select></label>}<div className="actions">{session.index > 0 && <button type="button" onClick={onBack}>Volver</button>}<button className="primary" type="submit" disabled={!outcome || (outcome === 'omitido' && !note.trim())}>{last ? 'Finalizar clase' : 'Siguiente'}</button></div><p className="muted">Puedes repetir este ejercicio antes de avanzar. Guardamos tu resultado al pulsar {last ? 'Finalizar clase' : 'Siguiente'}.</p></form></section>;
}
function ProfileForm({ profile, onSave }: { profile: StudentProfile; onSave: (p: StudentProfile) => Promise<void> }) {
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState('');
  return <form onSubmit={e => { e.preventDefault(); const parsed = profileSchema.safeParse(draft); if (!parsed.success) setError('Revisa los datos y utiliza una zona horaria válida, como Europe/Berlin.'); else { setError(''); void onSave(parsed.data); } }}>
    <label>Edad<input type="number" min="1" max="120" required value={draft.age} onChange={e => setDraft({ ...draft, age: Number(e.target.value) })} /></label>
    <label>Mi objetivo<textarea required maxLength={500} value={draft.goal} onChange={e => setDraft({ ...draft, goal: e.target.value })} /></label>
    <label>Acordeón<input required maxLength={200} value={draft.accordion} onChange={e => setDraft({ ...draft, accordion: e.target.value })} /></label>
    <label>Meses de experiencia con bajo quinto<input type="number" min="0" max="1200" required value={draft.bassMonths} onChange={e => setDraft({ ...draft, bassMonths: Number(e.target.value) })} /></label>
    <label>Zona horaria<input required value={draft.timezone} onChange={e => setDraft({ ...draft, timezone: e.target.value })} /></label><p>Diagnóstico, mapa de botones y horas de silencio: pendientes de confirmar.</p>{error && <p role="alert">{error}</p>}<button type="submit">Guardar perfil</button>
  </form>;
}
