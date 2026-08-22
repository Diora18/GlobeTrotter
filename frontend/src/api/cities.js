import { api } from './client';

export function listCities(params = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.country) search.set('country', params.country);
  if (params.region) search.set('region', params.region);
  if (params.sort) search.set('sort', params.sort);
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return api(`/api/cities${query ? `?${query}` : ''}`);
}

export function getCity(id) {
  return api(`/api/cities/${id}`);
}
