import { logIn } from '../auth/loginState';
import { baseApi } from './baseApi';

async function systemLogin(email, password) {
  return baseApi.post('/auth/login', {
    password,
    email,
  });
}

export function submitCredentials({ email, password }) {
  const response = (res) => {
    res?.status === 200 && logIn(res);
  };
  systemLogin(email, password).then(response, () => {});
}
