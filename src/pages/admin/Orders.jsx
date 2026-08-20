import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, X, Package, Truck, CheckCircle,
  XCircle, Clock, MapPin, Phone, Mail, Printer, Plus,
  ChevronDown, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { lsGet, lsSet } from '../../lib/storage';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().split('T')[0];
const now   = () => new Date().toISOString();

// ─── Default orders ──────────────────────────────────────────────────────────

const DEFAULT_ORDERS = [
  {
    id: 'SGC-51029',
    customer: { name: 'Sofía Martínez', email: 'sofia@email.com', phone: '+52 55 1234-5678' },
    date: '2026-08-18',
    items: [
      { name: 'Anillo Eternidad', qty: 1, price: 2800, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=80&q=80' },
      { name: 'Aretes Pavé',      qty: 2, price: 1200, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=80&q=80' },
    ],
    total: 5200, status: 'Procesando', address: 'Av. Insurgentes Sur 1234, CDMX', tracking: '', notes: '',
  },
  {
    id: 'SGC-48291',
    customer: { name: 'Ana Pérez', email: 'ana@email.com', phone: '+52 33 9876-5432' },
    date: '2026-08-15',
    items: [{ name: 'Collar Perla Tahití', qty: 1, price: 4800, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=80&q=80' }],
    total: 4800, status: 'Entregado', address: 'Calle Madero 567, Guadalajara', tracking: 'FX9281047MX', notes: '',
  },
  {
    id: 'SGC-39145',
    customer: { name: 'Carmen Villanueva', email: 'carmen@email.com', phone: '+52 81 5555-1234' },
    date: '2026-08-10',
    items: [{ name: 'Pulsera Tennis', qty: 1, price: 12500, image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=80&q=80' }],
    total: 12500, status: 'Entregado', address: 'Av. Garza Sada 2501, Monterrey', tracking: 'FX1928374MX', notes: 'Empaque especial solicitado.',
  },
  {
    id: 'SGC-55821',
    customer: { name: 'Isabella Fuentes', email: 'isa@email.com', phone: '+52 998 123-4567' },
    date: '2026-08-19',
    items: [{ name: 'Aretes Rubí Lágrima', qty: 1, price: 1900, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=80&q=80' }],
    total: 1900, status: 'En camino', address: 'Blvd. Kukulcán Km 12, Cancún', tracking: 'FX7654321MX', notes: '',
  },
  {
    id: 'SGC-47103',
    customer: { name: 'Gabriela Moreno', email: 'gaby@email.com', phone: '+52 55 8888-9999' },
    date: '2026-08-12',
    items: [{ name: 'Anillo Solitario', qty: 1, price: 6700, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=80&q=80' }],
    total: 6700, status: 'Entregado', address: 'Polanco, CDMX', tracking: 'FX3344556MX', notes: '',
  },
  {
    id: 'SGC-61002',
    customer: { name: 'Mariana Ríos', email: 'mari@email.com', phone: '+52 442 333-4444' },
    date: '2026-08-20',
    items: [{ name: 'Collar Gargantilla', qty: 1, price: 3400, image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=80&q=80' }],
    total: 3400, status: 'Procesando', address: 'Centro Histórico, Querétaro', tracking: '', notes: '',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
  Procesando:  { color: 'text-yellow-400 bg-yellow-900/30 border border-yellow-700',   icon: Clock },
  'En camino': { color: 'text-blue-400 bg-blue-900/30 border border-blue-700',         icon: Truck },
  Entregado:   { color: 'text-emerald-400 bg-emerald-900/30 border border-emerald-700', icon: CheckCircle },
  Cancelado:   { color: 'text-red-400 bg-red-900/30 border border-red-700',             icon: XCircle },
};
const STATUS_STEPS = ['Procesando', 'En camino', 'Entregado'];
const TABS = ['Todos', 'Procesando', 'En camino', 'Entregado', 'Cancelado'];

// ─── localStorage persistence ─────────────────────────────────────────────────

function loadOrders() {
  return lsGet('orders', DEFAULT_ORDERS);
}
function saveOrders(orders) {
  lsSet('orders', orders);
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.Procesando;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

// ─── New Order Modal ──────────────────────────────────────────────────────────

function NewOrderModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    address: '',
    itemName: '', itemQty: 1, itemPrice: 0,
    status: 'Procesando',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.customerName.trim()) { toast.error('El nombre del cliente es requerido'); return; }
    if (!form.itemName.trim())     { toast.error('El nombre del artículo es requerido'); return; }
    if (!form.itemPrice)           { toast.error('El precio es requerido'); return; }

    const total = form.itemPrice * form.itemQty;
    const newOrder = {
      id: `SGC-${Date.now().toString().slice(-5)}`,
      customer: { name: form.customerName, email: form.customerEmail, phone: form.customerPhone },
      date: today(),
      items: [{ name: form.itemName, qty: Number(form.itemQty), price: Number(form.itemPrice), image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=80&q=80' }],
      total,
      status: form.status,
      address: form.address,
      tracking: '',
      notes: '',
    };
    onSave(newOrder);
    toast.success(`Pedido ${newOrder.id} creado`);
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-slate-100 font-semibold text-lg">Nuevo pedido</h3>
          <button onClick={onClose} className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Cliente</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
              <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                placeholder="Sofía Martínez" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                placeholder="sofia@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
              <input value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                placeholder="+52 55 1234 5678" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Estado inicial</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none">
                {Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Dirección de entrega</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
              placeholder="Av. Insurgentes Sur 1234, CDMX" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold pt-2">Artículo</p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre del artículo *</label>
            <input value={form.itemName} onChange={e => set('itemName', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
              placeholder="Anillo Eternidad" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cantidad</label>
              <input type="number" min={1} value={form.itemQty} onChange={e => set('itemQty', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Precio unitario (MXN) *</label>
              <input type="number" min={0} value={form.itemPrice} onChange={e => set('itemPrice', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none" />
            </div>
          </div>
          {form.itemPrice > 0 && (
            <p className="text-sm text-yellow-400 font-semibold">Total: {formatPrice(form.itemPrice * form.itemQty)}</p>
          )}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
            Crear pedido
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg border border-slate-600 transition-colors">
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Drawer ─────────────────────────────────────────────────────────────

function OrderDrawer({ order, onClose, onUpdate }) {
  const [newStatus,      setNewStatus]      = useState(order.status);
  const [trackingInput,  setTrackingInput]  = useState(order.tracking || '');
  const [notes,          setNotes]          = useState(order.notes   || '');

  // Keep drawer in sync if order updates from outside
  useEffect(() => {
    setNewStatus(order.status);
    setTrackingInput(order.tracking || '');
    setNotes(order.notes || '');
  }, [order.id]);

  const save = (patch) => {
    onUpdate({ ...order, ...patch });
    toast.success('Pedido actualizado ✓');
  };

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-slate-800 border-l border-slate-700 z-50 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pedido</p>
            <h3 className="text-slate-100 font-bold text-lg leading-tight">{order.id}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
              <Printer size={17} />
            </button>
            <button onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Customer */}
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2.5">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Cliente</p>
            <p className="text-slate-100 font-semibold">{order.customer.name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail size={13} /><span className="truncate">{order.customer.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Phone size={13} /><span>{order.customer.phone || '—'}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <MapPin size={13} className="mt-0.5 shrink-0" /><span>{order.address || '—'}</span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Artículos</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs">Cant: {item.qty}</p>
                  </div>
                  <p className="text-slate-100 text-sm font-semibold shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-700/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span><span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Envío</span><span>Gratis</span>
            </div>
            <div className="border-t border-slate-600 pt-2 flex justify-between text-slate-100 font-bold">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Estado del pedido</p>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const reached   = i <= stepIndex;
                const isCurrent = i === stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent ? 'border-yellow-500 bg-yellow-500/20'
                        : reached ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-slate-600 bg-slate-700'}`}>
                        {reached && !isCurrent ? <CheckCircle size={14} className="text-emerald-400" />
                          : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                      </div>
                      <span className={`text-[10px] font-medium text-center ${
                        isCurrent ? 'text-yellow-400' : reached ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < stepIndex ? 'bg-emerald-600' : 'bg-slate-600'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Change status */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Cambiar estado</p>
            <div className="flex gap-2">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none">
                {Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => save({ status: newStatus })}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm transition-colors">
                Guardar
              </button>
            </div>
          </div>

          {/* Tracking */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Número de guía</p>
            <div className="flex gap-2">
              <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                placeholder="Ej. FX1234567MX"
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none" />
              <button onClick={() => save({ tracking: trackingInput })}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 font-semibold text-sm transition-colors">
                Guardar
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pb-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Notas internas</p>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notas visibles solo para el equipo…"
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 outline-none resize-none" />
            <button onClick={() => save({ notes })}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-semibold transition-colors">
              Guardar notas
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Orders() {
  const [orders,        setOrders]        = useState(loadOrders);
  const [activeTab,     setActiveTab]     = useState('Todos');
  const [search,        setSearch]        = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewModal,  setShowNewModal]  = useState(false);

  // Persist every time orders change
  useEffect(() => { saveOrders(orders); }, [orders]);

  // Escape key closes drawer
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { setSelectedOrder(null); setShowNewModal(false); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateOrder = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);
  };

  const addOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Counts
  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'Todos' ? orders.length : orders.filter(o => o.status === tab).length;
    return acc;
  }, {});

  // Filter
  const q        = search.toLowerCase();
  const filtered = orders.filter(o => {
    const matchTab    = activeTab === 'Todos' || o.status === activeTab;
    const matchSearch = !q || o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pedidos</h1>
            <p className="text-slate-400 text-sm mt-0.5">Gestión y seguimiento de órdenes</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Stat chips */}
            {TABS.filter(t => t !== 'Todos').map(tab => {
              const cfg  = STATUS[tab];
              const Icon = cfg?.icon || Package;
              return (
                <span key={tab}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg?.color || ''}`}>
                  <Icon size={12} />
                  {counts[tab]} {tab}
                </span>
              );
            })}
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
              <Plus size={15} /> Nuevo pedido
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex gap-1 border-b border-slate-700 mb-5 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'text-yellow-400 border-yellow-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
            {tab}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por ID, cliente o email…"
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none" />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                {['Pedido', 'Cliente', 'Fecha', 'Artículos', 'Total', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-slate-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <Package size={32} className="mx-auto mb-3 opacity-40" />
                    <p>No se encontraron pedidos</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <motion.tr key={order.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedOrder(order)}
                    className={`hover:bg-slate-800 border-b border-slate-700/50 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? 'ring-1 ring-inset ring-yellow-500/40 bg-slate-800' : 'bg-slate-800/50'}`}>
                    <td className="px-4 py-3.5 font-mono text-yellow-400 font-medium whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-200 font-medium">{order.customer.name}</p>
                      <p className="text-slate-500 text-xs">{order.customer.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(order.date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-100 font-semibold whitespace-nowrap">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5">
                      <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
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
          <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500">Mostrando {filtered.length} de {orders.length} pedidos</p>
          </div>
        )}
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDrawer key={selectedOrder.id}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={updateOrder}
          />
        )}
      </AnimatePresence>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewModal && (
          <NewOrderModal onClose={() => setShowNewModal(false)} onSave={addOrder} />
        )}
      </AnimatePresence>
    </div>
  );
}
