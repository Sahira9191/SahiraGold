import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Truck, CreditCard, Bell, User, Shield, Save, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import useSettingsStore from '../../store/settingsStore';

// ─── Shared UI primitives ──────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-700/50 last:border-0">
      <div className="flex-1">
        <p className="text-sm text-slate-200 font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-yellow-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({ onClick, saving = false, label = 'Guardar cambios' }) {
  return (
    <div className="pt-2">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
      >
        {saving
          ? <><span className="w-3.5 h-3.5 border-2 border-slate-800/50 border-t-slate-950 rounded-full animate-spin" />Guardando...</>
          : <><Save size={15} />{label}</>
        }
      </button>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 space-y-4">
      {(title || description) && (
        <div className="pb-2 border-b border-slate-700/60">
          {title && <h3 className="text-slate-100 font-semibold">{title}</h3>}
          {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  get: (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ─── 1. Tienda ─────────────────────────────────────────────────────────────────

const TIENDA_DEFAULT = {
  nombre: 'Sahira Gold Collection',
  email: 'hola@sahiragoldcollection.com',
  telefono: '+52 55 1234 5678',
  direccion: 'Av. Presidente Masaryk 111, Polanco, CDMX 11560',
  moneda: 'MXN',
  zona: 'America/New_York',
};

function TiendaSection() {
  const setSettings = useSettingsStore(s => s.setSettings);
  const storeData   = useSettingsStore(s => ({
    nombre: s.nombre, email: s.email, telefono: s.telefono,
    direccion: s.direccion, moneda: s.moneda, zona: s.zona,
  }));

  const [form, setForm] = useState(storeData);
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      // Persiste en Zustand (que ya sincroniza con localStorage automáticamente)
      setSettings(form);
      setSaving(false);
      toast.success('✓ Información de la tienda guardada — moneda actualizada en toda la web');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Información de la tienda" description="Datos generales del negocio.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la tienda">
            <Input value={form.nombre} onChange={e => f('nombre', e.target.value)} />
          </Field>
          <Field label="Email de contacto">
            <Input type="email" value={form.email} onChange={e => f('email', e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input type="tel" value={form.telefono} onChange={e => f('telefono', e.target.value)} />
          </Field>
          <Field label="Moneda">
            <select
              value={form.moneda}
              onChange={e => f('moneda', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
            >
              <option value="MXN">MXN — Peso Mexicano</option>
              <option value="USD">USD — Dólar Americano</option>
            </select>
          </Field>
        </div>
        <Field label="Dirección">
          <Input value={form.direccion} onChange={e => f('direccion', e.target.value)} />
        </Field>
        <Field label="Zona horaria">
          <select
            value={form.zona}
            onChange={e => f('zona', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
          >
            <optgroup label="🇺🇸 Estados Unidos">
              <option value="America/New_York">New York, NY (GMT-4)</option>
              <option value="America/Chicago">Chicago, IL (GMT-5)</option>
              <option value="America/Denver">Denver, CO (GMT-6)</option>
              <option value="America/Los_Angeles">Los Angeles, CA (GMT-7)</option>
              <option value="America/Phoenix">Phoenix, AZ (GMT-7)</option>
              <option value="Pacific/Honolulu">Honolulu, HI (GMT-10)</option>
            </optgroup>
            <optgroup label="🇲🇽 México">
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Monterrey">Monterrey (GMT-6)</option>
              <option value="America/Tijuana">Tijuana (GMT-8)</option>
              <option value="America/Cancun">Cancún (GMT-5)</option>
            </optgroup>
          </select>
        </Field>
        <SaveButton onClick={handleSave} saving={saving} />
      </SectionCard>
    </div>
  );
}

// ─── 2. Envío ──────────────────────────────────────────────────────────────────

const ENVIO_DEFAULT = { costoEstandar: 150, umbralGratis: 2000, envioGratisActivo: true, diasEntrega: 3 };

function EnvioSection() {
  const [form, setForm] = useState(() => LS.get('sg_settings_envio', ENVIO_DEFAULT));
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { LS.set('sg_settings_envio', form); setSaving(false); toast.success('✓ Configuración de envío guardada'); }, 400);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Configuración de envíos" description="Tarifas y políticas de envío para la tienda.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Costo de envío estándar (MXN)" hint="Se aplica cuando no aplica envío gratis.">
            <Input type="number" min={0} value={form.costoEstandar} onChange={e => f('costoEstandar', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Umbral de envío gratis (MXN)" hint="Compras mayores a este monto tienen envío gratis.">
            <Input type="number" min={0} value={form.umbralGratis} onChange={e => f('umbralGratis', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Días estimados de entrega" hint="Días hábiles promedio.">
            <Input type="number" min={1} max={30} value={form.diasEntrega} onChange={e => f('diasEntrega', parseInt(e.target.value) || 1)} />
          </Field>
        </div>
        <Toggle checked={form.envioGratisActivo} onChange={v => f('envioGratisActivo', v)} label="Envío gratis activado" description={`Ofrecer envío gratis en compras mayores a $${form.umbralGratis.toLocaleString('es-MX')} MXN`} />
        <SaveButton onClick={handleSave} saving={saving} />
      </SectionCard>
    </div>
  );
}

// ─── 3. Pagos ──────────────────────────────────────────────────────────────────

const MSI_DEFAULT = { 3: true, 6: true, 12: true, 18: false };
const METODOS_DEFAULT = { oxxo: true, paypal: true, tarjeta: true };

function PagosSection() {
  const [msi, setMsi] = useState(() => LS.get('sg_settings_msi', MSI_DEFAULT));
  const [metodos, setMetodos] = useState(() => LS.get('sg_settings_metodos', METODOS_DEFAULT));
  const [saving, setSaving] = useState(false);
  const toggleMsi = m => setMsi(p => ({ ...p, [m]: !p[m] }));
  const toggleMetodo = m => setMetodos(p => ({ ...p, [m]: !p[m] }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { LS.set('sg_settings_msi', msi); LS.set('sg_settings_metodos', metodos); setSaving(false); toast.success('✓ Configuración de pagos guardada'); }, 400);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Métodos de pago" description="Canales aceptados en la tienda.">
        <Toggle checked={metodos.tarjeta} onChange={() => toggleMetodo('tarjeta')} label="Tarjeta de crédito / débito" description="Visa, Mastercard, American Express" />
        <Toggle checked={metodos.paypal} onChange={() => toggleMetodo('paypal')} label="PayPal" description="Pago mediante cuenta PayPal" />
        <Toggle checked={metodos.oxxo} onChange={() => toggleMetodo('oxxo')} label="OXXO Pay" description="Referencia de pago en tiendas OXXO" />
        <SaveButton onClick={handleSave} saving={saving} />
      </SectionCard>

      <SectionCard title="Meses sin intereses (MSI)" description="Opciones de pago diferido disponibles.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[3, 6, 12, 18].map(m => (
            <button key={m} onClick={() => toggleMsi(m)}
              className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all ${
                msi[m] ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
              }`}>
              <span className="text-2xl font-bold">{m}</span>
              <span className="text-xs mt-1">meses</span>
              {msi[m] && <Check size={14} className="mt-2" />}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-4 py-3 mt-2">
          <span className="text-sm text-slate-400">CAT Informativo</span>
          <span className="text-sm font-semibold text-slate-100 font-mono">7.9%</span>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </SectionCard>
    </div>
  );
}

// ─── 4. Notificaciones ─────────────────────────────────────────────────────────

const NOTIF_DEFAULT = { emailCliente: true, emailAdmin: true, whatsappCliente: false, adminEmail: 'admin@sahiragoldcollection.com' };

function NotificacionesSection() {
  const [form, setForm] = useState(() => LS.get('sg_settings_notif', NOTIF_DEFAULT));
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { LS.set('sg_settings_notif', form); setSaving(false); toast.success('✓ Notificaciones actualizadas'); }, 400);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Alertas y notificaciones" description="Controla cuándo y cómo se envían notificaciones.">
        <Toggle checked={form.emailCliente} onChange={v => f('emailCliente', v)} label="Email al cliente al crear pedido" description="Confirmación de compra automática por correo." />
        <Toggle checked={form.emailAdmin} onChange={v => f('emailAdmin', v)} label="Email al admin por nuevo pedido" description="Notificación al correo del administrador." />
        <Toggle checked={form.whatsappCliente} onChange={v => f('whatsappCliente', v)} label="WhatsApp al cliente" description="Enviar confirmación vía WhatsApp Business API." />
        <Field label="Email del administrador" hint="Dirección donde se reciben los avisos de nuevos pedidos.">
          <Input type="email" value={form.adminEmail} onChange={e => f('adminEmail', e.target.value)} />
        </Field>
        <SaveButton onClick={handleSave} saving={saving} />
      </SectionCard>
    </div>
  );
}

// ─── 5. Mi Cuenta ─────────────────────────────────────────────────────────────

function CuentaSection() {
  const [form, setForm] = useState({
    nombre: 'Administrador Sahira',
    email: 'admin@sahiragoldcollection.com',
    password: '',
    confirmPassword: '',
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (form.password && form.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    toast.success('Cuenta actualizada correctamente');
    setForm(p => ({ ...p, password: '', confirmPassword: '' }));
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Información de mi cuenta" description="Actualiza tu nombre y correo de acceso.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo">
            <Input value={form.nombre} onChange={e => f('nombre', e.target.value)} />
          </Field>
          <Field label="Correo electrónico" hint="No se puede cambiar directamente.">
            <Input value={form.email} disabled readOnly />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Cambiar contraseña" description="Deja los campos vacíos si no deseas cambiarla.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
            <Input
              type="password"
              value={form.password}
              onChange={e => f('password', e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirmar contraseña">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={e => f('confirmPassword', e.target.value)}
              placeholder="••••••••"
            />
          </Field>
        </div>
        <SaveButton onClick={handleSave} />
      </SectionCard>
    </div>
  );
}

// ─── 6. Seguridad ─────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  { id: 's1', device: 'Chrome · Windows 11', ip: '187.141.23.45', date: 'Hoy, 18:42', current: true },
  { id: 's2', device: 'Safari · iPhone 15 Pro', ip: '187.141.23.45', date: '14 jun 2026, 09:15', current: false },
];

function SeguridadSection() {
  const [twoFa, setTwoFa] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const handleCloseAll = () => {
    setSessions(prev => prev.filter(s => s.current));
    toast.success('Todas las demás sesiones han sido cerradas');
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Autenticación de dos factores (2FA)" description="Añade una capa de seguridad extra a tu cuenta.">
        <Toggle
          checked={twoFa}
          onChange={v => {
            setTwoFa(v);
            toast.success(v ? '2FA activado' : '2FA desactivado');
          }}
          label="2FA activado"
          description="Requerirá un código de tu app de autenticación al iniciar sesión."
        />
      </SectionCard>

      <SectionCard title="Sesiones activas" description="Dispositivos con sesión abierta en tu cuenta.">
        <div className="space-y-2">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
                s.current ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-200 font-medium truncate">{s.device}</p>
                  {s.current && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 flex-shrink-0">
                      Esta sesión
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  IP: {s.ip} · {s.date}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => {
                    setSessions(prev => prev.filter(x => x.id !== s.id));
                    toast.success('Sesión cerrada');
                  }}
                  className="text-xs px-2.5 py-1 rounded-md bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-700/30 transition-colors whitespace-nowrap"
                >
                  Cerrar
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleCloseAll}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm rounded-lg border border-red-700/30 transition-colors"
        >
          Cerrar todas las demás sesiones
        </button>
      </SectionCard>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'tienda', icon: Store, label: 'Tienda' },
  { id: 'envio', icon: Truck, label: 'Envío' },
  { id: 'pagos', icon: CreditCard, label: 'Pagos' },
  { id: 'notificaciones', icon: Bell, label: 'Notificaciones' },
  { id: 'cuenta', icon: User, label: 'Mi Cuenta' },
  { id: 'seguridad', icon: Shield, label: 'Seguridad' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('tienda');
  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Store size={18} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-slate-100 font-bold text-xl">Configuración</h1>
            <p className="text-slate-400 text-sm">Ajustes generales de la tienda y la cuenta</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vertical tabs sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal w-full ${
                      isActive
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'tienda' && <TiendaSection />}
              {activeTab === 'envio' && <EnvioSection />}
              {activeTab === 'pagos' && <PagosSection />}
              {activeTab === 'notificaciones' && <NotificacionesSection />}
              {activeTab === 'cuenta' && <CuentaSection />}
              {activeTab === 'seguridad' && <SeguridadSection />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
