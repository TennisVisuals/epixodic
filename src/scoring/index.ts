import { registerSkin, getSkin, getRegisteredSkinIds, getRegisteredSkins } from './registry';
import { VBlackSkin } from './skins/vblack';
import { HBlackSkin } from './skins/hblack';
import { HHexSkin } from './skins/hhex';

export type { ScoringSkin } from './types';
export { registerSkin, getSkin, getRegisteredSkinIds, getRegisteredSkins };

export function registerDefaultSkins(): void {
  registerSkin(new VBlackSkin());
  registerSkin(new HBlackSkin());
  registerSkin(new HHexSkin());
}
