import { env, updateMatchArchive } from './env';
import { updateScore } from './displayUpdate';
import { viewManager } from './viewManager';
import { findUpClass } from './utilities';
import { getFormatName } from '../services/matchObject/formatMigration';
import matchObject from '@tennisvisuals/universal-match-object';

export function changeFormat(element: Element) {
  const selectionContainer = findUpClass(element, 'mf_format');
  if (selectionContainer) {
    const selectedFormat = selectionContainer.getAttribute('newFormat');
    
    if (!selectedFormat) return;
    
    const pointsPlayed = env.match.history.points().length;
    
    if (pointsPlayed === 0) {
      // No points played - create new match with new format (UMO v3)
      env.match = matchObject.Match({ matchUpFormat: selectedFormat });
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
