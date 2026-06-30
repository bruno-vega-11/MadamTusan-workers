export type WorkerRole = 'COCINERO' | 'DESPACHADOR' | 'REPARTIDOR' | 'ADMIN';

export type OrderStatus =
  | 'PENDIENTE'
  | 'ESPERANDO_COCINERO'
  | 'ESPERANDO_DESPACHADOR'
  | 'ESPERANDO_REPARTIDOR'
  | 'ESPERANDO_RECEPCION_CLIENTE'
  | 'ENTREGADO'
  | 'RECHAZADO_SIN_STOCK';

export interface PedidoItem {
  uuid: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  pedido_id: string;
  tenant_id: string;
  cliente: {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
  };
  items: PedidoItem[];
  monto_total: number;
  estado: OrderStatus;
  paso_actual?: string;
  trabajador_id?: string;
  task_token?: string;
  created_at: string;
  updated_at?: string;
  origen?: string;
  fulfillment?: string;
}

export interface Worker {
  trabajador_id: string;
  tenant_id: string;
  nombre: string;
  email: string;
  rol: WorkerRole;
  disponible: boolean;
}

export interface User {
  nombre: string;
  email: string;
  tenant_id: string;
  rol?: WorkerRole;
}
