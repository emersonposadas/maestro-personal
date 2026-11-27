import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { emptyData } from '../src/domain/model';
import { initialLesson, startSession, recordResult } from '../src/domain/lesson';
import { loadData, saveData } from '../src/storage/repository';
it('recupera una sesión pausada y sus resultados desde IndexedDB', async () => {
  const s = recordResult(startSession(initialLesson('2026-11-27')), 'necesita repetir', 'Sin experiencia');
  const data = { ...emptyData(), sessions: [{ ...s, status: 'pausada' as const }] };
  await saveData(data);
  expect(await loadData()).toEqual(data);
  await saveData(data);
  expect((await loadData()).sessions).toHaveLength(1);
});
