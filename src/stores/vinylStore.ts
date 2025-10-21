import { create } from 'zustand';
import { Vinyl, VinylStats, SortField, SortDirection, FilterOptions, VinylCondition } from '../types/Vinyl';
import { saveVinylsToStorage, loadVinylsFromStorage } from '../utils/vinylStorage';
import vinylsData from '../data/vinyls.json';

// Helper to get condition rank for sorting
const getConditionRank = (condition: VinylCondition): number => {
  const ranks: Record<VinylCondition, number> = {
    'Mint (M)': 8,
    'Near Mint (NM)': 7,
    'Very Good Plus (VG+)': 6,
    'Very Good (VG)': 5,
    'Good Plus (G+)': 4,
    'Good (G)': 3,
    'Fair (F)': 2,
    'Poor (P)': 1,
  };
  return ranks[condition] || 0;
};

// Helper function to apply filters and sorting
const applyFilters = (
  vinyls: Vinyl[],
  filters: FilterOptions,
  sortField: SortField,
  sortDirection: SortDirection
): Vinyl[] => {
  let filtered = [...vinyls];

  // Apply search filter
  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(vinyl =>
      vinyl.title.toLowerCase().includes(searchLower) ||
      vinyl.artist.toLowerCase().includes(searchLower) ||
      vinyl.label.toLowerCase().includes(searchLower) ||
      vinyl.catalogNumber.toLowerCase().includes(searchLower) ||
      vinyl.notes.toLowerCase().includes(searchLower)
    );
  }

  // Apply artist filter
  if (filters.artist) {
    filtered = filtered.filter(vinyl =>
      vinyl.artist.toLowerCase().includes(filters.artist.toLowerCase())
    );
  }

  // Apply label filter
  if (filters.label) {
    filtered = filtered.filter(vinyl =>
      vinyl.label.toLowerCase().includes(filters.label.toLowerCase())
    );
  }

  // Apply genres filter
  if (filters.genres.length > 0) {
    filtered = filtered.filter(vinyl =>
      filters.genres.some(genre => vinyl.genres.includes(genre))
    );
  }

  // Apply formats filter
  if (filters.formats.length > 0) {
    filtered = filtered.filter(vinyl =>
      filters.formats.some(format => vinyl.format.some(f => f.includes(format)))
    );
  }

  // Apply sleeve condition filter
  if (filters.minSleeveCondition) {
    const minRank = getConditionRank(filters.minSleeveCondition as VinylCondition);
    filtered = filtered.filter(vinyl =>
      getConditionRank(vinyl.sleeveCondition) >= minRank
    );
  }

  // Apply media condition filter
  if (filters.minMediaCondition) {
    const minRank = getConditionRank(filters.minMediaCondition as VinylCondition);
    filtered = filtered.filter(vinyl =>
      getConditionRank(vinyl.mediaCondition) >= minRank
    );
  }

  // Apply price filter
  filtered = filtered.filter(vinyl => {
    const price = vinyl.purchasePrice || 0;
    return price >= filters.minPrice && price <= filters.maxPrice;
  });

  // Apply year filter
  filtered = filtered.filter(vinyl =>
    vinyl.releaseYear >= filters.minYear && vinyl.releaseYear <= filters.maxYear
  );

  // Apply country filter
  if (filters.country) {
    filtered = filtered.filter(vinyl =>
      vinyl.country.toLowerCase().includes(filters.country.toLowerCase())
    );
  }

  // Apply tags filter
  if (filters.tags.length > 0) {
    filtered = filtered.filter(vinyl =>
      filters.tags.some(tag => vinyl.tags.includes(tag))
    );
  }

  // Apply storage location filter
  if (filters.storageLocation) {
    filtered = filtered.filter(vinyl =>
      vinyl.storageLocation.toLowerCase().includes(filters.storageLocation.toLowerCase())
    );
  }

  // Apply colored vinyl filter
  if (filters.coloredVinylOnly) {
    filtered = filtered.filter(vinyl => vinyl.colorVariant && vinyl.colorVariant.trim() !== '');
  }

  // Apply first pressing filter
  if (filters.firstPressingOnly) {
    filtered = filtered.filter(vinyl =>
      vinyl.tags.includes('first pressing') ||
      vinyl.notes.toLowerCase().includes('first pressing')
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle special cases for sorting
    if (sortField === 'releaseYear') {
      aValue = a.releaseYear || 0;
      bValue = b.releaseYear || 0;
    } else if (sortField === 'purchaseDate') {
      aValue = new Date(a.purchaseDate).getTime();
      bValue = new Date(b.purchaseDate).getTime();
    } else if (sortField === 'sleeveCondition' || sortField === 'mediaCondition') {
      aValue = getConditionRank(aValue as VinylCondition);
      bValue = getConditionRank(bValue as VinylCondition);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    } else if (aValue === undefined) {
      aValue = 0;
    }

    if (bValue === undefined) {
      bValue = 0;
    }

    // Primary sort
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;

    // Secondary sort: When sorting by artist or title, sort by release year (earliest first)
    if (sortField === 'artist' || sortField === 'title') {
      const aYear = a.releaseYear || 0;
      const bYear = b.releaseYear || 0;
      if (aYear !== bYear) {
        return aYear - bYear; // Always ascending (earliest first)
      }
    }

    return 0;
  });

  return filtered;
};

interface VinylStore {
  // State
  vinyls: Vinyl[];
  filteredVinyls: Vinyl[];
  filters: FilterOptions;
  sortField: SortField;
  sortDirection: SortDirection;
  loading: boolean;

  // UI State
  showForm: boolean;
  editingVinyl: Vinyl | undefined;
  activeTab: 'collection' | 'stats';
  selectedVinyl: Vinyl | undefined;
  selectedArtist: string | null;
  selectedLabel: string | null;
  selectedGenre: string | null;
  selectedStorageLocation: string | null;
  selectedTag: string | null;
  viewMode: 'grid' | 'list';
  showImportDialog: boolean;
  importProgress: { current: number; total: number; item: string } | null;

  // Actions
  setVinyls: (vinyls: Vinyl[]) => void;
  setFilteredVinyls: (vinyls: Vinyl[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setLoading: (loading: boolean) => void;

  // UI Actions
  setShowForm: (show: boolean) => void;
  setEditingVinyl: (vinyl: Vinyl | undefined) => void;
  setActiveTab: (tab: 'collection' | 'stats') => void;
  setSelectedVinyl: (vinyl: Vinyl | undefined) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSelectedLabel: (label: string | null) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedStorageLocation: (location: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowImportDialog: (show: boolean) => void;
  setImportProgress: (progress: { current: number; total: number; item: string } | null) => void;

  // Vinyl Actions
  addVinyl: (vinyl: Omit<Vinyl, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVinyl: (id: string, updates: Partial<Vinyl>) => void;
  deleteVinyl: (id: string) => void;
  bulkAddVinyls: (vinyls: Omit<Vinyl, 'id' | 'createdAt' | 'updatedAt'>[]) => void;

  // Computed Properties
  stats: VinylStats;
  allArtists: string[];
  allLabels: string[];
  allGenres: string[];
  allStorageLocations: string[];

  // Navigation Actions
  navigateToVinyl: (vinyl: Vinyl) => void;
  navigateToArtist: (artist: string) => void;
  navigateToLabel: (label: string) => void;
  navigateToGenre: (genre: string) => void;
  navigateToStorageLocation: (location: string) => void;
  navigateToTag: (tag: string) => void;
  backToCollection: () => void;
}

const defaultFilters: FilterOptions = {
  searchTerm: '',
  artist: '',
  label: '',
  genres: [],
  formats: [],
  minSleeveCondition: '',
  maxSleeveCondition: '',
  minMediaCondition: '',
  maxMediaCondition: '',
  minPrice: 0,
  maxPrice: 10000,
  minYear: 1900,
  maxYear: new Date().getFullYear() + 1,
  country: '',
  tags: [],
  storageLocation: '',
  coloredVinylOnly: false,
  firstPressingOnly: false,
};

// Helper to calculate gain/loss for vinyls
const calculateGainLoss = (vinyls: Vinyl[]): Vinyl[] => {
  return vinyls.map(vinyl => {
    if (vinyl.purchasePrice !== undefined && vinyl.estimatedValue !== undefined) {
      const gainLoss = vinyl.estimatedValue - vinyl.purchasePrice;
      const gainLossPercentage = vinyl.purchasePrice > 0
        ? (gainLoss / vinyl.purchasePrice) * 100
        : 0;
      return { ...vinyl, gainLoss, gainLossPercentage };
    }
    return vinyl;
  });
};

export const useVinylStore = create<VinylStore>((set, get) => {
  // Try to load from localStorage first, fallback to vinyls.json
  const storedVinyls = loadVinylsFromStorage();
  const loadedVinyls = storedVinyls || (vinylsData as Vinyl[]);
  // Calculate gain/loss for all vinyls on initial load
  const initialVinyls: Vinyl[] = calculateGainLoss(loadedVinyls);
  const initialFilteredVinyls = applyFilters(initialVinyls, defaultFilters, 'purchaseDate', 'desc');

  return {
    // Initial State
    vinyls: initialVinyls,
    filteredVinyls: initialFilteredVinyls,
    filters: defaultFilters,
    sortField: 'purchaseDate',
    sortDirection: 'desc',
    loading: false,

    // UI State
    showForm: false,
    editingVinyl: undefined,
    activeTab: 'collection',
    selectedVinyl: undefined,
    selectedArtist: null,
    selectedLabel: null,
    selectedGenre: null,
    selectedStorageLocation: null,
    selectedTag: null,
    viewMode: 'grid',
    showImportDialog: false,
    importProgress: null,

    // Actions
    setVinyls: (vinyls) => set((state) => {
      const filteredVinyls = applyFilters(vinyls, state.filters, state.sortField, state.sortDirection);
      saveVinylsToStorage(vinyls); // Auto-save
      return { vinyls, filteredVinyls };
    }),

    setFilteredVinyls: (vinyls) => set({ filteredVinyls: vinyls }),

    setFilters: (filters) => set((state) => {
      const newFilters = { ...state.filters, ...filters };
      const filteredVinyls = applyFilters(state.vinyls, newFilters, state.sortField, state.sortDirection);
      return {
        filters: newFilters,
        filteredVinyls
      };
    }),

    setSortField: (sortField) => set((state) => {
      const filteredVinyls = applyFilters(state.vinyls, state.filters, sortField, state.sortDirection);
      return { sortField, filteredVinyls };
    }),

    setSortDirection: (sortDirection) => set((state) => {
      const filteredVinyls = applyFilters(state.vinyls, state.filters, state.sortField, sortDirection);
      return { sortDirection, filteredVinyls };
    }),

    setLoading: (loading) => set({ loading }),

    // UI Actions
    setShowForm: (showForm) => set({ showForm }),
    setEditingVinyl: (editingVinyl) => set({ editingVinyl }),
    setActiveTab: (activeTab) => set({ activeTab }),
    setSelectedVinyl: (selectedVinyl) => set({ selectedVinyl }),
    setSelectedArtist: (selectedArtist) => set({ selectedArtist }),
    setSelectedLabel: (selectedLabel) => set({ selectedLabel }),
    setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
    setSelectedStorageLocation: (selectedStorageLocation) => set({ selectedStorageLocation }),
    setSelectedTag: (selectedTag) => set({ selectedTag }),
    setViewMode: (viewMode) => set({ viewMode }),
    setShowImportDialog: (showImportDialog) => set({ showImportDialog }),
    setImportProgress: (importProgress) => set({ importProgress }),

    // Vinyl Actions
    addVinyl: (vinylData) => {
      const newVinyl: Vinyl = {
        ...vinylData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Calculate gain/loss if we have purchase price and estimated value
        gainLoss: vinylData.estimatedValue && vinylData.purchasePrice
          ? vinylData.estimatedValue - vinylData.purchasePrice
          : undefined,
        gainLossPercentage: vinylData.estimatedValue && vinylData.purchasePrice && vinylData.purchasePrice > 0
          ? ((vinylData.estimatedValue - vinylData.purchasePrice) / vinylData.purchasePrice) * 100
          : undefined,
      };
      set((state) => {
        const updatedVinyls = [...state.vinyls, newVinyl];
        const filteredVinyls = applyFilters(updatedVinyls, state.filters, state.sortField, state.sortDirection);
        saveVinylsToStorage(updatedVinyls); // Auto-save
        return {
          vinyls: updatedVinyls,
          filteredVinyls,
          showForm: false,
          editingVinyl: undefined
        };
      });
    },

    updateVinyl: (id, updates) => {
      set((state) => {
        const updatedVinyls = state.vinyls.map(vinyl => {
          if (vinyl.id === id) {
            const updated = { ...vinyl, ...updates, updatedAt: new Date().toISOString() };
            // Recalculate gain/loss
            if (updated.estimatedValue !== undefined && updated.purchasePrice !== undefined) {
              updated.gainLoss = updated.estimatedValue - updated.purchasePrice;
              updated.gainLossPercentage = updated.purchasePrice > 0
                ? (updated.gainLoss / updated.purchasePrice) * 100
                : 0;
            }
            return updated;
          }
          return vinyl;
        });
        const filteredVinyls = applyFilters(updatedVinyls, state.filters, state.sortField, state.sortDirection);
        saveVinylsToStorage(updatedVinyls); // Auto-save
        return {
          vinyls: updatedVinyls,
          filteredVinyls,
          showForm: false,
          editingVinyl: undefined
        };
      });
    },

    deleteVinyl: (id) => {
      set((state) => {
        const updatedVinyls = state.vinyls.filter(vinyl => vinyl.id !== id);
        const filteredVinyls = applyFilters(updatedVinyls, state.filters, state.sortField, state.sortDirection);
        saveVinylsToStorage(updatedVinyls); // Auto-save
        return {
          vinyls: updatedVinyls,
          filteredVinyls
        };
      });
    },

    bulkAddVinyls: (vinylsData) => {
      const newVinyls: Vinyl[] = vinylsData.map(vinylData => ({
        ...vinylData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        gainLoss: vinylData.estimatedValue && vinylData.purchasePrice
          ? vinylData.estimatedValue - vinylData.purchasePrice
          : undefined,
        gainLossPercentage: vinylData.estimatedValue && vinylData.purchasePrice && vinylData.purchasePrice > 0
          ? ((vinylData.estimatedValue - vinylData.purchasePrice) / vinylData.purchasePrice) * 100
          : undefined,
      }));

      set((state) => {
        const updatedVinyls = [...state.vinyls, ...newVinyls];
        const filteredVinyls = applyFilters(updatedVinyls, state.filters, state.sortField, state.sortDirection);
        saveVinylsToStorage(updatedVinyls); // Auto-save
        return {
          vinyls: updatedVinyls,
          filteredVinyls,
        };
      });
    },

    // Navigation Actions
    navigateToVinyl: (vinyl) => set({
      selectedVinyl: vinyl,
      selectedArtist: null,
      selectedLabel: null,
      selectedGenre: null,
      selectedStorageLocation: null,
      selectedTag: null,
    }),

    navigateToArtist: (artist) => set({
      selectedArtist: artist,
      selectedVinyl: undefined,
      selectedLabel: null,
      selectedGenre: null,
      selectedStorageLocation: null,
      selectedTag: null,
    }),

    navigateToLabel: (label) => set({
      selectedLabel: label,
      selectedVinyl: undefined,
      selectedArtist: null,
      selectedGenre: null,
      selectedStorageLocation: null,
      selectedTag: null,
    }),

    navigateToGenre: (genre) => set({
      selectedGenre: genre,
      selectedVinyl: undefined,
      selectedArtist: null,
      selectedLabel: null,
      selectedStorageLocation: null,
      selectedTag: null,
    }),

    navigateToStorageLocation: (location) => set({
      selectedStorageLocation: location,
      selectedVinyl: undefined,
      selectedArtist: null,
      selectedLabel: null,
      selectedGenre: null,
      selectedTag: null,
    }),

    navigateToTag: (tag) => set({
      selectedTag: tag,
      selectedVinyl: undefined,
      selectedArtist: null,
      selectedLabel: null,
      selectedGenre: null,
      selectedStorageLocation: null,
    }),

    backToCollection: () => set({
      selectedVinyl: undefined,
      selectedArtist: null,
      selectedLabel: null,
      selectedGenre: null,
      selectedStorageLocation: null,
      selectedTag: null,
      showForm: false,
      editingVinyl: undefined
    }),

    // Computed Values
    get stats() {
      const state = get();
      const vinylsWithEstimatedValue = state.vinyls.filter(v => v.estimatedValue !== undefined);
      const totalPurchaseValue = state.vinyls.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
      const totalCurrentValue = vinylsWithEstimatedValue.reduce((sum, v) => sum + (v.estimatedValue || 0), 0);
      const totalGainLoss = vinylsWithEstimatedValue.reduce((sum, v) => sum + (v.gainLoss || 0), 0);
      const totalInvestment = vinylsWithEstimatedValue.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
      const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

      // Find biggest gainer and loser (only include records with purchase price and actual gains/losses)
      const vinylsWithGainLoss = vinylsWithEstimatedValue.filter(v =>
        v.purchasePrice !== undefined && v.gainLoss !== undefined
      );

      const biggestGainer = vinylsWithGainLoss
        .filter(v => (v.gainLoss || 0) > 0)
        .reduce((biggest, v) => {
          const gain = v.gainLoss || 0;
          const biggestGain = biggest?.gainLoss || 0;
          return gain > biggestGain ? v : biggest;
        }, null as Vinyl | null);

      const biggestLoser = vinylsWithGainLoss
        .filter(v => (v.gainLoss || 0) < 0)
        .reduce((biggest, v) => {
          const loss = v.gainLoss || 0;
          const biggestLoss = biggest?.gainLoss || 0;
          return loss < biggestLoss ? v : biggest;
        }, null as Vinyl | null);

      // Condition breakdown
      const conditionCounts = state.vinyls.reduce((counts, v) => {
        counts[v.mediaCondition] = (counts[v.mediaCondition] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      // Format breakdown
      const lpCount = state.vinyls.filter(v => v.format.some(f => f.includes('LP'))).length;
      const epCount = state.vinyls.filter(v => v.format.some(f => f.includes('EP'))).length;
      const singleCount = state.vinyls.filter(v => v.format.some(f => f.includes('7"') || f.includes('Single'))).length;
      const otherFormatCount = state.vinyls.length - lpCount - epCount - singleCount;

      // Highest valued record
      const highestValuedRecord = state.vinyls.reduce((highest, v) => {
        const value = v.estimatedValue || v.purchasePrice || 0;
        const highestValue = highest ? (highest.estimatedValue || highest.purchasePrice || 0) : 0;
        return value > highestValue ? v : highest;
      }, null as Vinyl | null);

      return {
        totalRecords: state.vinyls.length,
        totalValue: totalPurchaseValue,
        totalPurchaseValue,
        totalCurrentValue,
        highestValuedRecord,
        biggestGainer,
        biggestLoser,
        mintRecords: conditionCounts['Mint (M)'] || 0,
        nearMintRecords: conditionCounts['Near Mint (NM)'] || 0,
        veryGoodPlusRecords: conditionCounts['Very Good Plus (VG+)'] || 0,
        veryGoodRecords: conditionCounts['Very Good (VG)'] || 0,
        goodPlusRecords: conditionCounts['Good Plus (G+)'] || 0,
        goodRecords: conditionCounts['Good (G)'] || 0,
        fairRecords: conditionCounts['Fair (F)'] || 0,
        poorRecords: conditionCounts['Poor (P)'] || 0,
        lpCount,
        epCount,
        singleCount,
        otherFormatCount,
        averageSleeveCondition: 'Near Mint (NM)', // TODO: Calculate properly
        averageMediaCondition: 'Near Mint (NM)', // TODO: Calculate properly
        totalGainLoss,
        totalGainLossPercentage,
        recordsWithCurrentValue: vinylsWithEstimatedValue.length,
        coloredVinylCount: state.vinyls.filter(v => v.colorVariant && v.colorVariant.trim() !== '').length,
        firstPressingCount: state.vinyls.filter(v =>
          v.tags.includes('first pressing') || v.notes.toLowerCase().includes('first pressing')
        ).length,
        limitedEditionCount: state.vinyls.filter(v =>
          v.tags.includes('limited edition') || v.notes.toLowerCase().includes('limited')
        ).length,
        uniqueArtists: new Set(state.vinyls.map(v => v.artist)).size,
        uniqueLabels: new Set(state.vinyls.map(v => v.label).filter(l => l)).size,
        uniqueGenres: new Set(state.vinyls.flatMap(v => v.genres || [])).size,
      };
    },

    get allArtists() {
      return Array.from(new Set(get().vinyls.map(v => v.artist))).sort();
    },

    get allLabels() {
      return Array.from(new Set(get().vinyls.map(v => v.label).filter(Boolean))).sort();
    },

    get allGenres() {
      const genres = get().vinyls.flatMap(v => v.genres);
      return Array.from(new Set(genres)).sort();
    },

    get allStorageLocations() {
      return Array.from(new Set(get().vinyls.map(v => v.storageLocation).filter(Boolean))).sort();
    },
  };
});
