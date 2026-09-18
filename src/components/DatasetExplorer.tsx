import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  Search, 
  CheckCircle, 
  Download, 
  Flame, 
  ExternalLink, 
  ArrowUpRight, 
  FileJson,
  Cpu,
  MapPin,
  BookOpen,
  Tag
} from 'lucide-react';
import { DatasetClassInfo } from '../types';
import { 
  WEST_AFRICAN_DATASET_CLASSES, 
  KAGGLE_DATASET_META 
} from '../data/westAfricanDataset';

interface DatasetExplorerProps {
  onSelectSampleForScan: (imageSrc: string) => void;
  onSelectDishRecipe?: (recipeName: string) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  onSelectSampleForScan,
  onSelectDishRecipe
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<DatasetClassInfo | null>(WEST_AFRICAN_DATASET_CLASSES[0]);
  const [showJsonManifest, setShowJsonManifest] = useState(false);
  const [showKaggleInfo, setShowKaggleInfo] = useState(false);

  const categories = [
    'All',
    'Rice & Grains',
    'Soups & Stews',
    'Swallows & Traditional',
    'Grilled & Street Food',
    'Steamed & Savory',
    'Soups & Broths',
    'Snacks & Pastries',
    'Breakfast & Street Food'
  ];

  const regions = [
    'All',
    'Nigeria',
    'Ghana',
    'Senegal',
    'Pan-West Africa'
  ];

  const filteredClasses = WEST_AFRICAN_DATASET_CLASSES.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesRegion = selectedRegion === 'All' || c.region.toLowerCase().includes(selectedRegion.toLowerCase());
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.culinaryNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.visualHallmarks.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesRegion && matchesSearch;
  });

  const totalDatasetImages = WEST_AFRICAN_DATASET_CLASSES.reduce((acc, c) => acc + c.sampleCount, 0);
  const totalTrainImages = WEST_AFRICAN_DATASET_CLASSES.reduce((acc, c) => acc + (c.trainCount || Math.round(c.sampleCount * 0.7)), 0);
  const totalValImages = WEST_AFRICAN_DATASET_CLASSES.reduce((acc, c) => acc + (c.valCount || Math.round(c.sampleCount * 0.15)), 0);
  const totalTestImages = WEST_AFRICAN_DATASET_CLASSES.reduce((acc, c) => acc + (c.testCount || Math.round(c.sampleCount * 0.15)), 0);

  const handleDownloadManifest = () => {
    const exportPayload = {
      datasetMetadata: KAGGLE_DATASET_META,
      classesCount: WEST_AFRICAN_DATASET_CLASSES.length,
      totalSamples: totalDatasetImages,
      trainSplit: totalTrainImages,
      valSplit: totalValImages,
      testSplit: totalTestImages,
      classes: WEST_AFRICAN_DATASET_CLASSES
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "west_african_food_dataset_kaggle_manifest.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300" id="dataset-explorer-section">
      {/* Top Banner / Dataset Overview */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  West African Food Deep Learning Benchmark
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Kaggle Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  16 Authentic Classes
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                Curated from Kaggle Nigerian Food AI, West African Food Recognition Research, and FAO INFOODS WAFCT tables. Engineered for DenseNet201 convolutional embeddings and recipe parsing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowKaggleInfo((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{showKaggleInfo ? 'Hide Kaggle Info' : 'Kaggle Citation'}</span>
            </button>

            <button
              onClick={() => setShowJsonManifest((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              <FileJson className="w-4 h-4 text-emerald-400" />
              <span>{showJsonManifest ? 'Hide Schema' : 'View Manifest JSON'}</span>
            </button>

            <button
              onClick={handleDownloadManifest}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Dataset JSON</span>
            </button>
          </div>
        </div>

        {/* Kaggle Info Panel (Collapsible) */}
        {showKaggleInfo && (
          <div className="mt-6 p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30 text-xs text-stone-300 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                <Database className="w-4 h-4" /> {KAGGLE_DATASET_META.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                {KAGGLE_DATASET_META.license}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              {KAGGLE_DATASET_META.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-mono text-stone-400">
              <span><strong>Publisher:</strong> {KAGGLE_DATASET_META.publisher}</span>
              <span><strong>Total Dataset Repository:</strong> {KAGGLE_DATASET_META.totalImages} images</span>
              <span><strong>Active Integrated Classes:</strong> 16 classes</span>
            </div>
          </div>
        )}

        {/* Dataset Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
              Total Labeled Samples
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {totalDatasetImages.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Train: {totalTrainImages} • Val: {totalValImages} • Test: {totalTestImages}
            </span>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
              West African Dish Classes
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
              {WEST_AFRICAN_DATASET_CLASSES.length}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Nigeria, Ghana, Senegal, Sahel
            </span>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
              Deep Learning Embeddings
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              1,920-D
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              DenseNet201 + 80-D HSV Histograms
            </span>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
              Ground Truth Authenticity
            </span>
            <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
              98.8%
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Curated West African Food Taxonomy
            </span>
          </div>
        </div>
      </div>

      {/* JSON Schema Viewer (Collapsible) */}
      {showJsonManifest && (
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-800">
            <span className="font-mono text-amber-400 font-bold">
              west_african_food_dataset_manifest.json (Classes &amp; Embeddings Schema)
            </span>
            <button
              onClick={() => setShowJsonManifest(false)}
              className="text-stone-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="text-[11px] font-mono text-stone-300 max-h-72 overflow-y-auto bg-stone-900/60 p-4 rounded-xl border border-stone-800/80">
            {JSON.stringify(WEST_AFRICAN_DATASET_CLASSES, null, 2)}
          </pre>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search West African dishes, spices, or regions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono text-stone-500 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" /> Region:
            </span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === reg
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-100 text-stone-900 font-bold shadow-sm'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Layout: Grid of Classes + Selected Class Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Classes Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredClasses.map((item) => {
            const isSelected = selectedClass?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedClass(item)}
                className={`bg-stone-900 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                }`}
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={item.primaryImageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur text-[10px] font-mono text-stone-300 border border-stone-800">
                    {item.category}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40">
                    {item.authenticityScore}% Score
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/90 backdrop-blur text-[9px] font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {item.region.split('(')[0].trim()}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-[11px] font-mono text-stone-500 font-normal">
                        {item.sampleCount} imgs
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                      {item.culinaryNotes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Colors:</span>
                      <div className="flex items-center gap-1">
                        {item.dominantColors.map((hex, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-stone-700"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSampleForScan(item.primaryImageUrl);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <span>Scan Dish</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Class Deep Dive Inspector */}
        <div className="lg:col-span-5">
          {selectedClass ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    West African Class Specimen
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedClass.name}
                  </h3>
                </div>

                <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-mono font-bold text-amber-300">
                  {selectedClass.sampleCount} Samples
                </div>
              </div>

              {/* Main Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-stone-800 shadow-inner">
                <img
                  src={selectedClass.primaryImageUrl}
                  alt={selectedClass.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur text-[11px] font-mono text-stone-300 border border-stone-800">
                  Prep: {selectedClass.averagePreparationTime}
                </div>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/90 backdrop-blur text-[10px] font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedClass.region}
                </div>
              </div>

              {/* Kaggle Provenance & Split Information */}
              <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-stone-500 font-mono text-[11px]">Kaggle Origin:</span>
                  <span className="font-semibold text-amber-300 text-right">{selectedClass.kaggleSource}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400 pt-1.5 border-t border-stone-800/60 font-mono text-[11px]">
                  <span>Train: {selectedClass.trainCount || Math.round(selectedClass.sampleCount * 0.7)}</span>
                  <span>Val: {selectedClass.valCount || Math.round(selectedClass.sampleCount * 0.15)}</span>
                  <span>Test: {selectedClass.testCount || Math.round(selectedClass.sampleCount * 0.15)}</span>
                </div>
              </div>

              {/* Key Spices & Aromatics */}
              {selectedClass.keySpices && selectedClass.keySpices.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Traditional Key Spices & Aromatics</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClass.keySpices.map((spice, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/80 text-[11px] font-medium text-stone-300"
                      >
                        {spice}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Hallmarks */}
              <div>
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Visual Feature Hallmarks</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedClass.visualHallmarks.map((mark, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-300 bg-stone-950/50 p-2.5 rounded-xl border border-stone-800/60">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{mark}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Culinary Heritage Notes */}
              <div>
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Culinary Classification Notes
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed bg-stone-950/40 p-3 rounded-xl border border-stone-800/40">
                  {selectedClass.culinaryNotes}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onSelectSampleForScan(selectedClass.primaryImageUrl)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Test Model with this Sample</span>
                </button>

                {onSelectDishRecipe && (
                  <button
                    onClick={() => onSelectDishRecipe(selectedClass.name)}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors"
                  >
                    View Recipe
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center text-stone-500 text-xs">
              Select a West African food class from the left grid to inspect dataset details and embeddings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
