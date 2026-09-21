import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Check, 
  Sparkles, 
  ChefHat, 
  BookmarkCheck, 
  Camera, 
  ShieldCheck, 
  Edit3, 
  Save,
  Flame,
  Globe
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  scansCount: number;
  onViewFavorites: () => void;
  onViewScans: () => void;
}

const PREFERENCE_OPTIONS = [
  'West African Tradition',
  'Spicy & Peppery',
  'Vegetarian',
  'Halal Friendly',
  'Gluten Conscious',
  'Pescatarian',
  'Plantain Aficionado',
  'Soups & Swallows Enthusiast',
  'Keto / Low-Carb'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  favoritesCount,
  scansCount,
  onViewFavorites,
  onViewScans
}) => {
  const { user, userProfile, logout, updateProfileDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.displayName || user?.displayName || 'Culinary Foodie');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(userProfile?.dietaryPreferences || ['West African Tradition', 'Spicy & Peppery']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const togglePref = (pref: string) => {
    setSelectedPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileDetails({
        displayName: editName.trim() || 'Culinary Foodie',
        dietaryPreferences: selectedPrefs
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Active Member';

  const userInitial = (userProfile?.displayName || user?.displayName || user?.email || 'F')[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warm gradient */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/25 to-stone-900 p-6 border-b border-stone-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user?.photoURL || userProfile?.photoURL ? (
                <img
                  src={user?.photoURL || userProfile?.photoURL}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-serif text-2xl font-bold border-2 border-amber-400 shadow-md">
                  {userInitial}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-serif text-white">
                    {userProfile?.displayName || user?.displayName || 'Culinary Explorer'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Pro Member
                  </span>
                </div>
                <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user?.email || userProfile?.email || 'Registered via FoodSnap'}
                </p>
                <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  Joined {memberSince}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {saveSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-200">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Profile preferences updated successfully!</span>
            </div>
          )}

          {/* Activity & Cloud Synced Stats */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-stone-400 font-mono mb-3">
              Cloud Synced Culinary Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => { onClose(); onViewFavorites(); }}
                className="bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Favorite Dishes</span>
                  <BookmarkCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold font-serif text-white mt-2">
                  {favoritesCount}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Saved to your account</p>
              </div>

              <div 
                onClick={() => { onClose(); onViewScans(); }}
                className="bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Dish Scans</span>
                  <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold font-serif text-white mt-2">
                  {scansCount}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Recognized photos</p>
              </div>
            </div>
          </div>

          {/* Edit Profile or Display Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                Dietary &amp; Flavor Preferences
              </h4>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  Customize
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">
                    Select Your Flavor Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PREFERENCE_OPTIONS.map((pref) => {
                      const isSelected = selectedPrefs.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePref(pref)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedPrefs.length > 0 ? (
                  selectedPrefs.map((pref) => (
                    <span
                      key={pref}
                      className="px-2.5 py-1 rounded-lg text-xs bg-stone-800/80 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {pref}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 italic">No preferences set yet. Click Customize to choose your favorites.</span>
                )}
              </div>
            )}
          </div>

          {/* Database sync status */}
          <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-stone-200">Firebase Firestore Cloud Sync</div>
                <div className="text-[11px] text-stone-400">Recipes and culinary history persist across sessions</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Connected
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600 text-rose-300 font-medium text-xs sm:text-sm transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              Sign Out of Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
