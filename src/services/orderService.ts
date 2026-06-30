import { getToken } from './authService';

const BASE_URL = 'https://omaovrwnda.execute-api.us-east-1.amazonaws.com/dev';
const TENANT_ID = 'madam-tusan';

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPedidos() {
  const res = await fetch(`${BASE_URL}/pedidos?tenant_id=${TENANT_ID}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

export async function getPedido(pedidoId: string) {
  const res = await fetch(`${BASE_URL}/pedidos/${pedidoId}?tenant_id=${TENANT_ID}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener el pedido');
  return res.json();
}

export async function completarTarea(
  pedidoId: string,
  resultado: Record<string, unknown> = {},
) {
  const res = await fetch(`${BASE_URL}/pedidos/${pedidoId}/tareas/completar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ tenant_id: TENANT_ID, resultado }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Error al completar tarea');
  return data;
}
