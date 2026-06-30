import { useState, useEffect, useCallback } from 'react';
import './index.css';
import type { User, Pedido } from './types';
import { getProfile, logoutUser, getToken } from './services/authService';
import { getPedidos } from './services/orderService';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OrderDetail from './components/OrderDetail';
import WorkerManager from './components/WorkerManager';

type View = 'dashboard' | 'order-detail' | 'admin-workers';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      getProfile()
        .then((u) => setUser(u))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const loadPedidos = useCallback(async () => {
    setPedidosLoading(true);
    try {
      const data = await getPedidos();
      const list: Pedido[] = Array.isArray(data) ? data : (data.pedidos ?? []);
      setPedidos(list);
    } catch {
      setPedidos([]);
    } finally {
      setPedidosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadPedidos();
  }, [user, loadPedidos]);

  const handleLogin = (userData: User) => setUser(userData);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setPedidos([]);
    setView('dashboard');
  };

  const handleOpenOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setView('order-detail');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedOrderId(null);
  };

  const handleTaskCompleted = () => {
    loadPedidos();
    setView('dashboard');
    setSelectedOrderId(null);
  };

  const handleNavigate = (v: string) => {
    setView(v as View);
    setSelectedOrderId(null);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <div className="loading-wrap">
          <div className="spinner" />
          <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <>
      <header className="site-header">
        <Navbar
          user={user}
          view={view}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRefresh={loadPedidos}
          pendingCount={pedidos.filter((p) =>
            ['PENDIENTE', 'ESPERANDO_COCINERO', 'ESPERANDO_DESPACHADOR',
             'ESPERANDO_REPARTIDOR', 'ESPERANDO_RECEPCION_CLIENTE'].includes(p.estado)
          ).length}
        />
      </header>

      <main className="page-wrap">
        {view === 'dashboard' && (
          <Dashboard
            user={user}
            pedidos={pedidos}
            loading={pedidosLoading}
            onOpenOrder={handleOpenOrder}
            onRefresh={loadPedidos}
          />
        )}
        {view === 'order-detail' && selectedOrderId && (
          <OrderDetail
            orderId={selectedOrderId}
            user={user}
            onBack={handleBack}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {view === 'admin-workers' && (
          <WorkerManager user={user} />
        )}
      </main>
    </>
  );
}
