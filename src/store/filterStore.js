import { create } from 'zustand'

const useFilterStore = create((set) => ({
  search: '',
  category: null,
  material: null,
  priceRange: [0, 50000],
  sortBy: 'newest',
  view: 'grid',
  onlyAvailable: false,

  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setMaterial: (material) => set({ material }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setSortBy: (sortBy) => set({ sortBy }),
  setView: (view) => set({ view }),
  setOnlyAvailable: (onlyAvailable) => set({ onlyAvailable }),

  resetFilters: () => set({
    search: '',
    category: null,
    material: null,
    priceRange: [0, 50000],
    sortBy: 'newest',
    onlyAvailable: false,
  }),

  activeFilterCount: (state) => {
    let count = 0
    if (state.category) count++
    if (state.material) count++
    if (state.priceRange[0] > 0 || state.priceRange[1] < 50000) count++
    if (state.onlyAvailable) count++
    return count
  },
}))

export default useFilterStore
