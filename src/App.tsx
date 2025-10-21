import React, { useState, useEffect } from 'react';
import { useVinylStore } from './stores/vinylStore';
import { Dashboard } from './components/Dashboard';
import { VinylCard } from './components/VinylCard';
import { Disc3, BarChart3, Download, RefreshCw, Search, X } from 'lucide-react';
import { discogsClient } from './services/discogsClient';
import { importDiscogsCollection } from './services/discogsImport';

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
        0, // folder ID 0 = "All" collection
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Disc3 className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Vinyl Collection
                </h1>
                <p className="text-sm text-gray-400">
                  {stats.totalRecords} {stats.totalRecords === 1 ? 'record' : 'records'}
                  {stats.totalCurrentValue > 0 && (
                    <span className="ml-2">
                      • ${stats.totalCurrentValue.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'collection'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Disc3 className="w-5 h-5" />
                <span className="hidden sm:inline">Collection</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'stats'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              {hasDiscogsToken && (
                <button
                  onClick={handleImportFromDiscogs}
                  disabled={isImporting}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

          {/* Search Bar */}
          {activeTab === 'collection' && vinyls.length > 0 && (
            <div className="mt-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artist, album, label..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
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
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Importing from Discogs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
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
                <div className="text-sm text-gray-400 truncate">
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
              className="text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors"
            >
              ← Back to Collection
            </button>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedVinyl.coverImageUrl ? (
                    <img
                      src={selectedVinyl.coverImageUrl}
                      alt={`${selectedVinyl.artist} - ${selectedVinyl.title}`}
                      className="w-full rounded-lg shadow-2xl"
                    />
                  ) : (
                    <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                      <Disc3 className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedVinyl.title}</h2>
                    <p className="text-xl text-purple-400">{selectedVinyl.artist}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Label:</span>
                      <p className="text-white">{selectedVinyl.label || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Year:</span>
                      <p className="text-white">{selectedVinyl.releaseYear}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Format:</span>
                      <p className="text-white">{selectedVinyl.format.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Country:</span>
                      <p className="text-white">{selectedVinyl.country || 'Unknown'}</p>
                    </div>
                    {selectedVinyl.catalogNumber && (
                      <div>
                        <span className="text-gray-400">Catalog #:</span>
                        <p className="text-white">{selectedVinyl.catalogNumber}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Media:</span>
                      <p className="text-white">{selectedVinyl.mediaCondition}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Sleeve:</span>
                      <p className="text-white">{selectedVinyl.sleeveCondition}</p>
                    </div>
                  </div>

                  {selectedVinyl.genres.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Genres:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedVinyl.genres.map((genre) => (
                          <span key={genre} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedVinyl.purchasePrice !== undefined || selectedVinyl.estimatedValue !== undefined) && (
                    <div className="pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedVinyl.purchasePrice !== undefined && (
                          <div>
                            <span className="text-gray-400 text-sm">Purchase Price:</span>
                            <p className="text-2xl font-bold text-white">${selectedVinyl.purchasePrice.toFixed(2)}</p>
                          </div>
                        )}
                        {selectedVinyl.estimatedValue !== undefined && (
                          <div>
                            <span className="text-gray-400 text-sm">Estimated Value:</span>
                            <p className="text-2xl font-bold text-green-400">${selectedVinyl.estimatedValue.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {selectedVinyl.gainLoss !== undefined && (
                        <div className="mt-4">
                          <span className="text-gray-400 text-sm">Gain/Loss:</span>
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
                    <div className="pt-4 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">Notes:</span>
                      <p className="text-white mt-2">{selectedVinyl.notes}</p>
                    </div>
                  )}

                  {selectedVinyl.discogsReleaseId && (
                    <div className="pt-4 border-t border-gray-700">
                      <a
                        href={`https://www.discogs.com/release/${selectedVinyl.discogsReleaseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
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
          <Dashboard stats={stats} />
        ) : (
          <div className="space-y-6">
            {vinyls.length === 0 ? (
              <div className="text-center py-20">
                <Disc3 className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No records yet</h2>
                <p className="text-gray-400 mb-6">
                  Import your collection from Discogs to get started
                </p>
                <button
                  onClick={handleImportFromDiscogs}
                  disabled={isImporting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
                    {searchInput && <span className="text-gray-400 font-normal ml-2">matching "{searchInput}"</span>}
                  </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredVinyls.map((vinyl) => (
                    <VinylCard
                      key={vinyl.id}
                      vinyl={vinyl}
                      onClick={() => setSelectedVinyl(vinyl)}
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
