import { submitCredentials } from '../messaging/authApi';
import { app, env, engineLog } from '../../state/env';
import { version } from '../../config/version';
import { logOut } from '../auth/loginState';

export function setDev() {
  window['dev'] = {
    submitCredentials,
    get router() {
      return (window as any).appRouter;
    },
    version,
    logOut,
    app,
    env,
    engineLog,
  };
}
