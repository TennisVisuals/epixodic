import { env, updateMatchArchive } from './env';
import { updateScore } from './displayUpdate';
import { viewManager } from './viewManager';
import { findUpClass } from './utilities';
import { getFormatName } from '../services/matchObject/formatMigration';

export function changeFormat(element: Element) {
  const selectionContainer = findUpClass(element, 'mf_format');
  if (selectionContainer) {
    const selectedFormat = selectionContainer.getAttribute('newFormat');
    
    if (!selectedFormat) return;
    
    const pointsPlayed = env.match.history.points().length;
    
    if (pointsPlayed === 0) {
      // No points played - rebuild match with new format
      const players = env.match.metadata.players();
      
      // Prevent updateMatchArchive from triggering during rebuild
      const wasLoading = env.loading_match;
      env.loading_match = true;
      
      try {
        // Reset and rebuild with new format
        env.match.reset();
        env.match.format.changeFormat(selectedFormat);
        
        // Restore players
        players.forEach((player: any, index: number) => {
          env.match.metadata.definePlayer({ 
            index, 
            ...player 
          });
        });
      } finally {
        // Restore loading_match flag
        env.loading_match = wasLoading;
      }
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
