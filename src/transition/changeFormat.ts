import { env, updateMatchArchive, resetEngine } from './env';
import { updateScore } from './displayUpdate';
import { viewManager } from './viewManager';
import { findUpClass } from '../utils/utilities';
import { getFormatName } from '../services/matchObject/formatMigration';

export function changeFormat(element: Element) {
  const selectionContainer = findUpClass(element, 'mf_format');
  if (selectionContainer) {
    const selectedFormat = selectionContainer.getAttribute('newFormat');

    if (!selectedFormat) return;

    const pointsPlayed = (env.engine.getState().history?.points || []).length;

    if (pointsPlayed === 0) {
      console.log('[HVE] changeFormat creating new engine with format:', selectedFormat);
      resetEngine(selectedFormat);
    } else {
      // Points already played - format change mid-match not supported
      console.warn('[HVE] Format change mid-match not supported with ScoringEngine');
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
