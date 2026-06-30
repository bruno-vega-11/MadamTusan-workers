import type { User } from '../types';

interface NavbarProps {
  user: User;
  view: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
}

export default function Navbar({ user, view, pendingCount, onNavigate, onLogout, onRefresh }: NavbarProps) {
  const roleClass = (user.rol ?? 'admin').toLowerCase();
  const roleLabel = user.rol ?? 'Admin';

  return (
    <div className="topbar">
      <button className="topbar-brand" onClick={() => onNavigate('dashboard')}>
        <div className="topbar-brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="topbar-brand-name">Madam<span>Tusan</span> Workers</span>
      </button>

      <div className="topbar-center">
        <nav className="topbar-nav">
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
            {pendingCount > 0 && (
              <span className="tab-count">{pendingCount}</span>
            )}
          </button>

          <button
            className={view === 'admin-workers' ? 'active' : ''}
            onClick={() => onNavigate('admin-workers')}
          >
            Trabajadores
          </button>

          <button onClick={onRefresh} title="Actualizar pedidos">
            ↻ Actualizar
          </button>
        </nav>
      </div>

      <div className="topbar-right">
        <span className={`role-badge ${roleClass}`}>{roleLabel}</span>
        <span className="topbar-username">{user.nombre}</span>
        <button className="btn-logout" onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Salir
        </button>
      </div>
    </div>
  );
}
