import { registerProfile, getProfile, getProfileIds, getProfiles } from './registry';
import { STANDARD_PROFILE, INTENNSE_PROFILE } from './profiles';

export type { DecorationProfile, StrokeDecoration, StrokeContext } from './types';
export { resultToContext } from './types';
export { registerProfile, getProfile, getProfileIds, getProfiles };

export function registerDefaultProfiles(): void {
  registerProfile(STANDARD_PROFILE);
  registerProfile(INTENNSE_PROFILE);
}
