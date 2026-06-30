import { useState, useEffect } from 'react';
import { getPedido } from '../services/orderService';
import type { Pedido, User, OrderStatus } from '../types';
import StepFunctionsFlow from './StepFunctionsFlow';
import TaskCompleteModal from './TaskCompleteModal';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE:                   'Pendiente de cocina',
  ESPERANDO_COCINERO:          'Esperando cocinero',
  ESPERANDO_DESPACHADOR:       'Esperando despachador',
  ESPERANDO_REPARTIDOR:        'Esperando repartidor',
  ESPERANDO_RECEPCION_CLIENTE: 'Esperando recepción del cliente',
  ENTREGADO:                   'Entregado',
  RECHAZADO_SIN_STOCK:         'Rechazado · Sin stock',
};

const COMPLETABLE: OrderStatus[] = [
  'ESPERANDO_COCINERO',
  'ESPERANDO_DESPACHADOR',
  'ESPERANDO_REPARTIDOR',
  'ESPERANDO_RECEPCION_CLIENTE',
];

const ROLE_COMPLETABLE: Record<string, OrderStatus[]> = {
  COCINERO:    ['ESPERANDO_COCINERO'],
  DESPACHADOR: ['ESPERANDO_DESPACHADOR'],
  REPARTIDOR:  ['ESPERANDO_REPARTIDOR', 'ESPERANDO_RECEPCION_CLIENTE'],
};

function canComplete(user: User, estado: OrderStatus): boolean {
  if (!user.rol) return COMPLETABLE.includes(estado);
  return (ROLE_COMPLETABLE[user.rol] ?? []).includes(estado);
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

interface OrderDetailProps {
  orderId: string;
  user: User;
  onBack: () => void;
  onTaskCompleted: () => void;
}

export default function OrderDetail({ orderId, user, onBack, onTaskCompleted }: OrderDetailProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPedido(orderId)
      .then((data) => setPedido(data.pedido ?? data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <>
        <button className="back-btn" onClick={onBack}>← Volver</button>
        <div className="loading-wrap"><div className="spinner" /><span>Cargando pedido...</span></div>
      </>
    );
  }

  if (error || !pedido) {
    return (
      <>
        <button className="back-btn" onClick={onBack}>← Volver</button>
        <div className="alert alert-error">{error || 'Pedido no encontrado'}</div>
      </>
    );
  }

  const showComplete = canComplete(user, pedido.estado);

  return (
    <>
      <button className="back-btn" onClick={onBack}>← Volver al dashboard</button>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 className="page-title">
            Pedido #{pedido.pedido_id?.slice(-8)?.toUpperCase()}
          </h1>
          <span className={`status-badge status-${pedido.estado}`}>
            {STATUS_LABEL[pedido.estado] ?? pedido.estado}
          </span>
        </div>
        <p className="page-subtitle">
          {pedido.cliente?.nombre} · {formatDateTime(pedido.created_at)}
        </p>
      </div>

      {showComplete && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <span>⚡</span>
          <div>
            <strong>Tienes una tarea pendiente</strong> en este pedido.
            Completa tu etapa cuando hayas terminado.
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}
            onClick={() => setShowModal(true)}>
            Completar tarea
          </button>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-left">

          {/* Step Functions flow */}
          <StepFunctionsFlow estado={pedido.estado} />

          {/* Items */}
          <div className="detail-card">
            <div className="detail-card-title">Ítems del pedido</div>
            {(pedido.items ?? []).map((item, i) => (
              <div className="detail-item" key={i}>
                <div className="detail-item-left">
                  <span className="detail-item-qty">{item.cantidad}×</span>
                  <span className="detail-item-name">{item.nombre}</span>
                </div>
                <span className="detail-item-price">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="detail-total-row">
              <span className="detail-total-lbl">Total</span>
              <span className="detail-total-val">S/ {Number(pedido.monto_total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="detail-right">

          {/* Client info */}
          <div className="detail-card">
            <div className="detail-card-title">Cliente</div>
            <div className="detail-row">
              <span className="detail-row-label">Nombre</span>
              <span className="detail-row-value">{pedido.cliente?.nombre ?? '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row-label">Email</span>
              <span className="detail-row-value">{pedido.cliente?.email ?? '—'}</span>
            </div>
            {pedido.cliente?.telefono && (
              <div className="detail-row">
                <span className="detail-row-label">Teléfono</span>
                <span className="detail-row-value">{pedido.cliente.telefono}</span>
              </div>
            )}
            {pedido.cliente?.direccion && (
              <div className="detail-row">
                <span className="detail-row-label">Dirección</span>
                <span className="detail-row-value">{pedido.cliente.direccion}</span>
              </div>
            )}
          </div>

          {/* Order metadata */}
          <div className="detail-card">
            <div className="detail-card-title">Información del pedido</div>
            <div className="detail-row">
              <span className="detail-row-label">ID</span>
              <span className="detail-row-value" style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>
                {pedido.pedido_id}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row-label">Estado</span>
              <span className="detail-row-value">
                <span className={`status-badge status-${pedido.estado}`} style={{ fontSize: '.68rem' }}>
                  {STATUS_LABEL[pedido.estado] ?? pedido.estado}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row-label">Creado</span>
              <span className="detail-row-value">{formatDateTime(pedido.created_at)}</span>
            </div>
            {pedido.updated_at && (
              <div className="detail-row">
                <span className="detail-row-label">Actualizado</span>
                <span className="detail-row-value">{formatDateTime(pedido.updated_at)}</span>
              </div>
            )}
            {pedido.origen && (
              <div className="detail-row">
                <span className="detail-row-label">Origen</span>
                <span className="detail-row-value">{pedido.origen}</span>
              </div>
            )}
            {pedido.fulfillment && (
              <div className="detail-row">
                <span className="detail-row-label">Fulfillment</span>
                <span className="detail-row-value">{pedido.fulfillment}</span>
              </div>
            )}
            {pedido.trabajador_id && (
              <div className="detail-row">
                <span className="detail-row-label">Trabajador asignado</span>
                <span className="detail-row-value" style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>
                  {pedido.trabajador_id}
                </span>
              </div>
            )}
          </div>

          {showComplete && (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={() => setShowModal(true)}>
              ✓ Marcar tarea completada
            </button>
          )}
        </div>
      </div>

      {showModal && pedido && (
        <TaskCompleteModal
          pedido={pedido}
          onClose={() => setShowModal(false)}
          onCompleted={onTaskCompleted}
        />
      )}
    </>
  );
}
