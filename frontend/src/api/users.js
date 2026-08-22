import { api } from './client';

export function getMe() {
  return api('/api/users/me');
}

export function updateMe(body) {
  return api('/api/users/me', { method: 'PATCH', body });
}
