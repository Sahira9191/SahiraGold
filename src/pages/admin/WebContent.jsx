import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Image, Edit, Trash2, Plus, ChevronUp, ChevronDown,
  Check, X, Eye, Save, Layout, Star, MessageSquare, Megaphone, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { lsGet, lsSet } from '../../lib/storage';
import useWebContentStore from '../../store/webContentStore';

// ─── Initial data ──────────────────────────────────────────────────────────────

const INITIAL_BANNERS = [
  { id: 1, stone: 'Diamante', tag: '✦ Pureza Eterna ✦', title: 'Brillos que / Conquistan / el Tiempo', subtitle: 'Diamantes certificados GIA engastados en oro 18K artesanal.', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', active: true },
  { id: 2, stone: 'Rubí', tag: '✦ Pasión & Elegancia ✦', title: 'El Fuego del / Rubí / en tus Manos', subtitle: 'Rubíes birmanos de primera calidad, color sangre de paloma.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', active: true },
  { id: 3, stone: 'Esmeralda', tag: '✦ Naturaleza Pura ✦', title: 'El Verde / Profundo de la / Esmeralda', subtitle: 'Esmeraldas colombianas de talla rectangular, engaste en garra.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', active: true },
  { id: 4, stone: 'Perla', tag: '✦ Gracia Natural ✦', title: 'Perlas que / Cuentan una / Historia', subtitle: 'Perlas Tahití y Akoya seleccionadas a mano.', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', active: true },
  { id: 5, stone: 'Zafiro', tag: '✦ Profundidad Real ✦', title: 'Zafiros / Azules de la / Realeza', subtitle: 'Zafiros de Cachemira y Ceilán.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', active: true },
  { id: 6, stone: 'Oro', tag: '✦ Artesanía Ancestral ✦', title: 'El Arte del / Oro en cada / Detalle', subtitle: 'Colecciones de oro 24K y 18K trabajadas a mano.', image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=400&q=80', active: true },
];

const INITIAL_COLLECTIONS = [
  { id: 'c1', name: 'Anillos', subtitle: 'Desde solitarios hasta eternidades', slug: 'anillos', count: 48, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
  { id: 'c2', name: 'Collares', subtitle: 'Elegancia alrededor de tu cuello', slug: 'collares', count: 35, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
  { id: 'c3', name: 'Aretes', subtitle: 'Del día a la noche', slug: 'aretes', count: 62, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { id: 'c4', name: 'Pulseras', subtitle: 'Brillos en tu muñeca', slug: 'pulseras', count: 29, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
];

const INITIAL_TESTIMONIALS = [
  { id: 't1', name: 'Valentina Ríos', location: 'Ciudad de México', product: 'Anillo Diamante Solitario', rating: 5, text: 'La pieza llegó perfectamente empacada y superó mis expectativas. La calidad del oro es impresionante y el diamante brilla de manera extraordinaria.', avatarUrl: 'https://i.pravatar.cc/80?img=47' },
  { id: 't2', name: 'Mariana Gutiérrez', location: 'Monterrey, NL', product: 'Collar Esmeralda', rating: 5, text: 'Compré el collar de esmeralda como regalo de aniversario y mi esposo quedó encantado. La atención fue personalizada y muy profesional.', avatarUrl: 'https://i.pravatar.cc/80?img=32' },
  { id: 't3', name: 'Sofía Mendoza', location: 'Guadalajara, JAL', product: 'Aretes de Rubí', rating: 5, text: 'Los aretes de rubí son simplemente mágicos. Los uso en cada ocasión especial y siempre recibo cumplidos. Definitivamente volvería a comprar.', avatarUrl: 'https://i.pravatar.cc/80?img=25' },
  { id: 't4', name: 'Isabella Torres', location: 'Puebla, PUE', product: 'Pulsera Perla Tahití', rating: 5, text: 'Mi pulsera de perlas llegó en tiempo y forma. La caja de joyería de regalo fue un detalle precioso. Excelente experiencia de compra.', avatarUrl: 'https://i.pravatar.cc/80?img=56' },
];

const ANNOUNCEMENT_PRESETS = [
  { label: 'Negro', bg: 'bg-black', text: 'text-white', value: 'black' },
  { label: 'Obsidiana', bg: 'bg-slate-900', text: 'text-slate-100', value: 'obsidian' },
  { label: 'Dorado', bg: 'bg-yellow-500', text: 'text-slate-950', value: 'gold' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTab({ id, icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-yellow-500 text-slate-950'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ─── SECTION 1: Hero Banners ───────────────────────────────────────────────────

function BannerCard({ banner, index, total, onMove, onToggle, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ ...banner });

  const handleField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    onSave(banner.id, form);
    setExpanded(false);
    toast.success('Banner actualizado');
  };

  return (
    <motion.div
      layout
      className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={banner.image}
          alt={banner.stone}
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 font-semibold text-sm">{banner.stone}</p>
          <p className="text-slate-400 text-xs truncate">{banner.tag}</p>
          <p className="text-slate-500 text-xs truncate">{banner.title.replace(/ \/ /g, ' ')}</p>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1}
            className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => onToggle(banner.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              banner.active
                ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
            }`}
          >
            {banner.active ? 'Activo' : 'Inactivo'}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-yellow-400"
          >
            <Edit size={14} />
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700 pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Piedra / Nombre</label>
                  <input
                    value={form.stone}
                    onChange={e => handleField('stone', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tag / Etiqueta</label>
                  <input
                    value={form.tag}
                    onChange={e => handleField('tag', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Título (usa / para saltos de línea)</label>
                <input
                  value={form.title}
                  onChange={e => handleField('title', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subtítulo</label>
                <textarea
                  value={form.subtitle}
                  onChange={e => handleField('subtitle', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">URL de imagen</label>
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={e => handleField('image', e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
                  />
                  {form.image && (
                    <img src={form.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
                >
                  <Save size={14} /> Guardar
                </button>
                <button
                  onClick={() => { setForm({ ...banner }); setExpanded(false); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg border border-slate-600 transition-colors"
                >
                  <X size={14} /> Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HeroBannersSection() {
  const storeBanners   = useWebContentStore(s => s.banners);
  const setBannersStore = useWebContentStore(s => s.setBanners);
  const [banners, setBanners] = useState(storeBanners);

  const moveBanner = (index, dir) => {
    const next = [...banners];
    const swap = dir === 'up' ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    setBanners(next);
  };

  const toggleBanner = id => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const saveBanner = (id, updated) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const handleSaveAll = () => {
    setBannersStore(banners);
    toast.success('✓ Banners guardados — ya se ven en la tienda');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Hero Banners</h2>
          <p className="text-slate-400 text-sm">Gestiona los slides del carrusel principal de la tienda.</p>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          <Save size={15} /> Guardar cambios
        </button>
      </div>

      <div className="space-y-2">
        {banners.map((banner, index) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            index={index}
            total={banners.length}
            onMove={moveBanner}
            onToggle={toggleBanner}
            onSave={saveBanner}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 2: Colecciones ────────────────────────────────────────────────────

function CollectionCard({ collection, onSave }) {
  const [form, setForm] = useState({ ...collection });
  const [dirty, setDirty] = useState(false);

  const handleField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(collection.id, form);
    setDirty(false);
    toast.success(`Colección "${form.name}" guardada`);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="relative">
        <img
          src={form.image}
          alt={form.name}
          className="w-full h-36 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <span className="absolute bottom-2 left-3 text-white font-bold text-sm">{form.name}</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">URL de imagen</label>
          <input
            value={form.image}
            onChange={e => handleField('image', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-xs rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400"
            placeholder="https://..."
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre</label>
            <input
              value={form.name}
              onChange={e => handleField('name', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={e => handleField('slug', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Subtítulo</label>
          <input
            value={form.subtitle}
            onChange={e => handleField('subtitle', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Número de productos</label>
          <input
            type="number"
            value={form.count}
            onChange={e => handleField('count', parseInt(e.target.value) || 0)}
            className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          <Save size={14} /> Guardar colección
        </button>
      </div>
    </div>
  );
}

function CollectionsSection() {
  const storeCollections  = useWebContentStore(s => s.collections);
  const setCollectionsStore = useWebContentStore(s => s.setCollections);
  const [collections, setCollections] = useState(storeCollections);

  const saveCollection = (id, updated) => {
    setCollections(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updated } : c);
      setCollectionsStore(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-slate-100 font-semibold text-lg">Colecciones destacadas</h2>
        <p className="text-slate-400 text-sm">Edita las 4 colecciones que se muestran en la página principal.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map(col => (
          <CollectionCard key={col.id} collection={col} onSave={saveCollection} />
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 3: Testimonios ────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(null)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={16}
            className={
              n <= (hovered ?? value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            }
          />
        </button>
      ))}
    </div>
  );
}

const EMPTY_TESTIMONIAL = { name: '', location: '', product: '', text: '', avatarUrl: '', rating: 5 };

function TestimonialsSection() {
  const storeTestimonials  = useWebContentStore(s => s.testimonials);
  const setTestimonialsStore = useWebContentStore(s => s.setTestimonials);
  const [testimonials, setTestimonials] = useState(storeTestimonials);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_TESTIMONIAL);

  const persist = (next) => { setTestimonialsStore(next); return next; };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_TESTIMONIAL);
    setShowModal(true);
  };

  const openEdit = t => {
    setEditId(t.id);
    setForm({ name: t.name, location: t.location, product: t.product, text: t.text, avatarUrl: t.avatarUrl, rating: t.rating });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Nombre y texto son requeridos');
      return;
    }
    if (editId) {
      setTestimonials(prev => persist(prev.map(t => t.id === editId ? { ...t, ...form } : t)));
      toast.success('✓ Testimonio actualizado');
    } else {
      setTestimonials(prev => persist([...prev, { id: `t${Date.now()}`, ...form }]));
      toast.success('✓ Testimonio agregado');
    }
    closeModal();
  };

  const handleDelete = id => {
    setTestimonials(prev => persist(prev.filter(t => t.id !== id)));
    toast.success('✓ Testimonio eliminado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Testimonios</h2>
          <p className="text-slate-400 text-sm">Reseñas destacadas que aparecen en la tienda.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      <div className="space-y-3">
        {testimonials.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4"
          >
            <img
              src={t.avatarUrl || `https://i.pravatar.cc/80?u=${t.id}`}
              alt={t.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-slate-100 font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.location} · {t.product}</p>
                  <StarRating value={t.rating} />
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-yellow-400 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-md bg-slate-700 hover:bg-red-900/40 text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed line-clamp-2">{t.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-700">
                <h3 className="text-slate-100 font-semibold">
                  {editId ? 'Editar testimonio' : 'Nuevo testimonio'}
                </h3>
                <button onClick={closeModal} className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                    <input
                      value={form.name}
                      onChange={e => handleField('name', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400"
                      placeholder="Valentina Ríos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Ubicación</label>
                    <input
                      value={form.location}
                      onChange={e => handleField('location', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400"
                      placeholder="Ciudad de México"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Producto comprado</label>
                  <input
                    value={form.product}
                    onChange={e => handleField('product', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400"
                    placeholder="Anillo Diamante Solitario"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">URL de avatar</label>
                  <input
                    value={form.avatarUrl}
                    onChange={e => handleField('avatarUrl', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Calificación</label>
                  <StarRating value={form.rating} onChange={v => handleField('rating', v)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Texto del testimonio *</label>
                  <textarea
                    value={form.text}
                    onChange={e => handleField('text', e.target.value)}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400 resize-none"
                    placeholder="Escribe el testimonio aquí..."
                  />
                </div>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
                >
                  <Check size={15} /> {editId ? 'Guardar cambios' : 'Agregar testimonio'}
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg border border-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SECTION 4: Announcement Bar ──────────────────────────────────────────────

function AnnouncementSection() {
  const storeAnnouncement = useWebContentStore(s => s.announcement);
  const setAnnouncementStore = useWebContentStore(s => s.setAnnouncement);
  const [text, setText] = useState(storeAnnouncement.text);
  const [colorPreset, setColorPreset] = useState(storeAnnouncement.color);

  const preset = ANNOUNCEMENT_PRESETS.find(p => p.value === colorPreset) ?? ANNOUNCEMENT_PRESETS[0];

  const handleSave = () => {
    setAnnouncementStore({ text, color: colorPreset });
    toast.success('✓ Barra de anuncio guardada — ya se ve en la tienda');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-100 font-semibold text-lg">Barra de anuncio</h2>
        <p className="text-slate-400 text-sm">Texto que aparece en la parte superior de la tienda.</p>
      </div>

      {/* Preview */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-semibold">Vista previa</p>
        <div className={`${preset.bg} py-2.5 px-4 rounded-lg text-center`}>
          <p className={`${preset.text} text-sm font-medium tracking-wide`}>{text || 'Texto del anuncio...'}</p>
        </div>
      </div>

      {/* Text */}
      <div>
        <label className="block text-sm text-slate-300 font-medium mb-2">Texto del anuncio</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg px-4 py-3 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-400 resize-none"
          placeholder="Escribe el texto del anuncio..."
        />
        <p className="text-xs text-slate-500 mt-1">{text.length} caracteres</p>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm text-slate-300 font-medium mb-3">Color de fondo</label>
        <div className="flex gap-3">
          {ANNOUNCEMENT_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => setColorPreset(p.value)}
              className={`flex flex-col items-center gap-1.5 group`}
            >
              <div
                className={`w-12 h-8 rounded-md border-2 transition-all ${p.bg} ${
                  colorPreset === p.value ? 'border-yellow-400 scale-110' : 'border-slate-600 hover:border-slate-400'
                }`}
              />
              <span className={`text-xs ${colorPreset === p.value ? 'text-yellow-400' : 'text-slate-400'}`}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
      >
        <Save size={15} /> Guardar anuncio
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'hero', icon: Layout, label: 'Hero Banners' },
  { id: 'collections', icon: Image, label: 'Colecciones destacadas' },
  { id: 'testimonials', icon: MessageSquare, label: 'Testimonios' },
  { id: 'announcement', icon: Megaphone, label: 'Barra de anuncio' },
];

export default function WebContent() {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Globe size={18} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-slate-100 font-bold text-xl">Contenido Web</h1>
            <p className="text-slate-400 text-sm">Administra el contenido visible en la tienda</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <SectionTab
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeSection === tab.id}
              onClick={setActiveSection}
            />
          ))}
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6"
          >
            {activeSection === 'hero' && <HeroBannersSection />}
            {activeSection === 'collections' && <CollectionsSection />}
            {activeSection === 'testimonials' && <TestimonialsSection />}
            {activeSection === 'announcement' && <AnnouncementSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
