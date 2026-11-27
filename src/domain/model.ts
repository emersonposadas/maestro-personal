import { z } from 'zod';

export const instruments = ['Acordeón', 'Bajo quinto', 'Canto'] as const;
export const outcomes = ['conseguido', 'necesita repetir', 'dificultad', 'omitido'] as const;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
export const profileSchema = z.object({
  age: z.number().int().min(1).max(120), goal: z.string().min(1).max(500),
  accordion: z.string().min(1).max(200), bassMonths: z.number().int().min(0).max(1200),
  timezone: z.string().refine(v => { try { new Intl.DateTimeFormat('es', { timeZone: v }); return true; } catch { return false; } }),
  diagnosis: z.literal('pendiente'), buttonMap: z.literal('pendiente'), quietHours: z.literal('pendiente'),
});
export type StudentProfile = z.infer<typeof profileSchema>;
export const initialProfile: StudentProfile = {
  age: 47, goal: 'Asumir el puesto de acordeonista y primera voz de mi agrupación norteña.',
  accordion: 'Hohner Corona II Fa–Sib–Mib', bassMonths: 9, timezone: 'Europe/Berlin',
  diagnosis: 'pendiente', buttonMap: 'pendiente', quietHours: 'pendiente',
};
export const exerciseSchema = z.object({
  id: z.string().min(1).max(100), version: z.number().int().positive(), instrument: z.enum(instruments),
  skill: z.string().min(1).max(500), title: z.string().min(1).max(200), why: z.string().min(1).max(1000),
  steps: z.array(z.string().min(1).max(1000)).min(1).max(20), minutes: z.number().positive().max(60),
  success: z.string().min(1).max(1000), tool: z.literal('temporizador'),
});
export const lessonSchema = z.object({
  id: z.string().min(1).max(100), date: isoDate, level: z.literal('diagnóstico pendiente'),
  objective: z.string().min(1).max(1000), activeMinutes: z.number().positive().max(180),
  breakMinutes: z.number().min(0).max(60), exercises: z.array(exerciseSchema).min(1).max(30),
  completion: z.string().min(1).max(1000),
}).refine(l => new Set(l.exercises.map(e => e.id)).size === l.exercises.length && l.activeMinutes === l.exercises.reduce((s, e) => s + e.minutes, 0), 'Ejercicios duplicados o duración inconsistente');
export type Lesson = z.infer<typeof lessonSchema>;
const resultSchema = z.object({
  exerciseId: z.string(), exerciseVersion: z.number().int().positive(), outcome: z.enum(outcomes),
  note: z.string().max(1000), source: z.literal('autoevaluación'),
  confidence: z.literal('no determinada'), timestamp: z.string().datetime(),
}).refine(r => r.outcome !== 'omitido' || r.note.trim().length > 0, 'Indica el motivo de la omisión');
export const sessionSchema = z.object({
  id: z.string().min(1), lesson: lessonSchema,
  status: z.enum(['en curso', 'pausada', 'completada']), index: z.number().int().min(0),
  results: z.array(resultSchema).max(30), startedAt: z.string().datetime(), updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(), activeSeconds: z.number().min(0).max(1e8),
  mood: z.enum(['bien', 'cansado', 'dificultades']),
}).superRefine((s, ctx) => {
  const ids = new Set(s.results.map(r => r.exerciseId));
  if (s.index >= s.lesson.exercises.length || ids.size !== s.results.length || s.results.some(r => !s.lesson.exercises.some(e => e.id === r.exerciseId && e.version === r.exerciseVersion)) || (s.status === 'completada' && (ids.size !== s.lesson.exercises.length || !s.completedAt)) || (s.status !== 'completada' && s.completedAt !== null)) ctx.addIssue({ code: 'custom', message: 'Sesión inconsistente' });
});
export type Session = z.infer<typeof sessionSchema>;
export type ExerciseResult = z.infer<typeof resultSchema>;
export const dataSchema = z.object({
  schemaVersion: z.literal(1), recordings: z.literal('excluidas; no disponibles en este incremento'),
  profile: profileSchema, sessions: z.array(sessionSchema).max(5000),
}).refine(d => new Set(d.sessions.map(s => s.id)).size === d.sessions.length && d.sessions.filter(s => s.status !== 'completada').length <= 1, 'Sesiones duplicadas o varias sesiones abiertas');
export type AppData = z.infer<typeof dataSchema>;
export const emptyData = (): AppData => ({ schemaVersion: 1, recordings: 'excluidas; no disponibles en este incremento', profile: { ...initialProfile }, sessions: [] });
export function dateInZone(timezone: string, date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)!.value).join('-');
}
