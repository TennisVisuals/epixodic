import { browserStorage } from '../transition/browserStorage';
import { setWindow } from './setWindow';
import { env } from '../transition/env';
import { version } from './version';

import 'bulma/css/bulma.css';
import 'animate.css/animate.css';

export function setInitialState() {
  console.log(`%cversion: ${version}`, 'color: lightblue');
  const provider = browserStorage.get('mobile-provider');
  if (provider) {
    env.provider = provider;
    const target: any = document.getElementById(`provider`);
    if (target) target.value = provider;
  }
  setWindow();
}
