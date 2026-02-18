import { env, updateMatchArchive } from './env';

export function updateMatchDetails() {
  const match_details = {};
  const attributes = ['court', 'umpire'];
  attributes.forEach((attribute) => {
    const target: any = document.getElementById(`match_${attribute}`);
    const value = target.value;
    if (value) match_details[attribute] = value;
  });
  Object.assign(env.metadata.match, match_details);
  updateMatchArchive();
}
