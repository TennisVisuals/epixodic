import type { DecorationProfile } from './types';

const profiles = new Map<string, DecorationProfile>();

export function registerProfile(profile: DecorationProfile): void {
  profiles.set(profile.id, profile);
}

export function getProfile(id: string): DecorationProfile | undefined {
  return profiles.get(id);
}

export function getProfileIds(): string[] {
  return Array.from(profiles.keys());
}

export function getProfiles(): DecorationProfile[] {
  return Array.from(profiles.values());
}
