import { browserStorage } from '../state/browserStorage';
import { showModal } from '../utils/utilities';
import { device } from './env';

export function modalExport(match_id: any) {
  match_id = match_id || browserStorage.get('current_match');
  Array.from(document.querySelectorAll('.mh_export')).forEach((selector: any) => (selector.style.display = 'none'));
  const match_data = browserStorage.get(match_id);
  const header = `
   <p>&nbsp;</p>
   <h1>Export Options</h1>
   <p>Supported by your device</p>
`;
  const save = `
   <div matchId="${match_id}" class="exportMatch flexcenter">
      <div matchId="${match_id}" class='exportMatch export_action action_icon iconsave'></div>
   </div>
`;
  const copy = `
   <div class="flexcenter">
      <button id='copy2clipboard' class="flexcenter c2c" data-clipboard-text=""> 
         <div class='export_action action_icon iconclipboard'></div> 
      </button>
   </div> 
`;
  const modaltext = `<div>${header}<div class="flexrows flexcenter">${
    !device.isIDevice ? save : ''
  }${copy}</div></div>`;
  const export_data = match_data;
  showModal(modaltext, export_data);
}
