import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Mail, Phone, ShoppingBag,
  TrendingUp, X, Calendar, Plus, Trash2,
  Edit3, Check, Save, UserPlus,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
  }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const genId = () => 'c' + Date.now() + Math.random().toString(36).slice(2, 6);

// ─── Initial seed data ────────────────────────────────────────────────────────

const SEED_CUSTOMERS = [
  {
    id: 'c1', name: 'Sofía Martínez', email: 'sofia@email.com',
    phone: '+52 55 1234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80',
    joined: '2024-03-15', status: 'Activo', notes: '',
  },
  {
    id: 'c2', name: 'Ana Pérez', email: 'ana@email.com',
    phone: '+52 33 9876-5432',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80',
    joined: '2023-11-20', status: 'Activo', notes: '',
  },
  {
    id: 'c3', name: 'Carmen Villanueva', email: 'carmen@email.com',
    phone: '+52 81 5555-1234',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80',
    joined: '2024-01-08', status: 'Activo', notes: '',
  },
  {
    id: 'c4', name: 'Isabella Fuentes', email: 'isa@email.com',
    phone: '+52 998 123-4567',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=60&q=80',
    joined: '2025-07-12', status: 'Nuevo', notes: '',
  },
  {
    id: 'c5', name: 'Gabriela Moreno', email: 'gaby@email.com',
    phone: '+52 55 8888-9999',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=60&q=80',
    joined: '2023-06-30', status: 'VIP', notes: 'Cliente frecuente, prefiere aretes de oro.',
  },
  {
    id: 'c6', name: 'Mariana Ríos', email: 'mari@email.com',
    phone: '+52 442 333-4444',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80',
    joined: '2026-01-05', status: 'Nuevo', notes: '',
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'sg_customers';

function loadCustomers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return SEED_CUSTOMERS;
}

function saveCustomers(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

// Load orders from the Orders module to compute real stats
function loadOrders() {
  try {
    const raw = localStorage.getItem('sg_orders');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

// Compute order stats for a customer by email
function getCustomerOrderStats(email, orders) {
  const cOrders = orders.filter(
    (o) => o.customerEmail?.toLowerCase() === email?.toLowerCase()
  );
  const totalSpent = cOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  return { orders: cOrders.length, totalSpent, orderList: cOrders };
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    VIP:    'text-yellow-400 bg-yellow-900/30 border border-yellow-700',
    Activo: 'text-emerald-400 bg-emerald-900/30 border border-emerald-700',
    Nuevo:  'text-blue-400 bg-blue-900/30 border border-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || map.Activo}`}>
      {status === 'VIP' && '♛ '}{status}
    </span>
  );
}

function MiniOrderBadge({ status }) {
  const map = {
    Procesando:  'text-yellow-400 bg-yellow-900/30',
    'En camino': 'text-blue-400 bg-blue-900/30',
    Entregado:   'text-emerald-400 bg-emerald-900/30',
    Cancelado:   'text-red-400 bg-red-900/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || ''}`}>
      {status}
    </span>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, sortBy }) {
  if (sortBy.field !== field) return <span className="ml-1 text-slate-600">↕</span>;
  return <span className="ml-1 text-yellow-400">{sortBy.dir === 'asc' ? '↑' : '↓'}</span>;
}

// ─── Add Customer Modal ───────────────────────────────────────────────────────

function AddCustomerModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Nuevo' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!form.email.trim()) { setError('El email es requerido'); return; }
    const newCustomer = {
      id: genId(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=D97706&color=fff&size=60`,
      joined: new Date().toISOString().slice(0, 10),
      status: form.status,
      notes: '',
    };
    onAdd(newCustomer);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 className="text-slate-100 font-bold text-lg flex items-center gap-2">
              <UserPlus size={18} className="text-yellow-400" /> Nuevo cliente
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
              <X size={17} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

            {[
              { label: 'Nombre completo *', key: 'name', placeholder: 'María García', type: 'text' },
              { label: 'Correo electrónico *', key: 'email', placeholder: 'maria@email.com', type: 'email' },
              { label: 'Teléfono', key: 'phone', placeholder: '+52 55 1234-5678', type: 'tel' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2.5 focus:border-yellow-500 outline-none"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Activo">Activo</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Check size={15} /> Crear cliente
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// ─── Customer Drawer ──────────────────────────────────────────────────────────

function CustomerDrawer({ customer, orders, onClose, onSave, onDelete }) {
  const [notes, setNotes]     = useState(customer.notes || '');
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    name: customer.name, email: customer.email,
    phone: customer.phone, status: customer.status,
  });
  const [saved, setSaved] = useState(false);

  // Real orders for this customer
  const { orders: orderCount, totalSpent, orderList } = getCustomerOrderStats(customer.email, orders);

  const handleSaveNotes = () => {
    onSave({ ...customer, notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveEdit = () => {
    onSave({ ...customer, ...form, notes });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${customer.name}? Esta acción no se puede deshacer.`)) {
      onDelete(customer.id);
      onClose();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Perfil del cliente</p>
          <div className="flex items-center gap-1">
            <button onClick={handleDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors" title="Eliminar cliente">
              <Trash2 size={15} />
            </button>
            <button onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Identity */}
          <div className="flex flex-col items-center text-center gap-3">
            <img src={customer.avatar} alt={customer.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-600 shadow-lg" />
            {editing ? (
              <div className="w-full space-y-2">
                {[
                  { key: 'name',   label: 'Nombre',   type: 'text'  },
                  { key: 'email',  label: 'Email',    type: 'email' },
                  { key: 'phone',  label: 'Teléfono', type: 'tel'   },
                ].map(({ key, label, type }) => (
                  <input key={key} type={type} value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={label}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none"
                  />
                ))}
                <select value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none">
                  <option value="Nuevo">Nuevo</option>
                  <option value="Activo">Activo</option>
                  <option value="VIP">VIP</option>
                </select>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditing(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSaveEdit}
                    className="flex-1 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-bold transition-colors flex items-center justify-center gap-1.5">
                    <Save size={14} /> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <h3 className="text-slate-100 font-bold text-lg leading-tight">{customer.name}</h3>
                  <button onClick={() => setEditing(true)}
                    className="p-1 rounded text-slate-500 hover:text-yellow-400 transition-colors" title="Editar">
                    <Edit3 size={14} />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <StatusBadge status={customer.status} />
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-xs">
                  <Calendar size={12} />
                  <span>Cliente desde {formatDate(customer.joined)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats — real from orders */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pedidos',  value: orderCount,            icon: ShoppingBag, color: 'text-blue-400'   },
              { label: 'Gastado',  value: formatPrice(totalSpent), icon: TrendingUp,  color: 'text-yellow-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <Icon size={16} className={color} />
                <p className="text-slate-100 font-bold text-sm leading-tight">{value}</p>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          {!editing && (
            <div className="bg-slate-700/40 rounded-xl p-4 space-y-2.5">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Contacto</p>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span>{customer.phone || '—'}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!editing && (
            <div className="grid grid-cols-2 gap-2">
              <a href={`mailto:${customer.email}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm transition-colors">
                <Mail size={14} /> Email
              </a>
              {customer.phone && (
                <a href={`tel:${customer.phone.replace(/\s|-/g, '')}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold text-sm transition-colors">
                  <Phone size={14} /> Llamar
                </a>
              )}
            </div>
          )}

          {/* Real Order History */}
          {orderList.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
                Historial de pedidos ({orderList.length})
              </p>
              <div className="space-y-2">
                {orderList.slice(0, 5).map((order) => (
                  <div key={order.id}
                    className="flex items-center justify-between bg-slate-700/40 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-slate-200 text-sm font-medium font-mono">{order.id}</p>
                      <p className="text-slate-500 text-xs">{formatDate(order.date)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-slate-100 text-sm font-semibold">{formatPrice(order.total)}</p>
                      <MiniOrderBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2 pb-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Notas internas</p>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferencias, observaciones del cliente…"
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none resize-none"
            />
            <button onClick={handleSaveNotes}
              className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                saved ? 'bg-emerald-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
              }`}>
              {saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> Guardar notas</>}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Customers() {
  const [customers, setCustomers]           = useState(loadCustomers);
  const [orders,    setOrders]              = useState([]);
  const [search,    setSearch]              = useState('');
  const [selectedCustomer, setSelected]    = useState(null);
  const [sortBy,    setSortBy]              = useState({ field: 'name', dir: 'asc' });
  const [showAdd,   setShowAdd]             = useState(false);

  // Load orders once on mount
  useEffect(() => { setOrders(loadOrders()); }, []);

  // Persist whenever customers change
  useEffect(() => { saveCustomers(customers); }, [customers]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSelected(null); setShowAdd(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Merge real order stats into customers
  const enriched = customers.map((c) => {
    const { orders: orderCount, totalSpent } = getCustomerOrderStats(c.email, orders);
    return { ...c, orders: orderCount, totalSpent };
  });

  // Stats
  const CURRENT_YEAR = new Date().getFullYear();
  const totalCount = customers.length;
  const vipCount   = enriched.filter((c) => c.totalSpent > 20000 || c.status === 'VIP').length;
  const newCount   = customers.filter((c) => new Date(c.joined).getFullYear() === CURRENT_YEAR).length;

  // Sort toggle
  const toggleSort = (field) => {
    setSortBy((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' }
    );
  };

  // Filter + sort
  const filtered = enriched
    .filter((c) => {
      const q = search.toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone?.includes(q);
    })
    .sort((a, b) => {
      const { field, dir } = sortBy;
      const va = a[field]; const vb = b[field];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va || 0) - (vb || 0);
      return dir === 'asc' ? cmp : -cmp;
    });

  const handleAdd    = useCallback((c) => setCustomers((prev) => [c, ...prev]), []);
  const handleSave   = useCallback((updated) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  }, []);
  const handleDelete = useCallback((id) => setCustomers((prev) => prev.filter((c) => c.id !== id)), []);

  const SortableHeader = ({ field, label }) => (
    <th
      className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}<SortIcon field={field} sortBy={sortBy} />
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Clientes</h1>
            <p className="text-slate-400 text-sm mt-0.5">Gestión de tu base de clientes</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Stat chips */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-700/60 border border-slate-600">
              <ShoppingBag size={12} /> {totalCount} Total
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-yellow-400 bg-yellow-900/30 border border-yellow-700">
              ♛ {vipCount} VIP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-700">
              <TrendingUp size={12} /> {newCount} Nuevos
            </span>
            {/* Add button */}
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-bold transition-colors">
              <Plus size={16} /> Nuevo cliente
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
        className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono…"
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none"
        />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <SortableHeader field="name"       label="Cliente"       />
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">Teléfono</th>
                <SortableHeader field="joined"     label="Registro"      />
                <SortableHeader field="orders"     label="Pedidos"       />
                <SortableHeader field="totalSpent" label="Total gastado" />
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">Estado</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    <ShoppingBag size={32} className="mx-auto mb-3 opacity-40" />
                    <p>No se encontraron clientes</p>
                    <button onClick={() => setShowAdd(true)}
                      className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm underline underline-offset-2">
                      + Agregar cliente
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((customer, idx) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelected(customer)}
                    className={`bg-slate-800/50 hover:bg-slate-800 border-b border-slate-700/50 cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id ? 'ring-1 ring-inset ring-yellow-500/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={customer.avatar} alt={customer.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0" />
                        <span className="text-slate-100 font-medium whitespace-nowrap">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{customer.email}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{customer.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(customer.joined)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-slate-200 font-semibold">{customer.orders}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-100 font-semibold whitespace-nowrap">
                      {customer.totalSpent > 0 ? formatPrice(customer.totalSpent) : '—'}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={customer.status} /></td>
                    <td className="px-4 py-3.5">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(customer); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-700 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Mostrando {filtered.length} de {customers.length} clientes
            </p>
          </div>
        )}
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && <AddCustomerModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDrawer
            key={selectedCustomer.id}
            customer={selectedCustomer}
            orders={orders}
            onClose={() => setSelected(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
