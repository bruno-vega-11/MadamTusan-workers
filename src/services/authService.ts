const BASE_URL = 'https://omaovrwnda.execute-api.us-east-1.amazonaws.com/dev';
const TENANT_ID = 'madam-tusan';
const TOKEN_KEY = 'madamtusan_worker_token';

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/usuarios/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenant_id: TENANT_ID }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function logoutUser() {
  const token = getToken();
  if (token) {
    await fetch(`${BASE_URL}/usuarios/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem(TOKEN_KEY);
}

export async function getProfile() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/usuarios/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  const data = await res.json();
  return data.user ?? data;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
