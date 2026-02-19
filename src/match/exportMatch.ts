import { browserStorage } from '../state/browserStorage';
import { closeModal } from '../modals/modals';

export function exportMatch(element: any) {
  const match_id = element.getAttribute('matchId');
  const match_data: any = browserStorage.get(match_id);
  if (match_data) {
    download(match_data, `match_${match_id}.json`);
    closeModal();
  }
}

function download(textToWrite: string, fileNameToSaveAs: string) {
  fileNameToSaveAs = fileNameToSaveAs || 'match.json';
  const textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
  const downloadLink = document.createElement('a');
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = 'Download File';
  if (window.URL != null) {
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.click();
  }
}
