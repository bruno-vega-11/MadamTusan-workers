import type { OrderStatus } from '../types';

/*
 * Maps each OrderStatus to a numeric pipeline position.
 * Auto stages (1-3) are always done when a pedido exists.
 * Waiting stages (4-7) map to the "esperando_*" statuses.
 * Stage 8 = ENTREGADO (terminal success).
 * Stage -1 = RECHAZADO_SIN_STOCK (terminal failure at step 2).
 */
const STATUS_STEP: Record<OrderStatus, number> = {
  PENDIENTE:                   3,
  ESPERANDO_COCINERO:          4,
  ESPERANDO_DESPACHADOR:       5,
  ESPERANDO_REPARTIDOR:        6,
  ESPERANDO_RECEPCION_CLIENTE: 7,
  ENTREGADO:                   8,
  RECHAZADO_SIN_STOCK:        -1,
};

type NodeState = 'done' | 'active' | 'waiting' | 'idle' | 'error' | 'terminal-ok' | 'terminal-fail';

function nodeState(currentStep: number, nodeStep: number, isRejected: boolean): NodeState {
  if (isRejected) {
    if (nodeStep <= 2) return 'done';
    if (nodeStep === -1) return 'terminal-fail';
    return 'idle';
  }
  if (nodeStep === 8 && currentStep === 8) return 'terminal-ok';
  if (nodeStep === currentStep) return nodeStep >= 4 ? 'waiting' : 'active';
  if (nodeStep < currentStep) return 'done';
  return 'idle';
}

function Node({ label, step, currentStep, isRejected, icon }: {
  label: string; step: number; currentStep: number; isRejected: boolean; icon?: string;
}) {
  const state = nodeState(currentStep, step, isRejected);
  return (
    <div className={`sf-node ${state}`}>
      {icon && <span>{icon}</span>}
      {label}
      {state === 'done' && <span style={{ fontSize: '.75rem' }}>✓</span>}
      {state === 'waiting' && <span style={{ fontSize: '.75rem' }}>⏳</span>}
      {state === 'terminal-ok' && <span style={{ fontSize: '.75rem' }}>✓</span>}
      {state === 'terminal-fail' && <span style={{ fontSize: '.75rem' }}>✕</span>}
    </div>
  );
}

function Conn() {
  return <div className="sf-conn" />;
}

interface StepFunctionsFlowProps {
  estado: OrderStatus;
}

export default function StepFunctionsFlow({ estado }: StepFunctionsFlowProps) {
  const currentStep = STATUS_STEP[estado] ?? 3;
  const isRejected = estado === 'RECHAZADO_SIN_STOCK';

  return (
    <div className="sf-container">
      <div className="sf-title">Flujo Step Functions · Estado actual</div>

      <div className="sf-pipeline">

        {/* Stage 1 – Auto: Verificar stock */}
        <Node label="Verificar stock" step={1} currentStep={currentStep} isRejected={isRejected} icon="📦" />
        <Conn />

        {/* Stage 2 – Choice */}
        <Node label="¿Stock disponible?" step={2} currentStep={currentStep} isRejected={isRejected} icon="⚡" />
        <Conn />

        {/* Stage 2a – Rejected path (shown inline when rejected) */}
        {isRejected ? (
          <>
            <Node label="Rechazado · Sin stock" step={-1} currentStep={currentStep} isRejected={isRejected} icon="🚫" />
          </>
        ) : (
          <>
            {/* Stage 3 – Register as PENDIENTE */}
            <Node label="Registrar pendiente" step={3} currentStep={currentStep} isRejected={false} icon="📋" />
            <Conn />

            {/* Stage 4 – EtapaCocina (Parallel: Chef + Comanda) */}
            <div className="sf-parallel-row">
              <div className="sf-parallel-branch">
                <div className="sf-branch-label">Cocina</div>
                <Node label="Cocinero disponible?" step={3} currentStep={currentStep} isRejected={false} />
                <Conn />
                <Node label="Esperando cocinero" step={4} currentStep={currentStep} isRejected={false} icon="👨‍🍳" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                <div className="sf-parallel-branch">
                  <div className="sf-branch-label">Comanda</div>
                  <Node label="Imprimir comanda" step={3} currentStep={currentStep} isRejected={false} icon="🖨️" />
                </div>
              </div>
            </div>
            <Conn />

            {/* Stage 5 – EtapaEmpaque */}
            <Node label="Despachador disponible?" step={4} currentStep={currentStep} isRejected={false} />
            <Conn />
            <Node label="Esperando despachador" step={5} currentStep={currentStep} isRejected={false} icon="📦" />
            <Conn />

            {/* Stage 6 – EtapaReparto */}
            <Node label="Repartidor disponible?" step={5} currentStep={currentStep} isRejected={false} />
            <Conn />
            <Node label="Esperando repartidor" step={6} currentStep={currentStep} isRejected={false} icon="🛵" />
            <Conn />

            {/* Stage 7 – Recepción cliente */}
            <Node label="Recepción del cliente" step={7} currentStep={currentStep} isRejected={false} icon="🤝" />
            <Conn />

            {/* Stage 8 – Done */}
            <Node label="Pedido completado" step={8} currentStep={currentStep} isRejected={false} icon="✅" />
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
        {[
          { cls: 'done',        label: 'Completado' },
          { cls: 'waiting',     label: 'Esperando acción' },
          { cls: 'idle',        label: 'Pendiente' },
          { cls: 'terminal-ok', label: 'Finalizado' },
        ].map(({ cls, label }) => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className={`sf-node ${cls}`} style={{ minWidth: 'unset', padding: '3px 10px', fontSize: '.7rem' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
