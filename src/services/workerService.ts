import { getToken } from './authService';

const BASE_URL = 'https://omaovrwnda.execute-api.us-east-1.amazonaws.com/dev';
const TENANT_ID = 'madam-tusan';

function authHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function listarTrabajadores() {
  const res = await fetch(`${BASE_URL}/trabajadores?tenant_id=${TENANT_ID}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al listar trabajadores');
  return res.json();
}

export async function crearTrabajador(data: {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}) {
  const res = await fetch(`${BASE_URL}/trabajadores`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...data, tenant_id: TENANT_ID }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message || 'Error al crear trabajador');
  return json;
}

export async function eliminarTrabajador(trabajadorId: string) {
  const res = await fetch(`${BASE_URL}/trabajadores/${trabajadorId}/eliminar`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ tenant_id: TENANT_ID }),
  });
  if (!res.ok) throw new Error('Error al eliminar trabajador');
  return res.json();
}
