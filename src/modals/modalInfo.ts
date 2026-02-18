import { version } from '../config/version';
import { showModal } from '../utils/utilities';

export function modalInfo() {
  const modaltext = `
         <p>&nbsp;</b>
         <h2>CourtHive</h2>
         <p>version <a id="version" target="_blank" href="https://github.com/TennisVisuals/universal-match-object/tree/master/examples/CourtHive">${version}</a></p>
         <p>An 
            <a target="_blank" href="https://github.com/TennisVisuals/universal-match-object/tree/master/examples/CourtHive">Open Source</a> project developed by 
            <a target="_blank" href="http://TennisVisuals.com">TennisVisuals</a>
         </p>
         <p><a href="mailto:tennis.aip@gmail.com?subject=CourtHive">Feedback Welcome!</a></p>
         <h2>Help</h2>
         <div class="helpitem">Difficulties after an app update?</div>
         <div class="flexcenter">
            <div class='flexcenter reset' onclick="appReset()">Reset</div>
         </div>
         <p>&nbsp;</b>
      `;
  showModal(modaltext);
}
