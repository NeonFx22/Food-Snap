import React, { useState, useEffect } from 'react';
import { 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Code2, 
  Layers, 
  Database,
  X
} from 'lucide-react';
import { checkDjangoStatus, DjangoHealthStatus } from '../services/djangoApiService';

interface DjangoBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DjangoBackendModal: React.FC<DjangoBackendModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<DjangoHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await checkDjangoStatus();
      setStatus(data);
    } catch {
      setStatus({
        available: false,
        url: 'http://localhost:8000',
        backend: 'Django REST Framework',
        message: 'Django REST Framework backend configured in /backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 flex flex-col"
        id="django-backend-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif">Django REST Framework Backend</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Python 3.10 + DRF
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Full-stack Python microservice for computer vision, ORM models, and recipe endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            id="close-django-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
            status?.available 
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {status?.available ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {status?.available 
                    ? 'Django REST API is Online & Connected!' 
                    : 'Django REST Framework Backend Configured'}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {status?.available 
                    ? `Live at ${status.url}. Responding with ${status.details?.stats?.indexed_dishes || 0} indexed dishes.`
                    : 'The backend files are generated in /backend ready to run locally, via Docker, or deploy to GitHub/Cloud Run.'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 border border-stone-700 transition-colors disabled:opacity-50 flex-shrink-0"
              id="refresh-django-status-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          {/* Quickstart Command Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              Run Django Locally
            </h4>
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-xs text-stone-300 relative group">
              <button
                onClick={() => copyToClipboard('cd backend\npython3 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\npython manage.py migrate\npython manage.py seed_dishes\npython manage.py runserver 8000', 'all_cmds')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition-colors"
                title="Copy commands"
              >
                {copiedCmd === 'all_cmds' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <div className="space-y-1 text-stone-300">
                <p className="text-stone-500"># 1. Navigate to backend directory</p>
                <p className="text-amber-300">cd backend</p>
                <p className="text-stone-500 mt-2"># 2. Install requirements</p>
                <p className="text-amber-300">pip install -r requirements.txt</p>
                <p className="text-stone-500 mt-2"># 3. Migrate and seed authentic African dishes</p>
                <p className="text-amber-300">python manage.py migrate</p>
                <p className="text-amber-300">python manage.py seed_dishes</p>
                <p className="text-stone-500 mt-2"># 4. Start the Django development server</p>
                <p className="text-emerald-400 font-bold">python manage.py runserver 8000</p>
              </div>
            </div>
          </div>

          {/* Architecture & Endpoints */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              REST Framework Endpoints Included
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                <span className="font-mono text-emerald-400 font-bold">POST /api/recognize/</span>
                <p className="text-stone-400 text-[11px] mt-1">
                  Computer vision image classification (Base64 / Multipart) with color space &amp; texture scoring.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                <span className="font-mono text-blue-400 font-bold">GET /api/recipes/</span>
                <p className="text-stone-400 text-[11px] mt-1">
                  Full CRUD &amp; search for West African &amp; international recipes with nutrition details.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                <span className="font-mono text-amber-400 font-bold">GET /api/scans/</span>
                <p className="text-stone-400 text-[11px] mt-1">
                  Audit log of food snapshot inferences, confidence metrics, and visual cues.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                <span className="font-mono text-purple-400 font-bold">GET /admin/</span>
                <p className="text-stone-400 text-[11px] mt-1">
                  Built-in Django admin portal for managing recipe datasets and scan records.
                </p>
              </div>
            </div>
          </div>

          {/* Docker & Deployment */}
          <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
              <Layers className="w-4 h-4 text-blue-400" />
              Docker &amp; Cloud Ready
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Included in the repository is a <span className="text-stone-200 font-mono">Dockerfile</span>, <span className="text-stone-200 font-mono">docker-compose.yml</span>, and <span className="text-stone-200 font-mono">Procfile</span> for containerized deployment to Render, Railway, or Google Cloud Run.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-900/60 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Proxy active at <code className="text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded">/api/django/*</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
            id="close-django-modal-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
