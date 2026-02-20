import type { ScoringSkin } from './types';

const skins = new Map<string, ScoringSkin>();

export function registerSkin(skin: ScoringSkin): void {
  skins.set(skin.id, skin);
}

export function getSkin(id: string): ScoringSkin | undefined {
  return skins.get(id);
}

export function getRegisteredSkinIds(orientation?: 'vertical' | 'horizontal'): string[] {
  if (!orientation) return Array.from(skins.keys());
  return Array.from(skins.values())
    .filter((s) => s.orientation === orientation)
    .map((s) => s.id);
}

export function getRegisteredSkins(orientation?: 'vertical' | 'horizontal'): ScoringSkin[] {
  const all = Array.from(skins.values());
  if (!orientation) return all;
  return all.filter((s) => s.orientation === orientation);
}
