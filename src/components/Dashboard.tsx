import { useMemo, useState } from 'react';
import type { User, Pedido, OrderStatus } from '../types';
import OrderCard from './OrderCard';

interface DashboardProps {
  user: User;
  pedidos: Pedido[];
  loading: boolean;
  onOpenOrder: (id: string) => void;
  onRefresh: () => void;
}

const ROLE_STATUSES: Record<string, OrderStatus[]> = {
  COCINERO:    ['PENDIENTE', 'ESPERANDO_COCINERO'],
  DESPACHADOR: ['ESPERANDO_DESPACHADOR'],
  REPARTIDOR:  ['ESPERANDO_REPARTIDOR', 'ESPERANDO_RECEPCION_CLIENTE'],
};

const ACTIVE_STATUSES: OrderStatus[] = [
  'PENDIENTE',
  'ESPERANDO_COCINERO',
  'ESPERANDO_DESPACHADOR',
  'ESPERANDO_REPARTIDOR',
  'ESPERANDO_RECEPCION_CLIENTE',
];

type Tab = 'mis-tareas' | 'activos' | 'completados' | 'rechazados';

const TABS: { id: Tab; label: string }[] = [
  { id: 'mis-tareas',  label: 'Mis tareas' },
  { id: 'activos',     label: 'Todos activos' },
  { id: 'completados', label: 'Entregados' },
  { id: 'rechazados',  label: 'Rechazados' },
];

function sortByDate(pedidos: Pedido[]): Pedido[] {
  return [...pedidos].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return tb - ta;
  });
}

export default function Dashboard({ user, pedidos, loading, onOpenOrder, onRefresh }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mis-tareas');

  const myStatuses = user.rol ? (ROLE_STATUSES[user.rol] ?? ACTIVE_STATUSES) : ACTIVE_STATUSES;

  const myTasks = useMemo(() =>
    sortByDate(pedidos.filter((p) => myStatuses.includes(p.estado))),
    [pedidos, myStatuses]
  );

  const visible = useMemo(() => {
    switch (activeTab) {
      case 'mis-tareas':  return myTasks;
      case 'activos':     return sortByDate(pedidos.filter((p) => ACTIVE_STATUSES.includes(p.estado)));
      case 'completados': return sortByDate(pedidos.filter((p) => p.estado === 'ENTREGADO'));
      case 'rechazados':  return sortByDate(pedidos.filter((p) => p.estado === 'RECHAZADO_SIN_STOCK'));
    }
  }, [pedidos, activeTab, myTasks]);

  const roleTitle = user.rol
    ? `Panel ${user.rol.charAt(0) + user.rol.slice(1).toLowerCase()}`
    : 'Panel General';

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{roleTitle}</h1>
        <p className="page-subtitle">
          Bienvenido, {user.nombre} · {pedidos.length} pedido(s) en el sistema
        </p>
      </div>

      <div className="stats-grid">
        <div className={`stat-card ${myTasks.length > 0 ? 'highlight' : ''}`}>
          <div className="stat-value">{myTasks.length}</div>
          <div className="stat-label">Mis tareas activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {pedidos.filter((p) => ACTIVE_STATUSES.includes(p.estado)).length}
          </div>
          <div className="stat-label">Total activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {pedidos.filter((p) => p.estado === 'ENTREGADO').length}
          </div>
          <div className="stat-label">Entregados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {pedidos.filter((p) => p.estado === 'RECHAZADO_SIN_STOCK').length}
          </div>
          <div className="stat-label">Rechazados</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
            {id === 'mis-tareas' && myTasks.length > 0 && (
              <span className="tab-count">{myTasks.length}</span>
            )}
          </button>
        ))}
        <button
          className="tab-btn"
          style={{ marginLeft: 'auto' }}
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? '...' : '↻ Actualizar'}
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Cargando pedidos...</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">
            {activeTab === 'mis-tareas'
              ? 'Sin tareas asignadas ahora mismo'
              : 'No hay pedidos en esta categoría'}
          </div>
          <div className="empty-sub">
            {activeTab === 'mis-tareas'
              ? 'Cuando llegue un pedido para tu rol aparecerá aquí automáticamente.'
              : 'Prueba actualizando o cambiando de pestaña.'}
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {visible.map((pedido) => (
            <OrderCard
              key={pedido.pedido_id}
              pedido={pedido}
              onClick={() => onOpenOrder(pedido.pedido_id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
