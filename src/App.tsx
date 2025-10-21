import React, { useState, useEffect } from 'react';
import { useVinylStore } from './stores/vinylStore';
import { VinylDashboard } from './components/VinylDashboard';
import { VinylCard } from './components/VinylCard';
import { Disc3, BarChart3, Download, RefreshCw, Search, X, ArrowUpDown } from 'lucide-react';
import { discogsClient } from './services/discogsClient';
import { importDiscogsCollection } from './services/discogsImport';
import { SortField } from './types/Vinyl';
import { parseBBCode } from './utils/bbcodeParser';
import { cleanArtistName } from './utils/artistNameCleaner';

function App() {
  const {
    vinyls,
    filteredVinyls,
    stats,
    filters,
    setVinyls,
    setFilters,
    activeTab,
    setActiveTab,
    selectedVinyl,
    setSelectedVinyl,
    viewMode,
    showImportDialog,
    setShowImportDialog,
    importProgress,
    setImportProgress,
    bulkAddVinyls,
    backToCollection,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
  } = useVinylStore();

  const [isImporting, setIsImporting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [hasDiscogsToken, setHasDiscogsToken] = useState(false);

  // Initialize Discogs client on mount
  useEffect(() => {
    const token = import.meta.env.VITE_DISCOGS_TOKEN;
    const username = import.meta.env.VITE_DISCOGS_USERNAME;

    if (token && username) {
      discogsClient.authenticate(token, username);
      setHasDiscogsToken(true);
      console.log('✓ Discogs client authenticated');
    } else {
      console.warn('⚠ Discogs credentials not found. Import from Discogs will be disabled.');
    }
  }, []);

  // Handle import from Discogs
  const handleImportFromDiscogs = async () => {
    const username = import.meta.env.VITE_DISCOGS_USERNAME;

    if (!username) {
      alert('Please configure your Discogs username in the .env file');
      return;
    }

    setIsImporting(true);
    setShowImportDialog(true);

    try {
      const importedVinyls = await importDiscogsCollection(
        username,
        7559246, // "Vinyl" folder - excludes CDs
        (current, total, item) => {
          setImportProgress({ current, total, item });
        }
      );

      bulkAddVinyls(importedVinyls);
      setShowImportDialog(false);
      setImportProgress(null);
      alert(`✓ Successfully imported ${importedVinyls.length} records!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert(`✗ Failed to import collection: ${error.message}\n\nCheck console for details.`);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setFilters({ searchTerm: value });
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters({ searchTerm: '' });
  };

  // Go to homepage
  const goToHomepage = () => {
    setActiveTab('collection');
    backToCollection();
    clearSearch();
  };

  // Filter by artist
  const filterByArtist = (artist: string) => {
    const cleanedArtist = cleanArtistName(artist);
    setActiveTab('collection');
    backToCollection();
    setSearchInput(cleanedArtist);
    setFilters({ searchTerm: cleanedArtist });
  };

  return (
    <div className="min-h-screen bg-tron-bg">
      {/* Header */}
      <header className="bg-tron-bg-light/95 backdrop-blur-sm border-b border-tron-cyan/30 sticky top-0 z-50 shadow-tron-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToHomepage}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Disc3 className="w-8 h-8 text-tron-cyan" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-tron-cyan to-tron-pink bg-clip-text text-transparent drop-shadow-lg">
                  Vinyl Collection
                </h1>
                <p className="text-sm text-tron-text-dim">
                  {stats.totalRecords} {stats.totalRecords === 1 ? 'record' : 'records'}
                  {stats.totalCurrentValue > 0 && (
                    <span className="ml-2">
                      • ${stats.totalCurrentValue.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'collection'
                    ? 'bg-tron-cyan text-white'
                    : 'bg-tron-bg-lighter text-tron-text-secondary hover:bg-gray-700'
                }`}
              >
                <Disc3 className="w-5 h-5" />
                <span className="hidden sm:inline">Collection</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'stats'
                    ? 'bg-tron-cyan text-white'
                    : 'bg-tron-bg-lighter text-tron-text-secondary hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              {hasDiscogsToken && (
                <button
                  onClick={handleImportFromDiscogs}
                  disabled={isImporting}
                  className="px-4 py-2 bg-gradient-to-r from-tron-cyan to-tron-orange text-white rounded-lg font-medium hover:from-tron-cyan-dim hover:to-tron-orange transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="hidden sm:inline">Importing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Import</span>
                  </>
                )}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar and Sort Controls */}
          {activeTab === 'collection' && vinyls.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tron-text-dim" />
                <input
                  type="text"
                  placeholder="Search artist, album, label..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 bg-tron-bg-lighter border border-tron-border rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-tron-cyan text-tron-text-primary placeholder-tron-text-dim"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tron-text-dim hover:text-tron-cyan transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sort Controls */}
              <div className="flex gap-2">
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tron-text-dim pointer-events-none" />
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="pl-9 pr-4 py-2 bg-tron-bg-lighter border border-tron-border rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-tron-cyan text-tron-text-primary appearance-none cursor-pointer"
                  >
                    <option value="purchaseDate">Date Added</option>
                    <option value="artist">Artist (A-Z)</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="releaseYear">Release Year</option>
                    <option value="estimatedValue">Value</option>
                    <option value="gainLoss">Gain/Loss</option>
                    <option value="purchasePrice">Purchase Price</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-tron-bg-lighter border border-tron-border rounded-lg hover:border-tron-cyan text-tron-text-secondary hover:text-tron-cyan transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import Progress Dialog */}
        {showImportDialog && importProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-tron-bg-lighter rounded-lg p-6 max-w-md w-full mx-4 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Importing from Discogs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-tron-text-secondary mb-2">
                    <span>Progress</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-tron-text-dim truncate">
                  {importProgress.item}
                </div>
                <div className="text-xs text-gray-500">
                  This may take a few minutes for large collections...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Vinyl Detail */}
        {selectedVinyl ? (
          <div className="space-y-6">
            <button
              onClick={() => backToCollection()}
              className="text-tron-cyan hover:text-purple-300 flex items-center gap-2 transition-colors"
            >
              ← Back to Collection
            </button>

            <div className="bg-tron-bg-lighter/50 backdrop-blur-sm rounded-lg p-6 border border-tron-border">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedVinyl.coverImageUrl ? (
                    <img
                      src={selectedVinyl.coverImageUrl}
                      alt={`${selectedVinyl.artist} - ${selectedVinyl.title}`}
                      className="w-full rounded-lg shadow-2xl"
                    />
                  ) : (
                    <div className="aspect-square bg-tron-bg rounded-lg flex items-center justify-center">
                      <Disc3 className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedVinyl.title}</h2>
                    <button
                      onClick={() => filterByArtist(selectedVinyl.artist)}
                      className="text-xl text-tron-cyan hover:text-tron-orange transition-colors"
                    >
                      {cleanArtistName(selectedVinyl.artist)}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-tron-text-dim">Label:</span>
                      <p className="text-white">{selectedVinyl.label || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-tron-text-dim">Year:</span>
                      <p className="text-white">{selectedVinyl.releaseYear}</p>
                    </div>
                    <div>
                      <span className="text-tron-text-dim">Format:</span>
                      <p className="text-white">{selectedVinyl.format.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-tron-text-dim">Country:</span>
                      <p className="text-white">{selectedVinyl.country || 'Unknown'}</p>
                    </div>
                    {selectedVinyl.catalogNumber && (
                      <div>
                        <span className="text-tron-text-dim">Catalog #:</span>
                        <p className="text-white">{selectedVinyl.catalogNumber}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-tron-text-dim">Media:</span>
                      <p className="text-white">{selectedVinyl.mediaCondition}</p>
                    </div>
                    <div>
                      <span className="text-tron-text-dim">Sleeve:</span>
                      <p className="text-white">{selectedVinyl.sleeveCondition}</p>
                    </div>
                  </div>

                  {selectedVinyl.genres.length > 0 && (
                    <div>
                      <span className="text-tron-text-dim text-sm">Genres:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedVinyl.genres.map((genre) => (
                          <span key={genre} className="px-3 py-1 bg-tron-cyan/20 text-purple-300 rounded-full text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedVinyl.purchasePrice !== undefined || selectedVinyl.estimatedValue !== undefined) && (
                    <div className="pt-4 border-t border-tron-border">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedVinyl.purchasePrice !== undefined && (
                          <div>
                            <span className="text-tron-text-dim text-sm">Purchase Price:</span>
                            <p className="text-2xl font-bold text-white">${selectedVinyl.purchasePrice.toFixed(2)}</p>
                          </div>
                        )}
                        {selectedVinyl.estimatedValue !== undefined && (
                          <div>
                            <span className="text-tron-text-dim text-sm">Estimated Value:</span>
                            <p className="text-2xl font-bold text-green-400">${selectedVinyl.estimatedValue.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {selectedVinyl.gainLoss !== undefined && (
                        <div className="mt-4">
                          <span className="text-tron-text-dim text-sm">Gain/Loss:</span>
                          <p className={`text-2xl font-bold ${selectedVinyl.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedVinyl.gainLoss >= 0 ? '+' : ''}${selectedVinyl.gainLoss.toFixed(2)}
                            {selectedVinyl.gainLossPercentage !== undefined && (
                              <span className="text-sm ml-2">
                                ({selectedVinyl.gainLossPercentage >= 0 ? '+' : ''}{selectedVinyl.gainLossPercentage.toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedVinyl.notes && (
                    <div className="pt-4 border-t border-tron-border">
                      <span className="text-tron-text-dim text-sm">Notes:</span>
                      <div
                        className="text-tron-text-primary mt-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: parseBBCode(selectedVinyl.notes) }}
                      />
                    </div>
                  )}

                  {selectedVinyl.discogsReleaseId && (
                    <div className="pt-4 border-t border-tron-border">
                      <a
                        href={`https://www.discogs.com/release/${selectedVinyl.discogsReleaseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tron-cyan hover:text-purple-300 text-sm flex items-center gap-2"
                      >
                        View on Discogs →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'stats' ? (
          <VinylDashboard stats={stats} />
        ) : (
          <div className="space-y-6">
            {vinyls.length === 0 ? (
              <div className="text-center py-20">
                <Disc3 className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No records yet</h2>
                <p className="text-tron-text-dim mb-6">
                  Import your collection from Discogs to get started
                </p>
                <button
                  onClick={handleImportFromDiscogs}
                  disabled={isImporting}
                  className="px-6 py-3 bg-gradient-to-r from-tron-cyan to-tron-orange text-white rounded-lg font-medium hover:from-tron-cyan-dim hover:to-tron-orange transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Import from Discogs
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {filteredVinyls.length} {filteredVinyls.length === 1 ? 'Record' : 'Records'}
                    {searchInput && <span className="text-tron-text-dim font-normal ml-2">matching "{searchInput}"</span>}
                  </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredVinyls.map((vinyl) => (
                    <VinylCard
                      key={vinyl.id}
                      vinyl={vinyl}
                      onClick={() => setSelectedVinyl(vinyl)}
                      onArtistClick={filterByArtist}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
