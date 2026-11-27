import { openDB } from 'idb';
import { dataSchema, emptyData, type AppData } from '../domain/model';
const database = () => openDB('maestro-personal', 1, { upgrade(db) { db.createObjectStore('app'); } });
export async function loadData(): Promise<AppData> {
  const db = await database();
  try { const data = await db.get('app', 'state'); return data === undefined ? emptyData() : dataSchema.parse(data); }
  finally { db.close(); }
}
export async function saveData(data: AppData): Promise<void> {
  const validated = dataSchema.parse(data);
  const db = await database();
  try { await db.put('app', validated, 'state'); } finally { db.close(); }
}
export function parseBackup(text: string): AppData {
  if (text.length > 10_000_000) throw new Error('La copia supera el límite de 10 MB.');
  return dataSchema.parse(JSON.parse(text));
}
export function serializeBackup(data: AppData): string { return JSON.stringify(dataSchema.parse(data), null, 2); }
// Importación aditiva: preserva perfil local y rechaza conflictos sin sobrescribir.
export function mergeBackup(current: AppData, incoming: AppData): AppData {
  const sessions = [...current.sessions];
  for (const session of incoming.sessions) {
    const existing = sessions.find(s => s.id === session.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(session)) throw new Error('La copia contiene una sesión modificada con el mismo identificador. No se ha importado nada.');
    if (!existing) sessions.push(session);
  }
  return dataSchema.parse({ ...current, sessions });
}
