import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Mail, Phone, ShoppingBag, Heart,
  TrendingUp, X, Calendar,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMERS = [
  {
    id: 'c1',
    name: 'Sofía Martínez',
    email: 'sofia@email.com',
    phone: '+52 55 1234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80',
    joined: '2024-03-15',
    orders: 4,
    totalSpent: 18900,
    lastOrder: '2026-06-01',
    status: 'Activo',
  },
  {
    id: 'c2',
    name: 'Ana Pérez',
    email: 'ana@email.com',
    phone: '+52 33 9876-5432',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80',
    joined: '2023-11-20',
    orders: 7,
    totalSpent: 34500,
    lastOrder: '2026-05-20',
    status: 'Activo',
  },
  {
    id: 'c3',
    name: 'Carmen Villanueva',
    email: 'carmen@email.com',
    phone: '+52 81 5555-1234',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80',
    joined: '2024-01-08',
    orders: 2,
    totalSpent: 15700,
    lastOrder: '2026-05-08',
    status: 'Activo',
  },
  {
    id: 'c4',
    name: 'Isabella Fuentes',
    email: 'isa@email.com',
    phone: '+52 998 123-4567',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=60&q=80',
    joined: '2025-07-12',
    orders: 1,
    totalSpent: 1900,
    lastOrder: '2026-06-03',
    status: 'Activo',
  },
  {
    id: 'c5',
    name: 'Gabriela Moreno',
    email: 'gaby@email.com',
    phone: '+52 55 8888-9999',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=60&q=80',
    joined: '2023-06-30',
    orders: 9,
    totalSpent: 67200,
    lastOrder: '2026-05-15',
    status: 'VIP',
  },
  {
    id: 'c6',
    name: 'Mariana Ríos',
    email: 'mari@email.com',
    phone: '+52 442 333-4444',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80',
    joined: '2026-01-05',
    orders: 1,
    totalSpent: 3400,
    lastOrder: '2026-06-05',
    status: 'Nuevo',
  },
];

// Fake order history per customer (shared pool, rotated by index)
const FAKE_ORDER_HISTORY = [
  { id: 'SGC-51029', date: '2026-06-01', total: 5200,  status: 'Procesando' },
  { id: 'SGC-48291', date: '2026-05-20', total: 4800,  status: 'Entregado'  },
  { id: 'SGC-39145', date: '2026-05-08', total: 12500, status: 'Entregado'  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    VIP:    'text-yellow-400 bg-yellow-900/30 border border-yellow-700',
    Activo: 'text-emerald-400 bg-emerald-900/30 border border-emerald-700',
    Nuevo:  'text-blue-400 bg-blue-900/30 border border-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || map.Activo}`}>
      {status === 'VIP' && '♛ '}
      {status}
    </span>
  );
}

// ─── Order Status Mini-badge ──────────────────────────────────────────────────

function MiniOrderBadge({ status }) {
  const map = {
    Procesando: 'text-yellow-400 bg-yellow-900/30',
    'En camino': 'text-blue-400 bg-blue-900/30',
    Entregado:  'text-emerald-400 bg-emerald-900/30',
    Cancelado:  'text-red-400 bg-red-900/30',
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

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function CustomerDrawer({ customer, onClose }) {
  const [notes, setNotes] = useState('');

  const wishlistCount = Math.floor(customer.totalSpent / 5000) + 2;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Perfil del cliente</p>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Identity */}
          <div className="flex flex-col items-center text-center gap-3">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-600 shadow-lg"
            />
            <div>
              <h3 className="text-slate-100 font-bold text-lg leading-tight">{customer.name}</h3>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <StatusBadge status={customer.status} />
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-xs">
                <Calendar size={12} />
                <span>Cliente desde {formatDate(customer.joined)}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Pedidos', value: customer.orders, icon: ShoppingBag, color: 'text-blue-400' },
              { label: 'Gastado', value: formatPrice(customer.totalSpent), icon: TrendingUp, color: 'text-yellow-400' },
              { label: 'Wishlist', value: wishlistCount, icon: Heart, color: 'text-pink-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <Icon size={16} className={color} />
                <p className="text-slate-100 font-bold text-sm leading-tight">{value}</p>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-slate-700/40 rounded-xl p-4 space-y-2.5">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Contacto</p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone size={13} className="text-slate-400 shrink-0" />
              <span>{customer.phone}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              <Mail size={14} />
              Enviar email
            </a>
            <a
              href={`tel:${customer.phone.replace(/\s|-/g, '')}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold text-sm transition-colors"
            >
              <Phone size={14} />
              Llamar
            </a>
          </div>

          {/* Order History */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Historial de pedidos</p>
            <div className="space-y-2">
              {FAKE_ORDER_HISTORY.slice(0, Math.min(customer.orders, 3)).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-slate-700/40 rounded-lg px-3 py-2.5 hover:bg-slate-700/60 transition-colors"
                >
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
              {customer.orders > 3 && (
                <p className="text-center text-xs text-slate-500 pt-1">
                  +{customer.orders - 3} pedidos más
                </p>
              )}
            </div>
          </div>

          {/* Last Order */}
          <div className="bg-slate-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
            <ShoppingBag size={16} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Último pedido</p>
              <p className="text-slate-200 text-sm font-medium">{formatDate(customer.lastOrder)}</p>
            </div>
          </div>

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
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

export default function Customers() {
  const [search, setSearch]               = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy]               = useState({ field: 'totalSpent', dir: 'desc' });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount  = MOCK_CUSTOMERS.length;
  const vipCount    = MOCK_CUSTOMERS.filter((c) => c.totalSpent > 20000).length;
  const newCount    = MOCK_CUSTOMERS.filter(
    (c) => new Date(c.joined).getFullYear() === CURRENT_YEAR,
  ).length;

  // ── Sorting ────────────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    setSortBy((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' },
    );
  };

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = MOCK_CUSTOMERS
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    })
    .sort((a, b) => {
      const { field, dir } = sortBy;
      const va = a[field];
      const vb = b[field];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return dir === 'asc' ? cmp : -cmp;
    });

  // Escape key
  useState(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelectedCustomer(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const SortableHeader = ({ field, label }) => (
    <th
      className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}
      <SortIcon field={field} sortBy={sortBy} />
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Clientes</h1>
            <p className="text-slate-400 text-sm mt-0.5">Base de clientes registrados</p>
          </div>
          {/* Stat chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-700/60 border border-slate-600">
              <ShoppingBag size={12} />
              {totalCount} Total
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-yellow-400 bg-yellow-900/30 border border-yellow-700">
              ♛ {vipCount} VIP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-700">
              <TrendingUp size={12} />
              {newCount} Nuevos
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.06 }}
        className="relative mb-5 max-w-sm"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono…"
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
                  Cliente
                </th>
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
                  Email
                </th>
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
                  Teléfono
                </th>
                <SortableHeader field="joined" label="Registro" />
                <SortableHeader field="orders" label="Pedidos" />
                <SortableHeader field="totalSpent" label="Total gastado" />
                <th className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
                  Estado
                </th>
                <th className="px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    <ShoppingBag size={32} className="mx-auto mb-3 opacity-40" />
                    <p>No se encontraron clientes</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer, idx) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`bg-slate-800/50 hover:bg-slate-800 border-b border-slate-700/50 cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id ? 'ring-1 ring-inset ring-yellow-500/40' : ''
                    }`}
                  >
                    {/* Avatar + name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                        />
                        <span className="text-slate-100 font-medium whitespace-nowrap">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{customer.email}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(customer.joined)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-slate-200 font-semibold">{customer.orders}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-100 font-semibold whitespace-nowrap">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Mostrando {filtered.length} de {MOCK_CUSTOMERS.length} clientes
            </p>
          </div>
        )}
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDrawer
            key={selectedCustomer.id}
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
