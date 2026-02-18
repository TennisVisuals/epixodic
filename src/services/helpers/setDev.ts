import { viewManager } from '../../display/viewManager';
import { submitCredentials } from '../messaging/authApi';
import { app, env } from '../../state/env';
import { version } from '../../config/version';
import { logOut } from '../auth/loginState';

export function setDev() {
  window['dev'] = {
    submitCredentials,
    viewManager,
    version,
    logOut,
    app,
    env,
  };
}
