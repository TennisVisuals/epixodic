import { env, updateMatchArchive } from './env';
import { updateScore } from './displayUpdate';
import { viewManager } from './viewManager';
import { findUpClass } from './utilities';
import { getFormatName } from '../services/matchObject/formatMigration';
// Use v3 UMO - v4 testing done via env.matchUp shadow
import matchObject from '@tennisvisuals/universal-match-object';

export function changeFormat(element: Element) {
  const selectionContainer = findUpClass(element, 'mf_format');
  if (selectionContainer) {
    const selectedFormat = selectionContainer.getAttribute('newFormat');

    if (!selectedFormat) return;

    const pointsPlayed = env.match.history.points().length;

    if (pointsPlayed === 0) {
      console.log('[HVE] changeFormat creating new v3 match with format:', selectedFormat);
      env.match = matchObject.Match({ matchUpFormat: selectedFormat });
      // TODO: Also create v4 matchUp when we need parallel testing
      // env.matchUp = MatchV4({ matchUpFormat: selectedFormat });
    } else {
      // Points already played - just update format code
      env.match.format.changeFormat(selectedFormat);
    }

    // Update UI with format name
    const format_name = getFormatName(selectedFormat);
    const matchFormat = document.getElementById('md_format');
    if (matchFormat) {
      matchFormat.innerHTML = format_name;
      const matchDescription = document.getElementById('match_description');
      if (matchDescription) matchDescription.innerHTML = format_name;
    }

    // Trigger save and update display
    updateMatchArchive();
    updateScore();
    viewManager('entry');
  }
}
