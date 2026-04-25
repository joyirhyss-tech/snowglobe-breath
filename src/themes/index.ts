import type { Theme } from './types';
import { silver } from './silver';
import { gold } from './gold';
import { snow } from './snow';
import { rainbow } from './rainbow';

export const THEMES: Theme[] = [silver, gold, snow, rainbow];

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

// First session defaults to silver for brand consistency; later sessions randomize.
export function pickTheme(isFirst: boolean, lastId?: string): Theme {
  if (isFirst) return silver;
  const pool = THEMES.filter((t) => t.id !== lastId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export type { Theme };
