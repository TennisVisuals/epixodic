import { browserStorage } from '../state/browserStorage';
import { setWindow } from './setWindow';
import { env } from '../state/env';

import 'bulma/css/bulma.css';
import 'animate.css/animate.css';
import 'courthive-components/dist/courthive-components.css';

export function setInitialState() {
  const provider = browserStorage.get('mobile-provider');
  if (provider) {
    env.provider = provider;
    const target: any = document.getElementById(`provider`);
    if (target) target.value = provider;
  }
  setWindow();
}
