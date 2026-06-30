import { useState, useEffect, type FormEvent } from 'react';
import { listarTrabajadores, crearTrabajador, eliminarTrabajador } from '../services/workerService';
import type { Worker, User } from '../types';

interface WorkerManagerProps {
  user: User;
}

const ROLES = ['COCINERO', 'DESPACHADOR', 'REPARTIDOR'] as const;

const ROLE_LABEL: Record<string, string> = {
  COCINERO:    'Cocinero',
  DESPACHADOR: 'Despachador',
  REPARTIDOR:  'Repartidor',
};

export default function WorkerManager({ user: _user }: WorkerManagerProps) {
  const [workers, setWorkers]       = useState<Worker[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [success, setSuccess]       = useState('');

  // Form state
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol]           = useState<string>('COCINERO');
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    listarTrabajadores()
      .then((data) => {
        const list: Worker[] = Array.isArray(data) ? data : (data.trabajadores ?? []);
        setWorkers(list);
      })
      .catch(() => setError('No se pudieron cargar los trabajadores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await crearTrabajador({ nombre, email, password, rol });
      setSuccess(`Trabajador ${nombre} creado correctamente`);
      setShowForm(false);
      setNombre(''); setEmail(''); setPassword(''); setRol('COCINERO');
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear trabajador');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setError('');
    try {
      await eliminarTrabajador(id);
      setSuccess('Trabajador eliminado');
      setDeleteId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Trabajadores</h1>
          <p className="page-subtitle">Gestión de personal · {workers.length} trabajador(es) registrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          {showForm ? '✕ Cancelar' : '+ Nuevo trabajador'}
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✓ {success}
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Create form */}
      {showForm && (
        <div className="detail-card" style={{ marginBottom: 24 }}>
          <div className="detail-card-title">Nuevo trabajador</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Juan Pérez" value={nombre}
                  onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" placeholder="juan@madamtusan.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contraseña inicial</label>
                <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select className="form-select" value={rol} onChange={(e) => setRol(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear trabajador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Worker table */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><span>Cargando trabajadores...</span></div>
      ) : workers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No hay trabajadores registrados</div>
          <div className="empty-sub">Crea el primer trabajador con el botón de arriba.</div>
        </div>
      ) : (
        <div className="detail-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Disponible</th>
                  <th>ID</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.trabajador_id}>
                    <td style={{ fontWeight: 600 }}>{w.nombre}</td>
                    <td style={{ color: 'var(--muted)' }}>{w.email}</td>
                    <td>
                      <span className={`role-badge ${w.rol?.toLowerCase()}`}>
                        {ROLE_LABEL[w.rol] ?? w.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`availability-pill ${w.disponible ? 'yes' : 'no'}`}>
                        {w.disponible ? 'Disponible' : 'Ocupado'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--muted)' }}>
                      {w.trabajador_id?.slice(-8)}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(w.trabajador_id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">Confirmar eliminación</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
              ¿Seguro que deseas eliminar este trabajador? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar trabajador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
