import { version } from '../config/version';
import { showModal } from '../utils/utilities';

export function modalInfo() {
  const modaltext = `
         <p>&nbsp;</b>
         <h2>Epixodic</h2>
         <p>version <a id="version" target="_blank">${version}</a></p>
         <div class="helpitem">Difficulties after an app update?</div>
         <div class="flexcenter">
            <div class='flexcenter reset' onclick="appReset()">Reset</div>
         </div>
         <p>&nbsp;</b>
      `;
  showModal(modaltext);
}
