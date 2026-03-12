import { browserStorage } from '../state/browserStorage';
import { setWindow } from './setWindow';
import { env } from '../state/env';

import 'courthive-components/dist/courthive-components.css';

function initTheme() {
  const saved = browserStorage.get('theme');
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.dataset.theme = saved;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }

  // Auto-switch when OS preference changes (only if no explicit user preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!browserStorage.get('theme')) {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    }
  });
}

export function setInitialState() {
  initTheme();

  const provider = browserStorage.get('mobile-provider');
  if (provider) {
    env.provider = provider;
    const target: any = document.getElementById(`provider`);
    if (target) target.value = provider;
  }
  setWindow();
}
