import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

type AdminTableCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  empty?: boolean;
  emptyMessage?: string;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function AdminTableCard({
  title,
  description,
  actions,
  children,
  loading = false,
  loadingLabel = 'Memuat data',
  empty = false,
  emptyMessage = 'Tidak ada data yang ditemukan.',
  footer,
  className = '',
  bodyClassName = '',
}: AdminTableCardProps) {
  return (
    <section className={`bg-white border-2 border-border-color shadow-brutal overflow-hidden ${className}`}>
      <div className="p-3 border-b-2 border-border-color flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-surface">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-base">{title}</h3>
          {description && <p className="text-xs font-mono text-accent-grey mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <div className={`overflow-x-auto relative ${bodyClassName}`}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="flex items-center font-mono font-bold uppercase tracking-wider text-xs">
              <RefreshCw size={18} className="mr-2 animate-spin" /> {loadingLabel}
            </div>
          </div>
        )}

        {!loading && empty ? (
          <div className="min-h-[220px] flex items-center justify-center p-8 text-center text-accent-grey font-mono text-sm">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>

      {footer && <div className="p-3 bg-surface border-t-2 border-border-color">{footer}</div>}
    </section>
  );
}
