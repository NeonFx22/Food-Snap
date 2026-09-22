import React, { useState } from 'react';
import { 
  Camera, 
  BookOpen, 
  Layers, 
  BookmarkCheck, 
  BarChart3, 
  HelpCircle, 
  Globe, 
  MapPin, 
  Menu, 
  X,
  Sparkles,
  ChevronRight,
  Utensils,
  Database,
  Cpu,
  User as UserIcon,
  LogIn,
  LogOut,
  UserPlus,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'scanner' | 'results' | 'datasets' | 'loading' | 'global' | 'restaurants' | 'recipes' | 'visualizer' | 'saved' | 'stats';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favoritesCount: number;
  historyCount: number;
  recipesCount: number;
  hasResults?: boolean;
  onOpenGuide?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onOpenProfile?: () => void;
  onOpenDjango?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  historyCount,
  recipesCount,
  hasResults = false,
  onOpenGuide,
  onOpenAuth,
  onOpenProfile,
  onOpenDjango
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();

  const navItems = [
    {
      id: 'scanner' as ActiveTab,
      label: 'Dish Recognition',
      shortLabel: 'Scan Dish',
      description: 'AI-assisted visual recognition from photos or camera',
      icon: Camera,
      badge: null
    },
    {
      id: 'results' as ActiveTab,
      label: 'Analysis Results',
      shortLabel: 'Results',
      description: 'Recognized dish profile, recipe instructions, and nutrition',
      icon: Sparkles,
      badge: hasResults ? 'Ready' : null
    },
    {
      id: 'datasets' as ActiveTab,
      label: 'Culinary Datasets',
      shortLabel: 'Datasets',
      description: 'Explore authentic food classes & reference samples',
      icon: Database,
      badge: '11 Classes'
    },
    {
      id: 'loading' as ActiveTab,
      label: 'Neural Pipeline',
      shortLabel: 'Pipeline',
      description: 'Inspect deep learning feature inference stages',
      icon: Cpu,
      badge: null
    },
    {
      id: 'global' as ActiveTab,
      label: 'Global Search',
      shortLabel: 'Global Search',
      description: 'Search hundreds of authentic international recipes',
      icon: Globe,
      badge: 'Worldwide'
    },
    {
      id: 'restaurants' as ActiveTab,
      label: 'Nearby Dining',
      shortLabel: 'Nearby',
      description: 'Find local spots serving recognized dishes',
      icon: MapPin,
      badge: 'Live'
    },
    {
      id: 'recipes' as ActiveTab,
      label: 'Recipe Catalog',
      shortLabel: 'Catalog',
      description: 'Curated recipes with step-by-step cooking timers',
      icon: BookOpen,
      badge: `${recipesCount}`
    },
    {
      id: 'visualizer' as ActiveTab,
      label: 'Feature Vectors',
      shortLabel: 'Vectors',
      description: 'Spatial 4×4 RGB & HSV color histogram analysis',
      icon: Layers,
      badge: '80-D'
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Saved & History',
      shortLabel: 'Saved',
      description: 'Your favorite dishes and recent scan history',
      icon: BookmarkCheck,
      badge: favoritesCount > 0 ? `${favoritesCount}` : (historyCount > 0 ? `${historyCount}` : null)
    },
    {
      id: 'stats' as ActiveTab,
      label: 'Classification Engine',
      shortLabel: 'Engine',
      description: 'Vector cosine metric performance and accuracy',
      icon: BarChart3,
      badge: null
    }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800/90 text-stone-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div 
              onClick={() => handleSelectTab('scanner')}
              className="flex items-center gap-3 cursor-pointer select-none group"
              id="brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md group-hover:from-amber-400 group-hover:to-amber-600 transition-all flex-shrink-0">
                <Utensils className="w-5 h-5 text-stone-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white font-serif">FoodSnap</span>
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Vision Engine
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 hidden sm:block">
                  Culinary Recognition &amp; Global Recipe Intelligence
                </p>
              </div>
            </div>

            {/* Right Action buttons & Desktop Navigation */}
            <div className="flex items-center gap-3">
              {/* Nav Items (Desktop) */}
              <nav className="hidden lg:flex items-center gap-1 bg-stone-950/60 p-1 rounded-2xl border border-stone-800/80" aria-label="Main Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-stone-300 hover:text-white hover:bg-stone-800/70 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          isActive 
                            ? 'bg-stone-950 text-amber-300' 
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Django API Button */}
              {onOpenDjango && (
                <button
                  onClick={onOpenDjango}
                  id="nav-btn-django"
                  className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all shadow-sm group"
                  title="Django REST Framework Microservice"
                >
                  <Server className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Django API</span>
                </button>
              )}

              {/* Auth / Profile Button (Desktop) */}
              <div className="hidden sm:flex items-center">
                {user || userProfile ? (
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-medium transition-all shadow-sm group"
                    title="Account & Profile"
                  >
                    {user?.photoURL || userProfile?.photoURL ? (
                      <img 
                        src={user?.photoURL || userProfile?.photoURL} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover border border-amber-400"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                        {(userProfile?.displayName || user?.displayName || user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-stone-200 group-hover:text-amber-300">
                      {userProfile?.displayName || user?.displayName || 'Chef'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth?.('signin')}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 transition-colors flex items-center justify-center min-h-[42px] min-w-[42px]"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Horizontal Quick-Scroll Bar on Mobile */}
          <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-stone-800/80 scrollbar-none items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all min-h-[36px] ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-stone-800/90 text-stone-300 hover:bg-stone-800 border border-stone-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.shortLabel}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      isActive ? 'bg-stone-950 text-amber-300' : 'bg-stone-900 text-stone-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Modern Slide-Over Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md lg:hidden flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-stone-900 border-l border-stone-800 h-full flex flex-col justify-between shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top */}
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-serif">FoodSnap Navigation</h3>
                    <p className="text-[11px] text-stone-400">Select any section to explore</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User Profile or Login Box */}
              <div className="bg-stone-950/80 border border-stone-800 p-3.5 rounded-2xl">
                {user || userProfile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {user?.photoURL || userProfile?.photoURL ? (
                        <img 
                          src={user?.photoURL || userProfile?.photoURL} 
                          alt="Profile" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-amber-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-serif font-bold text-base flex items-center justify-center shadow">
                          {(userProfile?.displayName || user?.displayName || user?.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {userProfile?.displayName || user?.displayName || 'Culinary Foodie'}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">
                          {user?.email || userProfile?.email || 'Cloud Member'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenProfile?.();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 text-xs font-semibold whitespace-nowrap"
                    >
                      View Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-stone-300">
                      Sign in to synchronize your favorite dishes and scans across all devices.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenAuth?.('signin');
                        }}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenAuth?.('signup');
                        }}
                        className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Register
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Nav List */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all border ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                          : 'bg-stone-950/60 text-stone-300 hover:text-white hover:bg-stone-800/80 border-stone-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive 
                            ? 'bg-amber-500 text-stone-950 font-bold' 
                            : 'bg-stone-800 text-stone-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-bold truncate">{item.label}</div>
                          <div className="text-[11px] text-stone-400 truncate">{item.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-600'}`} />
                      </div>
                    </button>
                  );
                })}

                {/* Django API Option in Mobile Menu */}
                {onOpenDjango && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDjango();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all border bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-bold truncate">Django REST Framework</div>
                        <div className="text-[11px] text-emerald-400/80 truncate">Python microservice &amp; REST API endpoints</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Bottom */}
            {onOpenGuide && (
              <div className="pt-5 mt-4 border-t border-stone-800">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenGuide();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>How FoodSnap Works (User Guide)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
