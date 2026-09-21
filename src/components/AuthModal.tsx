import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Utensils, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  ArrowRight,
  ShieldCheck,
  ChefHat
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const DIETARY_OPTIONS = [
  'West African Tradition',
  'Spicy & Peppery',
  'Vegetarian',
  'Halal Friendly',
  'Gluten Conscious',
  'Pescatarian',
  'Keto / Low-Carb'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signUpWithEmail, 
    loginAsDemoUser, 
    resetPassword,
    authError, 
    clearError,
    isLoading 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'West African Tradition',
    'Spicy & Peppery'
  ]);
  const [resetSent, setResetSent] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePreference = (pref: string) => {
    setSelectedPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup' | 'forgot') => {
    clearError();
    setLocalMessage(null);
    setResetSent(false);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          setLocalMessage('Please enter both email and password.');
          return;
        }
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!email.trim() || !password) {
          setLocalMessage('Please provide your email and a secure password.');
          return;
        }
        if (password.length < 6) {
          setLocalMessage('Password must be at least 6 characters long.');
          return;
        }
        await signUpWithEmail(displayName || 'Culinary Foodie', email, password, selectedPreferences);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setLocalMessage('Please enter your email address to receive reset instructions.');
          return;
        }
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      // Error is caught and stored in authError or handled by context
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // handled
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    try {
      await loginAsDemoUser();
      onClose();
    } catch {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-stone-900 p-6 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <Utensils className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">FoodSnap Account</h3>
                <p className="text-xs text-amber-300/80">Save dishes, sync recipes &amp; culinary history</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-stone-950/70 p-1 rounded-xl border border-stone-800 mt-5">
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Error display */}
          {(authError || localMessage) && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {localMessage || authError}
              </div>
            </div>
          )}

          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600 text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-800" />
                </div>
                <span className="relative px-3 bg-stone-900 text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                  or with email
                </span>
              </div>
            </div>
          )}

          {/* Password Reset Confirmation */}
          {mode === 'forgot' && resetSent ? (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-semibold text-emerald-200 text-sm">Password Reset Email Sent</h4>
              <p className="text-xs text-stone-300">
                Check <strong className="text-white">{email}</strong> for instructions to reset your password.
              </p>
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Your Name or Chef Handle
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Chef Favour"
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-stone-300">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('forgot')}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                      className="w-full pl-9 pr-10 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Dietary Preferences (Sign Up Only) */}
              {mode === 'signup' && (
                <div className="pt-1">
                  <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                    Culinary Interests &amp; Preferences
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((pref) => {
                      const isSelected = selectedPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                              : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In to FoodSnap'}
                    {mode === 'signup' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Chef Account */}
          <div className="pt-2 border-t border-stone-800/80">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore as <strong>Demo Chef</strong> (1-Click Instant)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted cloud database &amp; authentication via Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
};
