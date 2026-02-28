import { browserStorage } from './browserStorage';

let currentMatchUpId: string | null = null;

export function getCurrentMatchUpId(): string | null {
  return currentMatchUpId;
}

export function setCurrentMatchUpId(id: string | null): void {
  currentMatchUpId = id;
  if (id) {
    browserStorage.set('current_match', id);
  }
}

export function isMatchLoaded(id: string): boolean {
  return currentMatchUpId === id;
}
