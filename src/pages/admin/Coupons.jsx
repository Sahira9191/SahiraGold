import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Edit, Trash2, Copy, X, Check, Calendar, Percent, DollarSign, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import supabase from '../../lib/supabase';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = n =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const isExpired = dateStr => new Date(dateStr) < new Date();

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Map DB snake_case → camelCase
const fromDb = (r) => ({
  id: r.id,
  code: r.code,
  type: r.type,
  value: Number(r.value),
  minPurchase: Number(r.min_purchase),
  maxUses: r.max_uses,
  uses: r.uses,
  expires: r.expires,
  active: r.active,
});

// Map camelCase → DB snake_case
const toDb = (c) => ({
  code: c.code,
  type: c.type,
  value: c.value,
  min_purchase: c.minPurchase,
  max_uses: c.maxUses,
  expires: c.expires,
  active: c.active,
});

const EMPTY_FORM = {
  code: '', type: 'percent', value: 10,
  minPurchase: 0, maxUses: 9999, expires: '', active: true,
};

// ─── CouponCard ────────────────────────────────────────────────────────────────

function CouponCard({ coupon, onEdit, onDelete, onToggle }) {
  const expired   = isExpired(coupon.expires);
  const usagePct  = coupon.maxUses > 0 ? Math.min((coupon.uses / coupon.maxUses) * 100, 100) : 0;
  const exhausted = coupon.uses >= coupon.maxUses;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => toast.success('Código copiado'));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: expired ? 0.55 : 1, scale: 1 }}
      className={`relative bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed ${
        expired || exhausted ? 'border-slate-700' : 'border-yellow-500/50'
      }`}
    >
      {(expired || exhausted) && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 border border-red-700/50">
            {expired ? 'Expirado' : 'Agotado'}
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Code + discount */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Tag size={18} className="text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono font-bold text-yellow-400 text-xl tracking-widest leading-tight">{coupon.code}</p>
            <div className="flex items-center gap-2 mt-1">
              {coupon.type === 'percent' ? (
                <span className="flex items-center gap-1 text-sm text-slate-300">
                  <Percent size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{coupon.value}%</span> descuento
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-slate-300">
                  <DollarSign size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{fmt(coupon.value)}</span> de descuento
                </span>
              )}
            </div>
            {coupon.minPurchase > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">Mínimo {fmt(coupon.minPurchase)}</p>
            )}
          </div>
        </div>

        {/* Usage */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Usos</span>
            <span className="font-medium">
              <span className={exhausted ? 'text-red-400' : 'text-slate-200'}>{coupon.uses}</span>
              <span className="text-slate-600"> / {coupon.maxUses >= 9999 ? '∞' : coupon.maxUses}</span>
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                usagePct >= 100 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(usagePct, 100)}%` }}
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={13} />
          <span>Vence el {new Date(coupon.expires + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-700">
          <button
            onClick={() => onToggle(coupon)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              coupon.active
                ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
            }`}
          >
            {coupon.active ? <Check size={13} /> : <X size={13} />}
            {coupon.active ? 'Activo' : 'Inactivo'}
          </button>
          <div className="flex gap-1.5">
            <button onClick={handleCopy} title="Copiar código"
              className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-yellow-400 transition-colors">
              <Copy size={14} />
            </button>
            <button onClick={() => onEdit(coupon)} title="Editar"
              className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-yellow-400 transition-colors">
              <Edit size={14} />
            </button>
            <button onClick={() => onDelete(coupon)} title="Eliminar"
              className="p-1.5 rounded-md bg-slate-700 hover:bg-red-900/40 text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function CouponModal({ editCoupon, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(
    editCoupon
      ? { code: editCoupon.code, type: editCoupon.type, value: editCoupon.value, minPurchase: editCoupon.minPurchase, maxUses: editCoupon.maxUses, expires: editCoupon.expires, active: editCoupon.active }
      : { ...EMPTY_FORM }
  );

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.code.trim()) { toast.error('El código es requerido'); return; }
    if (!form.expires)      { toast.error('La fecha de vencimiento es requerida'); return; }
    if (form.value <= 0)    { toast.error('El valor debe ser mayor a 0'); return; }
    onSubmit(form);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl z-10"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-yellow-400" />
            <h3 className="text-slate-100 font-semibold">{editCoupon ? 'Editar cupón' : 'Nuevo cupón'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Código *</label>
            <div className="flex gap-2">
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 font-mono text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400 uppercase"
                placeholder="SAHIRA10"
              />
              <button onClick={() => set('code', generateCode())}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg border border-slate-600 transition-colors whitespace-nowrap">
                Generar
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tipo de descuento</label>
            <div className="flex gap-3">
              {[{ val: 'percent', label: 'Porcentaje', icon: Percent }, { val: 'fixed', label: 'Monto fijo', icon: DollarSign }].map(opt => (
                <label key={opt.val} className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value={opt.val} checked={form.type === opt.val} onChange={() => set('type', opt.val)} className="sr-only" />
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    form.type === opt.val ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}>
                    <opt.icon size={15} />{opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              {form.type === 'percent' ? 'Porcentaje (%)' : 'Monto (USD)'} *
            </label>
            <input type="number" min={1} max={form.type === 'percent' ? 100 : undefined} value={form.value}
              onChange={e => set('value', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Compra mínima (USD)</label>
              <input type="number" min={0} value={form.minPurchase}
                onChange={e => set('minPurchase', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Usos máximos</label>
              <input type="number" min={1} value={form.maxUses}
                onChange={e => set('maxUses', parseInt(e.target.value) || 9999)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fecha de vencimiento *</label>
            <input type="date" value={form.expires} onChange={e => set('expires', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-4 py-3">
            <span className="text-sm text-slate-300 font-medium">Cupón activo</span>
            <button onClick={() => set('active', !form.active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-yellow-500' : 'bg-slate-600'}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={15} />}
            {editCoupon ? 'Guardar cambios' : 'Crear cupón'}
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

// ─── Stats ─────────────────────────────────────────────────────────────────────

function StatsBar({ coupons }) {
  const active    = coupons.filter(c => c.active && !isExpired(c.expires)).length;
  const expired   = coupons.filter(c => isExpired(c.expires)).length;
  const totalUses = coupons.reduce((acc, c) => acc + c.uses, 0);
  const stats = [
    { label: 'Total cupones', value: coupons.length, color: 'text-slate-100'   },
    { label: 'Activos',       value: active,          color: 'text-emerald-400' },
    { label: 'Expirados',     value: expired,         color: 'text-red-400'     },
    { label: 'Usos totales',  value: totalUses,       color: 'text-yellow-400'  },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Coupons() {
  const [coupons,    setCoupons]   = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [saving,     setSaving]    = useState(false);
  const [showModal,  setShowModal] = useState(false);
  const [editCoupon, setEdit]      = useState(null);

  // Fetch coupons from Supabase
  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Error al cargar cupones: ' + error.message); }
    else { setCoupons((data || []).map(fromDb)); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const openCreate = () => { setEdit(null); setShowModal(true); };
  const openEdit   = c  => { setEdit(c);    setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEdit(null); };

  const handleSubmit = async (form) => {
    setSaving(true);
    if (editCoupon) {
      const { error } = await supabase.from('coupons').update(toDb(form)).eq('id', editCoupon.id);
      if (error) { toast.error('Error: ' + error.message); }
      else { toast.success('Cupón actualizado ✓'); await fetchCoupons(); closeModal(); }
    } else {
      const { error } = await supabase.from('coupons').insert(toDb(form));
      if (error) { toast.error('Error: ' + error.message); }
      else { toast.success('Cupón creado ✓'); await fetchCoupons(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`¿Eliminar el cupón ${coupon.code}?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) { toast.error('Error: ' + error.message); }
    else { toast.success('Cupón eliminado'); setCoupons(prev => prev.filter(c => c.id !== coupon.id)); }
  };

  const handleToggle = async (coupon) => {
    const { error } = await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id);
    if (error) { toast.error('Error: ' + error.message); }
    else { setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c)); }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Tag size={18} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-slate-100 font-bold text-xl">Cupones</h1>
              <p className="text-slate-400 text-sm">Gestiona los códigos de descuento — guardados en la nube ☁️</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCoupons} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors" title="Recargar">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
              <Plus size={15} /> Nuevo cupón
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-yellow-400" />
          </div>
        ) : (
          <>
            <StatsBar coupons={coupons} />
            {coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Tag size={40} className="text-slate-700 mb-3" />
                <p className="text-slate-400 font-medium">No hay cupones</p>
                <p className="text-slate-600 text-sm mt-1">Crea el primer cupón de descuento</p>
                <button onClick={openCreate}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
                  <Plus size={15} /> Crear cupón
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {coupons.map(c => (
                    <CouponCard key={c.id} coupon={c} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <CouponModal editCoupon={editCoupon} onClose={closeModal} onSubmit={handleSubmit} saving={saving} />
        )}
      </AnimatePresence>
    </div>
  );
}
