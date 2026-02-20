import { registerSkin, getSkin, getRegisteredSkinIds, getRegisteredSkins } from './registry';
import { VBlackSkin } from './skins/vblack';
import { HBlackSkin } from './skins/hblack';

export type { ScoringSkin } from './types';
export { registerSkin, getSkin, getRegisteredSkinIds, getRegisteredSkins };

export function registerDefaultSkins(): void {
  registerSkin(new VBlackSkin());
  registerSkin(new HBlackSkin());
}
