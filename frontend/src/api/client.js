const BASE = import.meta.env.VITE_API_URL ?? '';

export async function api(path, options = {}) {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const json = await res.json();

  if (!res.ok) {
    throw json.error || { code: 'REQUEST_FAILED', message: 'Request failed' };
  }

  return json.data;
}

export function getErrorMessage(error) {
  if (!error) return 'Something went wrong';
  if (typeof error === 'string') return error;
  return error.message || 'Something went wrong';
}
