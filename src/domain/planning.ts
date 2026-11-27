// Orden ISO: lunes a domingo. Minutos activos; no incluye pausas ni ensayos.
export const baseWeek = [
  { day: 'Lunes', accordion: 60, bass: 20, voice: 10 },
  { day: 'Martes', accordion: 60, bass: 20, voice: 10 },
  { day: 'Miércoles', accordion: 60, bass: 20, voice: 10 },
  { day: 'Jueves', accordion: 120, bass: 45, voice: 15 },
  { day: 'Viernes', accordion: 120, bass: 45, voice: 15 },
  { day: 'Sábado', accordion: 120, bass: 45, voice: 15 },
  { day: 'Domingo', accordion: 60, bass: 30, voice: 15 },
];
export function weeklyTotals(week = baseWeek) {
  return week.reduce((a, d) => ({ accordion: a.accordion + d.accordion, bass: a.bass + d.bass, voice: a.voice + d.voice, total: a.total + d.accordion + d.bass + d.voice }), { accordion: 0, bass: 0, voice: 0, total: 0 });
}
