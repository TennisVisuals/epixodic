import { getJwtTokenStorageKey } from '../../config/getJwtTokenStorageKey';
import { browserStorage } from '../../transition/browserStorage';
import { validateToken } from './validateToken';

const JWT_TOKEN_STORAGE_NAME = getJwtTokenStorageKey();

export function getLoginState() {
  const token = browserStorage.get(JWT_TOKEN_STORAGE_NAME);
  return validateToken(token);
}
export function logOut() {
  browserStorage.remove(JWT_TOKEN_STORAGE_NAME);
  // Socket/broadcast functionality removed
}

export function logIn({ data }) {
  const decodedToken = validateToken(data.token);
  if (decodedToken) {
    browserStorage.set(JWT_TOKEN_STORAGE_NAME, data.token);
    console.log({ intent: 'is-success', message: 'Login successful' });
  }
}
