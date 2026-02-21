import { cModal } from 'courthive-components';
import { version } from '../config/version';

export function modalInfo() {
  const content = (elem: HTMLElement) => {
    elem.innerHTML = `
      <p>&nbsp;</p>
      <h2>Epixodic</h2>
      <p>version <a id="version" target="_blank">${version}</a></p>
      <div class="helpitem">Difficulties after an app update?</div>
      <div class="flexcenter">
        <div class='flexcenter reset' onclick="appReset()">Reset</div>
      </div>
      <p>&nbsp;</p>
    `;
  };

  cModal.open({
    title: 'About',
    content,
    config: { clickAway: false },
    buttons: [{ label: 'Close', intent: 'is-info', close: true }],
  });
}
