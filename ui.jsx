import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';

/* ---------------- Buttons ---------------- */
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, className = '', children, type = 'button', ...rest }) {
  const s = size === 'sm' ? 15 : 17;
  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} {...rest}>
      {Icon && <Icon size={s} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight size={s} aria-hidden="true" />}
    </button>
  );
}

export function IconButton({ icon: Icon, label, variant = 'ghost', className = '', ...rest }) {
  return (
    <button type="button" className={`icon-btn icon-btn-${variant} ${className}`} aria-label={label} title={label} {...rest}>
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}

export function Card({ as: Tag = 'div', className = '', interactive = false, children, ...rest }) {
  return (
    <Tag className={`card ${interactive ? 'card-interactive' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------- Form fields ---------------- */
export function Field({ label, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="field-hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${htmlFor}-err`} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export function Input({ label, error, hint, className = '', wrapClass = '', ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id} className={wrapClass}>
      <input id={id} className={`input ${error ? 'input-error' : ''} ${className}`} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </Field>
  );
}

export const DatePicker = (props) => <Input type="date" {...props} />;

export function Textarea({ label, error, hint, className = '', wrapClass = '', rows = 3, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id} className={wrapClass}>
      <textarea id={id} rows={rows} className={`input textarea ${error ? 'input-error' : ''} ${className}`} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </Field>
  );
}

export function Select({ label, error, hint, options, className = '', wrapClass = '', ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id} className={wrapClass}>
      <select id={id} className={`input select ${error ? 'input-error' : ''} ${className}`} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, error, hint)} {...rest}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

/** Number field that keeps what the person types and commits on blur / Enter. */
export function MoneyField({ label, value, onCommit, symbol = '$', className = '', ...rest }) {
  const [draft, setDraft] = useState(String(value ?? 0));
  const [error, setError] = useState('');
  const id = useId();
  useEffect(() => setDraft(String(value ?? 0)), [value]);
  const commit = () => {
    const t = draft.trim().replace(/,/g, '');
    const n = t === '' ? 0 : Number(t);
    if (!Number.isFinite(n) || n < 0 || n >= 1e12) {
      setError('Enter a valid amount.');
      return;
    }
    setError('');
    const v = Math.round(n * 100) / 100;
    setDraft(String(v));
    if (v !== Number(value)) onCommit(v);
  };
  return (
    <div className={`field money-field ${className}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="money-wrap">
        <span className="money-sym" aria-hidden="true">{symbol}</span>
        <input
          id={id}
          className={`input money-input ${error ? 'input-error' : ''}`}
          inputMode="decimal"
          value={draft}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          {...rest}
        />
      </div>
      {error && <p className="field-error" id={`${id}-err`} role="alert"><AlertCircle size={14} aria-hidden="true" />{error}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className="switch-row">
      <div>
        <div className="switch-label" id={`${id}-l`}>{label}</div>
        {description && <div className="switch-desc">{description}</div>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-l`} className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="switch-knob" />
      </button>
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.icon && <o.icon size={16} aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Progress ---------------- */
export function ProgressBar({ value, max = 100, label, tone = 'accent', size = 'md' }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`progress progress-${size} progress-${tone}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h2 className="empty-title">{title}</h2>
      {text && <p className="empty-text">{text}</p>}
      {action}
    </div>
  );
}

/* ---------------- Modal ---------------- */
const modalStack = [];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, footer, size = 'md', description }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const me = Symbol('modal');
    modalStack.push(me);
    const prevFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    const node = ref.current;
    const first = node.querySelector('[data-autofocus]') || node.querySelector('input:not([type=hidden]),select,textarea') || node.querySelector(FOCUSABLE);
    (first || node).focus({ preventScroll: true });

    const onKey = (e) => {
      if (modalStack[modalStack.length - 1] !== me) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === 'Tab') {
        const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const idx = modalStack.indexOf(me);
      if (idx >= 0) modalStack.splice(idx, 1);
      if (!modalStack.length) document.body.style.overflow = '';
      if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="modal-grip" aria-hidden="true" />
        <div className="modal-head">
          <div>
            <h2 id={titleId} className="modal-title">{title}</h2>
            {description && <p className="modal-desc">{description}</p>}
          </div>
          <IconButton icon={X} label="Close dialog" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
      {children}
    </Modal>
  );
}

/* ---------------- Toasts ---------------- */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'error' ? <AlertCircle size={17} aria-hidden="true" /> : t.type === 'info' ? <Info size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
          <span>{t.message}</span>
          <button type="button" className="toast-x" aria-label="Dismiss notification" onClick={() => dismissToast(t.id)}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
