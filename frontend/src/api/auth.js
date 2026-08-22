import { api } from './client';

export function register(body) {
  return api('/api/auth/register', {
    method: 'POST',
    body,
  });
}

export function login({ email, password }) {
  return api('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function logout() {
  return api('/api/auth/logout', { method: 'POST' });
}

export function getMe() {
  return api('/api/auth/me');
}

export function forgotPassword(email) {
  return api('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword({ token, newPassword }) {
  return api('/api/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  });
}
