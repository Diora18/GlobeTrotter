import { api } from './client';

export function getAdminStats() {
  return api('/api/admin/stats');
}

export function getAdminAnalytics() {
  return api('/api/admin/analytics');
}

export function getAdminUsers() {
  return api('/api/admin/users');
}

export function toggleAdminRole(userId, isAdmin) {
  return api(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { isAdmin },
  });
}
