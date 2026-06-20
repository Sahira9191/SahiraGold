import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Star,
} from 'lucide-react'
import { MOCK_PRODUCTS } from '../../lib/mockData'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_ORDERS = [
  { id: 'SGC-51029', customer: 'Sofía Monterroso',  date: '16 jun 2026', total: 3200,  status: 'Procesando' },
  { id: 'SGC-48291', customer: 'Ana Pérez',          date: '15 jun 2026', total: 4800,  status: 'Entregado'  },
  { id: 'SGC-39145', customer: 'Carmen Villanueva',  date: '14 jun 2026', total: 12500, status: 'Entregado'  },
  { id: 'SGC-55821', customer: 'Isabella Fuentes',   date: '16 jun 2026', total: 1900,  status: 'En camino'  },
  { id: 'SGC-47103', customer: 'Gabriela Morales',   date: '13 jun 2026', total: 6700,  status: 'Cancelado'  },
]

const STATUS_STYLES = {
  Entregado:  { badge: 'bg-emerald-900/30 text-emerald-400', dot: 'bg-emerald-400' },
  'En camino':{ badge: 'bg-blue-900/30 text-blue-400',       dot: 'bg-blue-400'    },
  Procesando: { badge: 'bg-yellow-900/30 text-yellow-400',   dot: 'bg-yellow-400'  },
  Cancelado:  { badge: 'bg-red-900/30 text-red-400',         dot: 'bg-red-400'     },
}

const WEEK_SALES = [45000, 62000, 38000, 71000, 55000, 89000, 67000]
const WEEK_DAYS  = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const DONUT_SLICES = [
  { label: 'Anillos',   pct: 30, color: '#EAB308' },
  { label: 'Collares',  pct: 22, color: '#3B82F6' },
  { label: 'Aretes',    pct: 20, color: '#10B981' },
  { label: 'Pulseras',  pct: 15, color: '#A855F7' },
  { label: 'Cadenas',   pct:  8, color: '#F43F5E' },
  { label: 'Conjuntos', pct:  5, color: '#F97316' },
]

/* ─── Metric Card ────────────────────────────────────────────────────────── */
function MetricCard({ label, value, growth, icon: Icon, iconBg, iconColor }) {
  const positive = growth >= 0
  return (
    <div className="bg-slate-800 border border-slate-700 p-5 rounded-none flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 tracking-widest uppercase mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-100">{value}</p>
        </div>
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{positive ? '+' : ''}{growth}% vs. mes anterior</span>
      </div>
    </div>
  )
}

/* ─── Sales Bar Chart (pure SVG) ─────────────────────────────────────────── */
function SalesBarChart() {
  const [tooltip, setTooltip] = useState(null)
  const maxVal   = Math.max(...WEEK_SALES)
  const svgW     = 560
  const svgH     = 180
  const padL     = 56
  const padR     = 16
  const padT     = 12
  const padB     = 28
  const chartW   = svgW - padL - padR
  const chartH   = svgH - padT - padB
  const barCount = WEEK_SALES.length
  const groupW   = chartW / barCount
  const barW     = Math.min(groupW * 0.55, 42)

  /* Y-axis ticks */
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: Math.round(maxVal * t),
    y:   padT + chartH * (1 - t),
  }))

  return (
    <div className="bg-slate-800 border border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-100 tracking-wide mb-5">
        Ventas Últimos 7 Días
      </h2>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full min-w-[320px]"
          style={{ height: svgH }}
          aria-label="Gráfica de ventas últimos 7 días"
        >
          {/* Grid lines + Y labels */}
          {yTicks.map(({ val, y }) => (
            <g key={val}>
              <line
                x1={padL} y1={y} x2={svgW - padR} y2={y}
                stroke="#334155" strokeWidth={1}
                strokeDasharray={val === 0 ? '' : '3 3'}
              />
              <text
                x={padL - 6} y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#64748B"
              >
                {val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`}
              </text>
            </g>
          ))}

          {/* Bars */}
          {WEEK_SALES.map((sale, i) => {
            const barH  = (sale / maxVal) * chartH
            const barX  = padL + i * groupW + (groupW - barW) / 2
            const barY  = padT + chartH - barH
            const tipX  = barX + barW / 2
            const tipY  = barY - 8
            const isHov = tooltip?.index === i

            return (
              <g
                key={i}
                onMouseEnter={() => setTooltip({ index: i, x: tipX, y: tipY, val: sale })}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              >
                {/* Bar */}
                <rect
                  x={barX} y={barY}
                  width={barW} height={barH}
                  fill={isHov ? '#D4A017' : '#C9A84C'}
                  opacity={isHov ? 1 : 0.85}
                />
                {/* Day label */}
                <text
                  x={barX + barW / 2}
                  y={padT + chartH + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isHov ? '#EAB308' : '#94A3B8'}
                  fontWeight={isHov ? 600 : 400}
                >
                  {WEEK_DAYS[i]}
                </text>
              </g>
            )
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x - 38} y={tooltip.y - 20}
                width={76} height={20}
                rx={2} fill="#1E293B"
                stroke="#475569" strokeWidth={1}
              />
              <text
                x={tooltip.x} y={tooltip.y - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#FDE68A"
                fontWeight={600}
              >
                {formatPrice(tooltip.val)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

/* ─── Recent Orders Table ────────────────────────────────────────────────── */
function RecentOrdersTable() {
  return (
    <div className="bg-slate-800 border border-slate-700">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">Pedidos Recientes</h2>
        <Link
          to="/admin/pedidos"
          className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
        >
          Ver todo <ArrowRight size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800">
              {['Pedido', 'Cliente', 'Total', 'Estado', 'Acción'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((order) => {
              const st = STATUS_STYLES[order.status] ?? STATUS_STYLES['Procesando']
              return (
                <tr
                  key={order.id}
                  className="bg-slate-800/50 hover:bg-slate-800 border-b border-slate-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-100 text-xs">#{order.id}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{order.date}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{order.customer}</td>
                  <td className="px-4 py-3 font-semibold text-yellow-400 text-xs whitespace-nowrap">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 ${st.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-slate-400 hover:text-yellow-400 transition-colors">
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Low Stock + Top Products ───────────────────────────────────────────── */
function SidePanel() {
  const lowStock = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 3)
  const topProducts = [...MOCK_PRODUCTS]
    .sort((a, b) => b.reviews_count - a.reviews_count)
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-yellow-500/30 bg-yellow-900/10">
            <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-yellow-400 tracking-wide">
              {lowStock.length} productos con stock bajo
            </span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {lowStock.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Package size={12} className="text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{p.name}</span>
                </div>
                <span className="text-xs font-semibold text-red-400 flex-shrink-0">
                  {p.stock} uds.
                </span>
              </div>
            ))}
          </div>
          {lowStock.length > 4 && (
            <div className="px-5 py-2.5 border-t border-slate-700/50">
              <Link
                to="/admin/inventario"
                className="text-[11px] text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                +{lowStock.length - 4} más → Ver inventario
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Top products */}
      <div className="bg-slate-800 border border-slate-700">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide">Top Productos</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {topProducts.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
              {/* Rank */}
              <span
                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center text-[11px] font-bold rounded-full
                  ${idx === 0 ? 'bg-yellow-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}
              >
                {idx + 1}
              </span>
              {/* Product thumb */}
              <img
                src={p.images?.[0]}
                alt={p.name}
                className="w-9 h-9 object-cover flex-shrink-0 bg-slate-700"
                loading="lazy"
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] text-slate-400">{p.rating}</span>
                  <span className="text-[10px] text-slate-500">· {p.reviews_count} reseñas</span>
                </div>
              </div>
              {/* Price */}
              <span className="text-xs font-semibold text-yellow-400 flex-shrink-0">
                {formatPrice(p.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Donut Chart (pure SVG) ─────────────────────────────────────────────── */
function DonutChart() {
  const [hovered, setHovered] = useState(null)
  const cx = 80
  const cy = 80
  const R  = 60
  const r  = 36  // inner radius for donut

  /* Build arcs */
  let cumAngle = -Math.PI / 2 // start at top
  const slices = DONUT_SLICES.map((slice) => {
    const angle   = (slice.pct / 100) * 2 * Math.PI
    const startA  = cumAngle
    const endA    = cumAngle + angle
    cumAngle      = endA

    const x1 = cx + R * Math.cos(startA)
    const y1 = cy + R * Math.sin(startA)
    const x2 = cx + R * Math.cos(endA)
    const y2 = cy + R * Math.sin(endA)

    const ix1 = cx + r * Math.cos(startA)
    const iy1 = cy + r * Math.sin(startA)
    const ix2 = cx + r * Math.cos(endA)
    const iy2 = cy + r * Math.sin(endA)

    const large = angle > Math.PI ? 1 : 0

    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ')

    return { ...slice, d, startA, endA }
  })

  return (
    <div className="bg-slate-800 border border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-100 tracking-wide mb-5">
        Ventas por Categoría
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="flex-shrink-0 relative">
          <svg width={160} height={160} viewBox="0 0 160 160" aria-label="Gráfica de ventas por categoría">
            {slices.map((slice, i) => {
              const isHov = hovered === i
              const scale = isHov ? 1.06 : 1
              const midA  = (slice.startA + slice.endA) / 2
              const tx    = isHov ? Math.cos(midA) * 4 : 0
              const ty    = isHov ? Math.sin(midA) * 4 : 0
              return (
                <path
                  key={slice.label}
                  d={slice.d}
                  fill={slice.color}
                  opacity={hovered !== null && !isHov ? 0.5 : 0.9}
                  style={{
                    transform: `translate(${tx}px, ${ty}px)`,
                    transition: 'all 0.18s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
            {/* Center label */}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize={11} fill="#94A3B8">
              {hovered !== null ? slices[hovered].label : 'Total'}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={15} fill="#F1F5F9" fontWeight={700}>
              {hovered !== null ? `${slices[hovered].pct}%` : '100%'}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-1 gap-2 w-full min-w-0">
          {DONUT_SLICES.map((slice, i) => (
            <div
              key={slice.label}
              className={`flex items-center gap-2.5 px-2 py-1 cursor-pointer transition-all duration-150 rounded-none
                ${hovered === i ? 'bg-slate-700/60' : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs text-slate-300 flex-1 min-w-0 truncate">{slice.label}</span>
              <span className="text-xs font-semibold text-slate-100 flex-shrink-0">{slice.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ── 1. Metric cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ventas del mes"
          value={formatPrice(284500)}
          growth={18}
          icon={DollarSign}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
        />
        <MetricCard
          label="Pedidos totales"
          value="134"
          growth={12}
          icon={ShoppingCart}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <MetricCard
          label="Clientes activos"
          value="89"
          growth={8}
          icon={Users}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
        />
        <MetricCard
          label="Ticket promedio"
          value={formatPrice(2123)}
          growth={6}
          icon={TrendingUp}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
        />
      </div>

      {/* ── 2. Sales bar chart ───────────────────────────────────────────── */}
      <SalesBarChart />

      {/* ── 3. Two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div>
          <SidePanel />
        </div>
      </div>

      {/* ── 4. Donut category chart ───────────────────────────────────────── */}
      <DonutChart />
    </motion.div>
  )
}
