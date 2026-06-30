import type { Pedido, OrderStatus } from '../types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE:                   'Pendiente',
  ESPERANDO_COCINERO:          'En cocina',
  ESPERANDO_DESPACHADOR:       'En empaque',
  ESPERANDO_REPARTIDOR:        'En reparto',
  ESPERANDO_RECEPCION_CLIENTE: 'Esperando cliente',
  ENTREGADO:                   'Entregado',
  RECHAZADO_SIN_STOCK:         'Sin stock',
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

interface OrderCardProps {
  pedido: Pedido;
  onClick: () => void;
}

export default function OrderCard({ pedido, onClick }: OrderCardProps) {
  const previewItems = pedido.items?.slice(0, 3) ?? [];
  const extra = (pedido.items?.length ?? 0) - 3;

  return (
    <div className="order-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="order-card-top">
        <div>
          <div className="order-card-id">#{pedido.pedido_id?.slice(-8)?.toUpperCase()}</div>
          <div className="order-card-client">{pedido.cliente?.nombre ?? '—'}</div>
        </div>
        <span className={`status-badge status-${pedido.estado}`}>
          {STATUS_LABEL[pedido.estado] ?? pedido.estado}
        </span>
      </div>

      <div className="order-card-items">
        {previewItems.map((item, i) => (
          <div className="order-card-item-line" key={i}>
            {item.cantidad}× {item.nombre}
          </div>
        ))}
        {extra > 0 && (
          <div className="order-card-item-line" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
            +{extra} ítem(s) más
          </div>
        )}
      </div>

      <div className="order-card-foot">
        <span className="order-card-total">
          S/ {Number(pedido.monto_total ?? 0).toFixed(2)}
        </span>
        <span className="order-card-time">
          {formatDate(pedido.created_at)} · {formatTime(pedido.created_at)}
        </span>
      </div>
    </div>
  );
}
