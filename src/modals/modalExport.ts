import { browserStorage } from '../state/browserStorage';
import { cModal } from 'courthive-components';
import { device } from '../state/env';

export function modalExport(match_id: any) {
  match_id = match_id || browserStorage.get('current_match');
  Array.from(document.querySelectorAll('.mh_export')).forEach((selector: any) => (selector.style.display = 'none'));
  const match_data = browserStorage.get(match_id);

  const content = (elem: HTMLElement) => {
    elem.innerHTML = `
      <p>&nbsp;</p>
      <h1>Export Options</h1>
      <p>Supported by your device</p>
      <div class="flexrows flexcenter">
        ${!device.isIDevice ? `<div matchId="${match_id}" class="exportMatch flexcenter"><div matchId="${match_id}" class='exportMatch export_action action_icon iconsave'></div></div>` : ''}
        <div class="flexcenter">
          <button id='copy2clipboard' class="flexcenter c2c" data-clipboard-text="${match_data || ''}">
            <div class='export_action action_icon iconclipboard'></div>
          </button>
        </div>
      </div>
    `;
  };

  cModal.open({
    title: 'Export',
    content,
    config: { clickAway: false },
    buttons: [{ label: 'Close', intent: 'is-info', close: true }],
  });
}
