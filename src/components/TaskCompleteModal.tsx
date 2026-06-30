import { useState } from 'react';
import { completarTarea } from '../services/orderService';
import type { Pedido, OrderStatus } from '../types';

const PASO_INFO: Record<OrderStatus, { title: string; description: string; emoji: string }> = {
  ESPERANDO_COCINERO: {
    title: 'Completar etapa de cocina',
    description: '¿Confirmas que los platos han sido preparados y están listos para el siguiente paso?',
    emoji: '👨‍🍳',
  },
  ESPERANDO_DESPACHADOR: {
    title: 'Completar empaque',
    description: '¿Confirmas que el pedido ha sido empacado correctamente y está listo para entrega?',
    emoji: '📦',
  },
  ESPERANDO_REPARTIDOR: {
    title: 'Completar entrega',
    description: '¿Confirmas que el pedido ha sido entregado al cliente o está en proceso de recepción?',
    emoji: '🛵',
  },
  ESPERANDO_RECEPCION_CLIENTE: {
    title: 'Confirmar recepción del cliente',
    description: '¿Confirmas que el cliente ha recibido su pedido satisfactoriamente?',
    emoji: '🤝',
  },
  PENDIENTE: {
    title: 'Completar tarea',
    description: '¿Confirmas la finalización de este paso?',
    emoji: '✅',
  },
  ENTREGADO: { title: '', description: '', emoji: '' },
  RECHAZADO_SIN_STOCK: { title: '', description: '', emoji: '' },
};

interface TaskCompleteModalProps {
  pedido: Pedido;
  onClose: () => void;
  onCompleted: () => void;
}

export default function TaskCompleteModal({ pedido, onClose, onCompleted }: TaskCompleteModalProps) {
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const info = PASO_INFO[pedido.estado] ?? { title: 'Completar tarea', description: '', emoji: '✅' };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await completarTarea(pedido.pedido_id, { completado: true, notas: notas.trim() || undefined });
      onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{info.emoji}</div>
            <div className="modal-title">{info.title}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div>
          <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            {info.description}
          </p>

          <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--soft)', borderRadius: 10 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Pedido
            </div>
            <div style={{ fontWeight: 700, color: 'var(--black)' }}>{pedido.cliente?.nombre}</div>
            <div style={{ fontSize: '.83rem', color: 'var(--muted)', marginTop: 4 }}>
              #{pedido.pedido_id?.slice(-8)?.toUpperCase()} · S/ {Number(pedido.monto_total ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notas adicionales (opcional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej: Todo listo, sin observaciones"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Enviando...' : 'Confirmar completado'}
          </button>
        </div>
      </div>
    </div>
  );
}
