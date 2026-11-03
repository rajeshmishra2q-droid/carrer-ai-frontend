import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from 'react';
import {
  Compass,
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Target,
  Map,
  Scale,
  MessageSquareCode,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Lightbulb,
  Layers,
  Code2,
  GraduationCap,
  Sliders,
  WifiOff,
  Terminal,
  Info,
  Check,
  Search,
  User,
  Zap,
  ShieldCheck,
  FileText,
} from 'lucide-react';

import {
  careerApiService,
  ApiError,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  DEFAULT_API_BASE_URL,
  apiRequest,
} from './services/api';

export {
  careerApiService,
  ApiError,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  DEFAULT_API_BASE_URL,
};

/**
 * ============================================================================
 * 2. DEFENSIVE RESPONSE NORMALIZERS (Renders actual backend fields cleanly)
 * ============================================================================
 * Never invents data; extracts nested objects/arrays returned by the API.
 */

const unwrapPayload = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  if (raw.data && typeof raw.data === 'object') return raw.data;
  if (raw.result && typeof raw.result === 'object') return raw.result;
  return raw;
};

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    if (val.includes('\n') || val.includes('•')) {
      return val
        .split(/\n|•/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [val.trim()];
  }
  return [];
};

const extractUrlFromText = (text) => {
  if (typeof text !== 'string') return null;
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
};

/**
 * ============================================================================
 * 3. APPLICATION CONTEXT (Theme, Navigation, Toasts, Shared Workflow State)
 * ============================================================================
 */

const AppContext = createContext(null);

const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

/**
 * ============================================================================
 * 4. CUSTOM SVG BRAND & HERO VISUALS
 * ============================================================================
 */

const BrandCompassIcon = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="compassGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="needleGrad" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="50%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#compassGrad)" fillOpacity="0.16" stroke="url(#compassGrad)" strokeWidth="1.75" />
    <circle cx="20" cy="20" r="12" stroke="url(#compassGrad)" strokeWidth="1.3" strokeDasharray="3 2.5" />
    <path
      d="M25.8 14.2L22.2 22.2L14.2 25.8L17.8 17.8L25.8 14.2Z"
      fill="url(#needleGrad)"
      stroke="#F8FAFC"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="20" r="2" fill="#080B14" stroke="#F8FAFC" strokeWidth="1.2" />
    {/* AI Spark Star in top-right */}
    <path
      d="M31 6L32.1 9.1L35.2 10.2L32.1 11.3L31 14.4L29.9 11.3L26.8 10.2L29.9 9.1L31 6Z"
      fill="#06B6D4"
    />
  </svg>
);

const HeroCompassVisual = ({ reducedMotion }) => (
  <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[340px] aspect-square mx-auto select-none">
    {/* Ambient Glow */}
    <div
      className="absolute inset-4 rounded-full pointer-events-none"
      style={{
        background:
          'radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 72%)',
        filter: 'blur(24px)',
      }}
    />
    <svg
      viewBox="0 0 320 320"
      className="w-full h-full relative z-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AI Career Compass interactive orbital illustration"
    >
      <defs>
        <linearGradient id="heroRing1" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="heroNeedleNorth" x1="160" y1="70" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="heroNeedleSouth" x1="160" y1="160" x2="160" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Outer Degree Ring */}
      <circle
        cx="160"
        cy="160"
        r="142"
        stroke="url(#heroRing1)"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <circle
        cx="160"
        cy="160"
        r="124"
        stroke="url(#heroRing1)"
        strokeWidth="1.2"
        strokeDasharray="6 6"
        className={reducedMotion ? '' : 'compass-spin-slow'}
        style={{ transformOrigin: '160px 160px' }}
      />
      <circle
        cx="160"
        cy="160"
        r="96"
        stroke="rgba(148, 163, 184, 0.2)"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="160"
        r="66"
        stroke="rgba(6, 182, 212, 0.3)"
        strokeWidth="1.2"
        strokeDasharray="3 5"
        className={reducedMotion ? '' : 'compass-spin-reverse'}
        style={{ transformOrigin: '160px 160px' }}
      />

      {/* Cardinal Ticks & Labels */}
      <g className="text-xs font-semibold" fill="#94A3B8" fontSize="10" fontFamily="Inter, sans-serif">
        <text x="160" y="34" textAnchor="middle" fill="#06B6D4" fontWeight="700">AI</text>
        <text x="288" y="164" textAnchor="middle">SKILLS</text>
        <text x="160" y="294" textAnchor="middle">GROWTH</text>
        <text x="32" y="164" textAnchor="middle">PATH</text>
      </g>

      {/* Crosshair Lines */}
      <line x1="160" y1="44" x2="160" y2="276" stroke="rgba(148, 163, 184, 0.14)" strokeWidth="1" />
      <line x1="44" y1="160" x2="276" y2="160" stroke="rgba(148, 163, 184, 0.14)" strokeWidth="1" />

      {/* Compass Needle Group */}
      <g
        className={reducedMotion ? '' : 'compass-needle-float'}
        style={{ transformOrigin: '160px 160px' }}
      >
        <g transform="rotate(35 160 160)">
          {/* North pointer */}
          <polygon points="160,64 174,160 160,148 146,160" fill="url(#heroNeedleNorth)" />
          {/* South pointer */}
          <polygon points="160,256 174,160 160,172 146,160" fill="url(#heroNeedleSouth)" />
          {/* Center cap */}
          <circle cx="160" cy="160" r="10" fill="#0C1020" stroke="#06B6D4" strokeWidth="2.5" />
          <circle cx="160" cy="160" r="3.5" fill="#F8FAFC" />
        </g>
      </g>

      {/* Floating AI Sparkle Nodes */}
      <g>
        <circle cx="238" cy="82" r="5" fill="#06B6D4" />
        <circle cx="238" cy="82" r="10" stroke="#06B6D4" strokeOpacity="0.4" strokeWidth="1.5" />
        <circle cx="78" cy="222" r="4.5" fill="#8B5CF6" />
        <circle cx="78" cy="222" r="9" stroke="#8B5CF6" strokeOpacity="0.4" strokeWidth="1.5" />
        <path
          d="M95 75L97.2 81.8L104 84L97.2 86.2L95 93L92.8 86.2L86 84L92.8 81.8L95 75Z"
          fill="#8B5CF6"
        />
        <path
          d="M242 218L243.6 222.8L248.4 224.4L243.6 226L242 230.8L240.4 226L235.6 224.4L240.4 222.8L242 218Z"
          fill="#06B6D4"
        />
      </g>
    </svg>
  </div>
);

/**
 * ============================================================================
 * 5. REUSABLE UI COMPONENTS (TagInput, Skeleton, ApiErrorCard, EmptyState)
 * ============================================================================
 */

const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Type and press Enter...',
  suggestions = [],
  helperText = 'Press Enter or comma to add a tag',
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (rawVal) => {
    const clean = String(rawVal || '').trim();
    if (!clean) return;
    const exists = tags.some((t) => t.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      onChange([...tags, clean]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    if (disabled) return;
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.includes(',')) {
      e.preventDefault();
      const parts = pasted
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const merged = [...tags];
      parts.forEach((p) => {
        if (!merged.some((t) => t.toLowerCase() === p.toLowerCase())) {
          merged.push(p);
        }
      });
      onChange(merged);
    }
  };

  const availableSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-main)]">
          {label} {required && <span className="text-[#8B5CF6]">*</span>}
        </label>
      )}
      <div
        className={`min-h-[48px] px-3 py-2 rounded-xl border transition-all duration-200 flex flex-wrap items-center gap-2 bg-[var(--bg-elevated)] border-[var(--border-color)] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/20 ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B5CF6]/15 text-[#C4B5FD] light-chip border border-[#8B5CF6]/30 transition-transform duration-150"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              disabled={disabled}
              className="hover:text-white focus:outline-none rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none py-1"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <span className="text-xs text-[var(--text-secondary)]">{helperText}</span>
        {availableSuggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-secondary)] mr-0.5">Quick add:</span>
            {availableSuggestions.slice(0, 5).map((item) => (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => addTag(item)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] hover:bg-[#8B5CF6]/20 text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] hover:border-[#8B5CF6]/40 transition-colors"
              >
                + {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  return (
    <div className="space-y-4 py-2" role="status" aria-live="polite" aria-label="Loading AI response">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25">
        <RefreshCw className="w-4 h-4 text-[#8B5CF6] animate-spin shrink-0" />
        <span className="text-sm font-medium text-[var(--text-main)]">
          Communicating with AI Career Compass API at <code className="text-xs font-mono text-[#06B6D4]">{getApiBaseUrl()}</code>...
        </span>
      </div>
      <div className={type === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="h-5 w-1/3 rounded-lg bg-[var(--bg-elevated)]" />
              <div className="h-6 w-20 rounded-full bg-[var(--bg-elevated)]" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-[var(--bg-elevated)]" />
              <div className="h-3.5 w-5/6 rounded bg-[var(--bg-elevated)]" />
              <div className="h-3.5 w-2/3 rounded bg-[var(--bg-elevated)]" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 rounded-md bg-[var(--bg-elevated)]" />
              <div className="h-6 w-20 rounded-md bg-[var(--bg-elevated)]" />
              <div className="h-6 w-14 rounded-md bg-[var(--bg-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ApiErrorState = ({ error, onRetry }) => {
  const [showPayload, setShowPayload] = useState(false);
  if (!error) return null;

  const isNetwork = error.isNetworkError;

  return (
    <div
      role="alert"
      className="p-6 rounded-2xl bg-[var(--bg-card)] border border-red-500/30 shadow-lg space-y-4 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 shrink-0 mt-0.5">
            {isNetwork ? <WifiOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              {isNetwork ? 'Backend Server Connection Failed' : 'API Request Failed'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {error.message || 'An unexpected error occurred while communicating with the AI service.'}
            </p>
            {error.endpoint && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[#06B6D4] border border-[var(--border-color)]">
                  POST {getApiBaseUrl()}{error.endpoint}
                </span>
                {error.status && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-400">
                    HTTP {error.status}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Request</span>
          </button>
        )}
      </div>

      {isNetwork && (
        <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-1.5">
          <div className="font-medium text-[var(--text-main)] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Troubleshooting Checklist:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Verify the backend API is live at <code className="text-[#06B6D4]">{getApiBaseUrl()}</code>.</li>
            <li>Check your internet connection and verify CORS is allowed for your frontend origin.</li>
            <li>You can customize the API Base URL at any time in Application Settings (top-right gear icon).</li>
          </ul>
        </div>
      )}

      {error.payload && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] inline-flex items-center gap-1 underline underline-offset-4"
          >
            <span>{showPayload ? 'Hide' : 'Inspect'} Request Payload</span>
            {showPayload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPayload && (
            <pre className="mt-2 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] overflow-x-auto">
              {JSON.stringify(error.payload, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon = Compass, title, description, actionLabel, onAction }) => (
  <div className="p-8 sm:p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center max-w-2xl mx-auto my-4 space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto text-[#8B5CF6]">
      <Icon className="w-7 h-7" />
    </div>
    <div className="space-y-1.5">
      <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
    {actionLabel && onAction && (
      <div className="pt-2">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/20 text-[var(--text-main)] border border-[var(--border-color)] hover:border-[#8B5CF6]/40 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>{actionLabel}</span>
        </button>
      </div>
    )}
  </div>
);

/**
 * Helper component to render any additional/unexpected fields returned by the backend
 * so no real AI output is ever lost.
 */
const ExtraFieldsRenderer = ({ data, omitKeys = [] }) => {
  if (!data || typeof data !== 'object') return null;
  const omitted = new Set(omitKeys.map((k) => k.toLowerCase()));
  const entries = Object.entries(data).filter(
    ([key, val]) =>
      !omitted.has(key.toLowerCase()) &&
      val !== null &&
      val !== undefined &&
      val !== '' &&
      !(Array.isArray(val) && val.length === 0)
  );

  if (entries.length === 0) return null;

  const formatKey = (k) =>
    k
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="pt-3 mt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map(([key, val]) => (
        <div key={key} className="p-3 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            {formatKey(key)}
          </div>
          {Array.isArray(val) ? (
            <ul className="list-disc list-inside text-xs text-[var(--text-main)] space-y-1">
              {val.map((item, i) => (
                <li key={i}>
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </li>
              ))}
            </ul>
          ) : typeof val === 'object' ? (
            <pre className="text-xs font-mono text-[var(--text-main)] whitespace-pre-wrap break-words">
              {JSON.stringify(val, null, 2)}
            </pre>
          ) : (
            <div className="text-sm text-[var(--text-main)] break-words">{String(val)}</div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * ============================================================================
 * 6. PAGE 1: DASHBOARD PAGE (src/pages/Dashboard.jsx)
 * ============================================================================
 * Hero section with "Navigate Your Future with AI", CTA buttons, SVG AI Compass,
 * and 5 feature cards. Zero fake stats or fabricated user data.
 */

const FEATURE_CARDS = [
  {
    id: 'recommendations',
    title: 'Career Recommendations',
    description:
      'Discover high-fit career paths tailored to your current technical skills, academic background, and core interests.',
    icon: Briefcase,
    endpoint: 'POST /career/recommend',
    accent: '#8B5CF6',
    badge: 'Personalized Matching',
  },
  {
    id: 'skill-gap',
    title: 'Skill Gap Analysis',
    description:
      'Evaluate your current skill set against your target role to uncover priority gaps, proficiency levels, and estimated learning time.',
    icon: Target,
    endpoint: 'POST /skill/gap-analysis',
    accent: '#06B6D4',
    badge: 'Readiness Assessment',
  },
  {
    id: 'roadmap',
    title: 'Learning Roadmap',
    description:
      'Generate a structured, month-by-month learning timeline complete with milestones, curated resources, and practical tips.',
    icon: Map,
    endpoint: 'POST /roadmap/generate',
    accent: '#22C55E',
    badge: 'Step-by-Step Timeline',
  },
  {
    id: 'comparison',
    title: 'Career Comparison',
    description:
      'Compare two or more careers side-by-side across salary expectations, growth outlook, work-life balance, pros, and cons.',
    icon: Scale,
    endpoint: 'POST /guidance/compare',
    accent: '#F59E0B',
    badge: 'Side-by-Side Matrix',
  },
  {
    id: 'guidance',
    title: 'AI Career Guidance',
    description:
      'Ask specific career questions with your skills and education context to receive structured advice and actionable next steps.',
    icon: MessageSquareCode,
    endpoint: 'POST /guidance/advice',
    accent: '#8B5CF6',
    badge: 'Contextual AI Advisor',
  },
];

const DashboardPage = () => {
  const { navigateTo, reducedMotion } = useApp();

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-10 lg:p-12 shadow-xl">
        {/* Subtle decorative background gradient */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35), transparent 70%)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#C4B5FD] light-chip text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>AI-POWERED CAREER INTELLIGENCE PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Navigate Your Future with{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#06B6D4] bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Discover the right career, build the skills that matter, and create your personalized roadmap to success.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('recommendations')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-lg shadow-[#8B5CF6]/25 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Careers</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('roadmap')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 text-[var(--text-main)] border border-[var(--border-color)] hover:border-[#8B5CF6]/40 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <Map className="w-4 h-4 text-[#06B6D4]" />
                <span>Generate Learning Roadmap</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroCompassVisual reducedMotion={reducedMotion} />
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Core AI Capabilities
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Select a module below to launch real-time analysis powered by your AI Career Compass backend.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_CARDS.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigateTo(card.id)}
                className={`group text-left p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#8B5CF6]/50 transition-all duration-200 flex flex-col justify-between gap-5 shadow-sm hover:shadow-xl hover:shadow-[#8B5CF6]/5 cursor-pointer ${
                  !reducedMotion ? 'hover:-translate-y-1' : ''
                } ${idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105"
                      style={{
                        backgroundColor: `${card.accent}18`,
                        borderColor: `${card.accent}40`,
                        color: card.accent,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[#8B5CF6] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <code className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {card.endpoint}
                  </code>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#8B5CF6] group-hover:translate-x-1 transition-transform">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/**
 * ============================================================================
 * 7. PAGE 2: CAREER RECOMMENDATIONS PAGE (src/pages/CareerRecommendations.jsx)
 * ============================================================================
 * Connects to POST /career/recommend
 * Payload: { skills, interests, education, experience_level }
 */

const SKILL_SUGGESTIONS = ['Python', 'C', 'JavaScript', 'SQL', 'React', 'Data Structures', 'Machine Learning', 'Java', 'HTML/CSS'];
const INTEREST_SUGGESTIONS = ['Artificial Intelligence', 'Web Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Mobile Apps'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const CareerRecommendationsPage = () => {
  const { showToast, navigateTo, setSharedCareerTarget, setSharedSkills } = useApp();

  const [skills, setSkills] = useState(['Python', 'C']);
  const [interests, setInterests] = useState(['Artificial Intelligence', 'Web Development']);
  const [education, setEducation] = useState('B.Tech CSIT');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [selectedCareerModal, setSelectedCareerModal] = useState(null);

  const handleLoadSample = () => {
    setSkills(['Python', 'C']);
    setInterests(['Artificial Intelligence', 'Web Development']);
    setEducation('B.Tech CSIT');
    setExperienceLevel('Beginner');
    showToast('Loaded contract sample parameters.', 'info');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (skills.length === 0) {
      showToast('Please add at least one skill.', 'warning');
      return;
    }
    if (interests.length === 0) {
      showToast('Please add at least one area of interest.', 'warning');
      return;
    }
    if (!education.trim()) {
      showToast('Please enter your education background.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await careerApiService.recommendCareers({
        skills,
        interests,
        education: education.trim(),
        experience_level: experienceLevel.toLowerCase(),
      });
      setResultData(response);
      setSharedSkills(skills);
      showToast('Career recommendations generated!', 'success');
    } catch (err) {
      setError(err);
      showToast(err.isNetworkError ? 'Backend service unreachable. Please check connection or API settings.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Defensively parse career list from real backend response
  const extractCareersList = (raw) => {
    if (!raw) return [];
    const unwrapped = unwrapPayload(raw);
    if (Array.isArray(unwrapped)) return unwrapped;
    if (Array.isArray(unwrapped?.recommendations)) return unwrapped.recommendations;
    if (Array.isArray(unwrapped?.careers)) return unwrapped.careers;
    if (Array.isArray(unwrapped?.results)) return unwrapped.results;
    if (Array.isArray(raw?.recommendations)) return raw.recommendations;
    if (Array.isArray(raw?.careers)) return raw.careers;
    return [];
  };

  const careersList = extractCareersList(resultData);
  const topLevelUnwrapped = unwrapPayload(resultData);

  const handleJumpToAction = (careerTitle, targetPage) => {
    if (careerTitle) {
      setSharedCareerTarget(careerTitle);
      setSharedSkills(skills);
    }
    setSelectedCareerModal(null);
    navigateTo(targetPage);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Input Form Card */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#8B5CF6]" />
              <span>Career Profile Parameters</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Enter your current skills, interests, education, and experience level for AI matching.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={loading}
            className="self-start sm:self-auto text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors cursor-pointer"
          >
            Reset to Default Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TagInput
            label="Your Current Skills"
            required
            tags={skills}
            onChange={setSkills}
            placeholder="e.g. Python, C, SQL..."
            suggestions={SKILL_SUGGESTIONS}
            disabled={loading}
          />

          <TagInput
            label="Your Career Interests"
            required
            tags={interests}
            onChange={setInterests}
            placeholder="e.g. Artificial Intelligence, Web Development..."
            suggestions={INTEREST_SUGGESTIONS}
            disabled={loading}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-main)]">
              Education Background <span className="text-[#8B5CF6]">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                disabled={loading}
                placeholder="e.g. B.Tech CSIT"
                className="w-full h-[48px] pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-main)]">
              Experience Level <span className="text-[#8B5CF6]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5 h-[48px]">
              {EXPERIENCE_LEVELS.map((level) => {
                const active = experienceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={loading}
                    onClick={() => setExperienceLevel(level)}
                    className={`rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[var(--text-main)] shadow-sm'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span>Endpoint: <code className="font-mono text-[#06B6D4]">POST /api/career/recommend</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 text-white shadow-lg shadow-[#8B5CF6]/25 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get AI Career Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* States: Loading, Error, Empty, Results */}
      {loading && <SkeletonLoader count={4} type="grid" />}

      {!loading && error && <ApiErrorState error={error} onRetry={handleSubmit} />}

      {!loading && !error && !resultData && (
        <EmptyState
          icon={Briefcase}
          title="Ready to Discover Your Ideal Career"
          description="Submit your skills, interests, education, and experience level above to fetch real-time AI career recommendations from your backend."
          actionLabel="Run Recommendation Analysis"
          onAction={handleSubmit}
        />
      )}

      {!loading && !error && resultData && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <span>
                Recommended Career Paths{' '}
                {careersList.length > 0 && (
                  <span className="text-sm font-normal text-[var(--text-secondary)]">
                    ({careersList.length} {careersList.length === 1 ? 'match' : 'matches'})
                  </span>
                )}
              </span>
            </h3>
          </div>

          {careersList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {careersList.map((item, idx) => {
                const title =
                  item.career_title ||
                  item.title ||
                  item.career ||
                  item.role ||
                  item.name ||
                  `Career Option #${idx + 1}`;
                const matchScore =
                  item.match_score ??
                  item.score ??
                  item.match_percentage ??
                  item.compatibility ??
                  null;
                const description =
                  item.description || item.summary || item.overview || '';
                const salary =
                  item.average_salary || item.salary || item.salary_range || null;
                const growth =
                  item.growth_outlook || item.growth || item.job_growth || null;
                const whyGoodFit =
                  item.why_good_fit || item.why_fit || item.why_this_career || null;
                const reasons = whyGoodFit
                  ? (Array.isArray(whyGoodFit) ? whyGoodFit : [whyGoodFit])
                  : toArray(item.reasons || item.rationale);
                const reqSkills = toArray(
                  item.key_skills_needed ||
                  item.required_skills ||
                  item.skills_required ||
                  item.key_skills ||
                  item.skills
                );

                return (
                  <div
                    key={`${title}-${idx}`}
                    className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#8B5CF6]/50 transition-all flex flex-col justify-between gap-5 shadow-sm hover:shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#06B6D4]">
                            Recommendation #{idx + 1}
                          </span>
                          <h4 className="text-xl font-bold text-[var(--text-main)]">
                            {title}
                          </h4>
                        </div>

                        {matchScore !== null && matchScore !== undefined && (
                          <div className="px-3 py-1.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold shrink-0">
                            {typeof matchScore === 'number' && matchScore <= 1
                              ? `${Math.round(matchScore * 100)}% Match`
                              : String(matchScore).includes('%')
                              ? `${matchScore} Match`
                              : `${matchScore}% Match`}
                          </div>
                        )}
                      </div>

                      {(salary || growth) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {salary && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                              <Award className="w-3.5 h-3.5" />
                              <span>Salary: {salary}</span>
                            </span>
                          )}
                          {growth && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[220px]" title={growth}>Outlook: {growth}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {description && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {description}
                        </p>
                      )}

                      {reasons.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            Why It Fits You
                          </div>
                          <ul className="space-y-1.5">
                            {reasons.slice(0, 3).map((r, rIdx) => (
                              <li
                                key={rIdx}
                                className="text-xs sm:text-sm text-[var(--text-main)] flex items-start gap-2"
                              >
                                <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                                <span>{typeof r === 'object' ? JSON.stringify(r) : r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reqSkills.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            Required Skills
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {reqSkills.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-color)]"
                              >
                                {typeof sk === 'object' ? sk.name || JSON.stringify(sk) : sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCareerModal({ item, title, matchScore, description, salary, growth, reasons, reqSkills })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Full Details</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleJumpToAction(title, 'skill-gap')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/20 text-[var(--text-main)] border border-[var(--border-color)] transition-colors cursor-pointer"
                        >
                          Skill Gap
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJumpToAction(title, 'roadmap')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#C4B5FD] light-chip border border-[#8B5CF6]/30 transition-colors cursor-pointer"
                        >
                          Roadmap
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <ExtraFieldsRenderer data={topLevelUnwrapped} omitKeys={['success']} />
            </div>
          )}
        </div>
      )}

      {/* Career Details Modal */}
      {selectedCareerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCareerModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4]">
                  Detailed Career Breakdown
                </span>
                <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">
                  {selectedCareerModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCareerModal(null)}
                className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(selectedCareerModal.salary || selectedCareerModal.growth) && (
              <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                {selectedCareerModal.salary && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                    <Award className="w-4 h-4" />
                    <span>Average Compensation: {selectedCareerModal.salary}</span>
                  </span>
                )}
                {selectedCareerModal.growth && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                    <Zap className="w-4 h-4" />
                    <span>Growth Outlook: {selectedCareerModal.growth}</span>
                  </span>
                )}
              </div>
            )}

            {selectedCareerModal.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Overview
                </h4>
                <p className="text-sm text-[var(--text-main)] leading-relaxed">
                  {selectedCareerModal.description}
                </p>
              </div>
            )}

            {selectedCareerModal.reasons.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Alignment & Match Reasons
                </h4>
                <ul className="space-y-2">
                  {selectedCareerModal.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-[var(--text-main)] flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <span>{typeof r === 'object' ? JSON.stringify(r) : r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCareerModal.reqSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCareerModal.reqSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#8B5CF6]/15 text-[#C4B5FD] light-chip border border-[#8B5CF6]/30"
                    >
                      {typeof s === 'object' ? s.name || JSON.stringify(s) : s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ExtraFieldsRenderer
              data={selectedCareerModal.item}
              omitKeys={[
                'career_title',
                'title',
                'career',
                'role',
                'name',
                'match_score',
                'score',
                'match_percentage',
                'compatibility',
                'description',
                'summary',
                'overview',
                'reasons',
                'why_fit',
                'why_this_career',
                'rationale',
                'required_skills',
                'skills_required',
                'key_skills',
                'skills',
                'key_skills_needed',
                'average_salary',
                'salary',
                'growth_outlook',
                'why_good_fit',
              ]}
            />

            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleJumpToAction(selectedCareerModal.title, 'skill-gap')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] hover:bg-[#06B6D4]/20 text-[var(--text-main)] border border-[var(--border-color)] cursor-pointer"
              >
                <Target className="w-4 h-4 text-[#06B6D4]" />
                <span>Analyze Skill Gap for {selectedCareerModal.title}</span>
              </button>
              <button
                type="button"
                onClick={() => handleJumpToAction(selectedCareerModal.title, 'roadmap')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer"
              >
                <Map className="w-4 h-4" />
                <span>Build Learning Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * 8. PAGE 3: SKILL GAP ANALYSIS PAGE (src/pages/SkillGapAnalysis.jsx)
 * ============================================================================
 * Connects to POST /skill/gap-analysis
 * Payload: { current_skills: string[], target_career: string }
 */

const TARGET_CAREER_PRESETS = [
  'AI/ML Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Cloud Solutions Architect',
  'Cybersecurity Analyst',
];

const SkillGapAnalysisPage = () => {
  const { showToast, sharedCareerTarget, sharedSkills, navigateTo, setSharedCareerTarget, setSharedSkills } = useApp();

  const [targetCareer, setTargetCareer] = useState(sharedCareerTarget || 'AI/ML Engineer');
  const [currentSkills, setCurrentSkills] = useState(
    sharedSkills && sharedSkills.length > 0 ? sharedSkills : ['Python', 'C', 'Basic SQL']
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (sharedCareerTarget) setTargetCareer(sharedCareerTarget);
  }, [sharedCareerTarget]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!targetCareer.trim()) {
      showToast('Please enter a target career.', 'warning');
      return;
    }
    if (currentSkills.length === 0) {
      showToast('Please enter at least one current skill.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await careerApiService.analyzeSkillGap({
        current_skills: currentSkills,
        target_career: targetCareer.trim(),
      });
      setResultData(response);
      setSharedCareerTarget(targetCareer.trim());
      setSharedSkills(currentSkills);
      showToast('Skill gap analysis complete!', 'success');
    } catch (err) {
      setError(err);
      showToast(err.isNetworkError ? 'Backend service unreachable. Please check connection or API settings.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const unwrapped = unwrapPayload(resultData) || {};
  const readinessScore =
    unwrapped.readiness_score ??
    unwrapped.readiness ??
    unwrapped.overall_readiness ??
    unwrapped.match_score ??
    null;

  const estimatedTime =
    unwrapped.estimated_time_to_fill_gaps ||
    unwrapped.estimated_learning_time ||
    unwrapped.estimated_time ||
    unwrapped.learning_time ||
    unwrapped.timeline ||
    null;

  const prioritySkills = toArray(
    unwrapped.priority_skills ||
      unwrapped.missing_skills ||
      unwrapped.critical_skills ||
      unwrapped.skills_to_learn
  );

  const assessments = Array.isArray(unwrapped.skill_assessment)
    ? unwrapped.skill_assessment
    : Array.isArray(unwrapped.skill_assessments)
    ? unwrapped.skill_assessments
    : Array.isArray(unwrapped.assessments)
    ? unwrapped.assessments
    : Array.isArray(unwrapped.skills)
    ? unwrapped.skills
    : [];

  const overallRecommendation =
    unwrapped.recommendation ||
    unwrapped.overall_recommendation ||
    unwrapped.summary ||
    unwrapped.advice ||
    '';

  const getStatusBadgeStyle = (statusStr) => {
    const s = String(statusStr || '').toLowerCase();
    if (s.includes('possessed') || s.includes('strong') || s.includes('master') || s.includes('proficient') || s.includes('met') || s.includes('complete')) {
      return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
    }
    if (s.includes('missing') || s.includes('gap') || s.includes('none') || s.includes('critical') || s.includes('low')) {
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
    return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
  };

  const parseProficiencyPercent = (val) => {
    if (typeof val === 'number') {
      return val <= 1 ? Math.round(val * 100) : Math.min(100, Math.max(0, Math.round(val)));
    }
    if (typeof val === 'string') {
      const num = parseFloat(val);
      if (!isNaN(num)) return Math.min(100, Math.max(0, Math.round(num)));
      const lower = val.toLowerCase();
      if (lower.includes('advanced') || lower.includes('high') || lower.includes('expert')) return 85;
      if (lower.includes('intermediate') || lower.includes('medium') || lower.includes('moderate')) return 55;
      if (lower.includes('beginner') || lower.includes('basic') || lower.includes('low')) return 30;
      if (lower.includes('missing') || lower.includes('none')) return 5;
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#06B6D4]" />
              <span>Skill Gap Configuration</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Compare your existing skills against the requirements of your target career.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-main)]">
              Target Career <span className="text-[#8B5CF6]">*</span>
            </label>
            <input
              type="text"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              disabled={loading}
              placeholder="e.g. AI/ML Engineer"
              className="w-full h-[48px] px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Popular roles:</span>
              {TARGET_CAREER_PRESETS.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={loading}
                  onClick={() => setTargetCareer(role)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    targetCareer === role
                      ? 'bg-[#8B5CF6]/20 text-[var(--text-main)] border-[#8B5CF6]/50'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border-[var(--border-color)]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <TagInput
            label="Your Current Skills"
            required
            tags={currentSkills}
            onChange={setCurrentSkills}
            placeholder="e.g. Python, C, Basic SQL..."
            suggestions={SKILL_SUGGESTIONS}
            disabled={loading}
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span>Endpoint: <code className="font-mono text-[#06B6D4]">POST /api/skill/gap-analysis</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 disabled:opacity-50 text-white shadow-lg shadow-[#8B5CF6]/20 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Skill Gaps...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Run Skill Gap Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>

      {loading && <SkeletonLoader count={3} />}

      {!loading && error && <ApiErrorState error={error} onRetry={handleSubmit} />}

      {!loading && !error && !resultData && (
        <EmptyState
          icon={Target}
          title="Uncover Your Missing Skills"
          description="Enter your target career and current skills above to get a detailed breakdown of skill proficiency, priority gaps, and estimated learning time."
          actionLabel="Analyze Skill Gap Now"
          onAction={handleSubmit}
        />
      )}

      {!loading && !error && resultData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Summary Metrics Row (Only renders metrics actually returned) */}
          {(readinessScore !== null || estimatedTime || prioritySkills.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {readinessScore !== null && (
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Readiness Score
                    </span>
                    <Award className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-extrabold text-[var(--text-main)]">
                      {typeof readinessScore === 'number'
                        ? `${readinessScore <= 1 ? Math.round(readinessScore * 100) : Math.round(readinessScore)}%`
                        : String(readinessScore)}
                    </div>
                    {typeof parseProficiencyPercent(readinessScore) === 'number' && (
                      <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-700"
                          style={{ width: `${parseProficiencyPercent(readinessScore)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {estimatedTime && (
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Estimated Learning Time
                    </span>
                    <Clock className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-main)]">
                    {typeof estimatedTime === 'object' ? JSON.stringify(estimatedTime) : String(estimatedTime)}
                  </div>
                </div>
              )}

              {prioritySkills.length > 0 && (
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between gap-3 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Priority Skills to Acquire
                    </span>
                    <Zap className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {prioritySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
                      >
                        {typeof sk === 'object' ? sk.skill || sk.name || JSON.stringify(sk) : sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall Recommendation Banner */}
          {overallRecommendation && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-[#8B5CF6]/30 flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                  AI Strategic Recommendation
                </h3>
                <p className="text-sm text-[var(--text-main)] leading-relaxed">
                  {overallRecommendation}
                </p>
              </div>
            </div>
          )}

          {/* Individual Skill Assessments */}
          {assessments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  Detailed Skill Assessment ({assessments.length})
                </h3>
                <button
                  type="button"
                  onClick={() => navigateTo('roadmap')}
                  className="text-xs font-semibold text-[#06B6D4] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Generate Learning Roadmap for {targetCareer}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments.map((item, idx) => {
                  if (typeof item === 'string') {
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-main)]"
                      >
                        {item}
                      </div>
                    );
                  }

                  const skillName = item.skill || item.name || item.skill_name || `Skill #${idx + 1}`;
                  const status = item.status || item.level || item.gap_status || '';
                  const proficiency = item.proficiency ?? item.current_level ?? item.score ?? null;
                  const rec = item.recommendation || item.advice || item.action || item.notes || '';
                  const pct = parseProficiencyPercent(proficiency);

                  return (
                    <div
                      key={`${skillName}-${idx}`}
                      className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-bold text-[var(--text-main)]">{skillName}</h4>
                          {status && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          )}
                        </div>

                        {proficiency !== null && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                              <span>Proficiency</span>
                              <span className="font-semibold text-[var(--text-main)]">
                                {String(proficiency)}
                              </span>
                            </div>
                            {pct !== null && (
                              <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {rec && (
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            {rec}
                          </p>
                        )}
                      </div>

                      <ExtraFieldsRenderer
                        data={item}
                        omitKeys={[
                          'skill',
                          'name',
                          'skill_name',
                          'status',
                          'level',
                          'gap_status',
                          'proficiency',
                          'current_level',
                          'score',
                          'recommendation',
                          'advice',
                          'action',
                          'notes',
                        ]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render any other fields returned at the top level */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Additional Analysis Details
            </h4>
            <ExtraFieldsRenderer
              data={unwrapped}
              omitKeys={[
                'success',
                'readiness_score',
                'readiness',
                'overall_readiness',
                'match_score',
                'estimated_learning_time',
                'estimated_time',
                'learning_time',
                'timeline',
                'priority_skills',
                'missing_skills',
                'critical_skills',
                'skills_to_learn',
                'skill_assessment',
                'skill_assessments',
                'assessments',
                'skills',
                'recommendation',
                'overall_recommendation',
                'summary',
                'advice',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * 9. PAGE 4: LEARNING ROADMAP PAGE (src/pages/LearningRoadmap.jsx)
 * ============================================================================
 * Connects to POST /roadmap/generate
 * Payload: { target_career: string, current_skills: string[], timeline_months: number }
 */

const TIMELINE_OPTIONS = [3, 6, 9, 12];

const LearningRoadmapPage = () => {
  const { showToast, sharedCareerTarget, sharedSkills } = useApp();

  const [targetCareer, setTargetCareer] = useState(sharedCareerTarget || 'AI/ML Engineer');
  const [currentSkills, setCurrentSkills] = useState(
    sharedSkills && sharedSkills.length > 0 ? sharedSkills : ['Python', 'C', 'Basic SQL']
  );
  const [timelineMonths, setTimelineMonths] = useState(6);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => {
    if (sharedCareerTarget) setTargetCareer(sharedCareerTarget);
  }, [sharedCareerTarget]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!targetCareer.trim()) {
      showToast('Please enter a target career.', 'warning');
      return;
    }
    if (currentSkills.length === 0) {
      showToast('Please add at least one current skill.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await careerApiService.generateRoadmap({
        target_career: targetCareer.trim(),
        current_skills: currentSkills,
        timeline_months: Number(timelineMonths) || 6,
      });
      setResultData(response);
      // Expand all phases by default
      const initialExpanded = {};
      for (let i = 0; i < 20; i++) initialExpanded[i] = true;
      setExpandedPhases(initialExpanded);
      showToast('Personalized learning roadmap generated!', 'success');
    } catch (err) {
      setError(err);
      showToast(err.isNetworkError ? 'Backend service unreachable. Please check connection or API settings.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const unwrapped = unwrapPayload(resultData) || {};
  const phases = Array.isArray(unwrapped.phases)
    ? unwrapped.phases
    : Array.isArray(unwrapped.learning_phases)
    ? unwrapped.learning_phases
    : Array.isArray(unwrapped.roadmap)
    ? unwrapped.roadmap
    : Array.isArray(unwrapped.steps)
    ? unwrapped.steps
    : Array.isArray(unwrapped.modules)
    ? unwrapped.modules
    : [];

  const globalTips = toArray(unwrapped.tips || unwrapped.study_tips || unwrapped.recommendations);
  const globalMilestones = toArray(unwrapped.milestones || unwrapped.key_milestones);

  const togglePhase = (idx) => {
    setExpandedPhases((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const setAllPhases = (open) => {
    const next = {};
    phases.forEach((_, i) => {
      next[i] = open;
    });
    setExpandedPhases(next);
  };

  return (
    <div className="space-y-6 pb-8">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6"
      >
        <div className="pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Map className="w-5 h-5 text-[#22C55E]" />
            <span>Learning Roadmap Generator</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Build a structured curriculum with milestones, learning phases, and curated resources.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-main)]">
              Target Career <span className="text-[#8B5CF6]">*</span>
            </label>
            <input
              type="text"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              disabled={loading}
              placeholder="e.g. AI/ML Engineer"
              className="w-full h-[48px] px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="lg:col-span-5">
            <TagInput
              label="Current Skills"
              required
              tags={currentSkills}
              onChange={setCurrentSkills}
              placeholder="e.g. Python, C, Basic SQL..."
              suggestions={SKILL_SUGGESTIONS}
              disabled={loading}
            />
          </div>

          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--text-main)]">
                Timeline (Months)
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] light-chip border border-[#8B5CF6]/30">
                {timelineMonths} {timelineMonths === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 h-[48px]">
              {TIMELINE_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={loading}
                  onClick={() => setTimelineMonths(m)}
                  className={`rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    Number(timelineMonths) === m
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[var(--text-main)]'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              disabled={loading}
              className="w-full accent-[#8B5CF6] cursor-pointer"
              aria-label="Timeline in months slider"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>Endpoint: <code className="font-mono text-[#06B6D4]">POST /api/roadmap/generate</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 text-white shadow-lg shadow-[#8B5CF6]/25 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building Roadmap...</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4" />
                <span>Generate Learning Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>

      {loading && <SkeletonLoader count={3} />}

      {!loading && error && <ApiErrorState error={error} onRetry={handleSubmit} />}

      {!loading && !error && !resultData && (
        <EmptyState
          icon={Map}
          title="Chart Your Step-by-Step Learning Timeline"
          description="Set your target role, existing skills, and preferred duration in months to generate a phased learning roadmap."
          actionLabel="Generate My Roadmap"
          onAction={handleSubmit}
        />
      )}

      {!loading && !error && resultData && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)]">
                {unwrapped.target_career || targetCareer} — {unwrapped.total_timeline || (unwrapped.timeline_months ? `${unwrapped.timeline_months} Months` : `${timelineMonths} Months`)} Roadmap
              </h3>
              {unwrapped.overview || unwrapped.summary || unwrapped.description ? (
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {unwrapped.overview || unwrapped.summary || unwrapped.description}
                </p>
              ) : null}
            </div>

            {phases.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAllPhases(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setAllPhases(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          {/* Vertical Timeline */}
          {phases.length > 0 ? (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#8B5CF6] before:via-[#06B6D4] before:to-[#22C55E]">
              {phases.map((phase, idx) => {
                const isExpanded = expandedPhases[idx] !== false;
                const phaseTitle =
                  phase.title ||
                  phase.name ||
                  phase.phase_name ||
                  (phase.phase ? (typeof phase.phase === 'string' ? phase.phase : `Phase ${phase.phase}`) : `Phase ${idx + 1}`);
                const duration =
                  phase.duration || phase.timeline || phase.weeks || phase.months || '';
                const goals = toArray(
                  phase.goals || phase.objectives || phase.topics || phase.skills_covered || phase.focus_areas
                );
                const resources = toArray(phase.resources || phase.learning_resources || phase.materials);
                const milestones = phase.milestone
                  ? (Array.isArray(phase.milestone) ? phase.milestone : [phase.milestone])
                  : toArray(phase.milestones || phase.projects || phase.deliverables);
                const tips = toArray(phase.tips || phase.advice);

                return (
                  <div key={idx} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-6 sm:-left-8 top-5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--bg-main)] border-2 border-[#8B5CF6] flex items-center justify-center text-[10px] font-bold text-[#06B6D4] shadow">
                      {idx + 1}
                    </div>

                    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm transition-all">
                      <button
                        type="button"
                        onClick={() => togglePhase(idx)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[var(--bg-elevated)]/40 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] light-chip border border-[#8B5CF6]/30">
                              Phase {idx + 1}
                            </span>
                            {duration && (
                              <span className="text-xs font-medium text-[#06B6D4] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{duration}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                            {phaseTitle}
                          </h4>
                        </div>

                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[var(--border-color)] space-y-5 animate-fadeIn">
                          {phase.description && (
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              {phase.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goals.length > 0 && (
                              <div className="p-4 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)] space-y-2.5">
                                <div className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-1.5">
                                  <Target className="w-4 h-4" />
                                  <span>Learning Goals & Topics</span>
                                </div>
                                <ul className="space-y-1.5">
                                  {goals.map((g, gIdx) => (
                                    <li key={gIdx} className="text-xs sm:text-sm text-[var(--text-main)] flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                                      <span>{typeof g === 'object' ? g.title || g.name || JSON.stringify(g) : g}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {milestones.length > 0 && (
                              <div className="p-4 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)] space-y-2.5">
                                <div className="text-xs font-bold uppercase tracking-wider text-[#22C55E] flex items-center gap-1.5">
                                  <Award className="w-4 h-4" />
                                  <span>Milestones & Projects</span>
                                </div>
                                <ul className="space-y-1.5">
                                  {milestones.map((m, mIdx) => (
                                    <li key={mIdx} className="text-xs sm:text-sm text-[var(--text-main)] flex items-start gap-2">
                                      <Sparkles className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                                      <span>{typeof m === 'object' ? m.title || m.name || JSON.stringify(m) : m}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {resources.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                <span>Recommended Resources</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {resources.map((res, rIdx) => {
                                  const isObj = typeof res === 'object' && res !== null;
                                  const label = isObj
                                    ? res.title || res.name || res.resource || res.url || JSON.stringify(res)
                                    : String(res);
                                  const url = isObj
                                    ? res.url || res.link || extractUrlFromText(label)
                                    : extractUrlFromText(label);

                                  return url ? (
                                    <a
                                      key={rIdx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 border border-[var(--border-color)] hover:border-[#8B5CF6]/40 flex items-center justify-between gap-2 text-xs sm:text-sm text-[var(--text-main)] transition-colors"
                                    >
                                      <span className="truncate">{label}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                                    </a>
                                  ) : (
                                    <div
                                      key={rIdx}
                                      className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)]"
                                    >
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {tips.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 space-y-1.5">
                              <div className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                                <Lightbulb className="w-4 h-4" />
                                <span>Practical Tips</span>
                              </div>
                              <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--text-main)] space-y-1">
                                {tips.map((t, tIdx) => (
                                  <li key={tIdx}>{typeof t === 'object' ? JSON.stringify(t) : t}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <ExtraFieldsRenderer
                            data={phase}
                            omitKeys={[
                              'phase',
                              'title',
                              'name',
                              'phase_name',
                              'duration',
                              'timeline',
                              'weeks',
                              'months',
                              'description',
                              'goals',
                              'objectives',
                              'topics',
                              'skills_covered',
                              'focus_areas',
                              'resources',
                              'learning_resources',
                              'materials',
                              'milestones',
                              'projects',
                              'deliverables',
                              'tips',
                              'advice',
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <ExtraFieldsRenderer data={unwrapped} omitKeys={['success']} />
            </div>
          )}

          {/* Global Milestones or Tips if returned outside phases */}
          {(globalMilestones.length > 0 || globalTips.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {globalMilestones.length > 0 && (
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#22C55E] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Key Roadmap Milestones</span>
                  </h4>
                  <ul className="space-y-2">
                    {globalMilestones.map((m, i) => (
                      <li key={i} className="text-sm text-[var(--text-main)] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{typeof m === 'object' ? JSON.stringify(m) : m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {globalTips.length > 0 && (
                <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Success Tips & Strategies</span>
                  </h4>
                  <ul className="space-y-2">
                    {globalTips.map((t, i) => (
                      <li key={i} className="text-sm text-[var(--text-main)] flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                        <span>{typeof t === 'object' ? JSON.stringify(t) : t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * 10. PAGE 5: CAREER COMPARISON PAGE (src/pages/CareerComparison.jsx)
 * ============================================================================
 * Connects to POST /guidance/compare
 * Payload: { careers: string[] }
 * Desktop: Clean comparison matrix table.
 * Mobile: Stacked career cards so no awkward horizontal scrolling is forced.
 */

const QUICK_COMPARE_CAREERS = [
  'Data Scientist',
  'Software Engineer',
  'AI/ML Engineer',
  'Product Manager',
  'DevOps Engineer',
  'Cybersecurity Engineer',
];

const CareerComparisonPage = () => {
  const { showToast } = useApp();

  const [careers, setCareers] = useState(['Data Scientist', 'Software Engineer']);
  const [newCareerInput, setNewCareerInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  const addCareer = (val) => {
    const clean = String(val || '').trim();
    if (!clean) return;
    if (careers.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      showToast(`${clean} is already in your comparison list.`, 'info');
      return;
    }
    setCareers([...careers, clean]);
    setNewCareerInput('');
  };

  const removeCareer = (idx) => {
    if (careers.length <= 2) {
      showToast('At least two careers are required for comparison.', 'warning');
      return;
    }
    setCareers(careers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (careers.length < 2) {
      showToast('Please add at least two careers to compare.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await careerApiService.compareCareers({ careers });
      setResultData(response);
      showToast('Career comparison complete!', 'success');
    } catch (err) {
      setError(err);
      showToast(err.isNetworkError ? 'Backend service unreachable. Please check connection or API settings.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const unwrapped = unwrapPayload(resultData) || {};
  const comparedCareers = Array.isArray(unwrapped.comparison)
    ? unwrapped.comparison
    : Array.isArray(unwrapped.careers)
    ? unwrapped.careers
    : Array.isArray(unwrapped.results)
    ? unwrapped.results
    : Array.isArray(unwrapped)
    ? unwrapped
    : [];

  const aiRecommendation =
    unwrapped.recommendation ||
    unwrapped.ai_recommendation ||
    unwrapped.verdict ||
    unwrapped.summary ||
    unwrapped.conclusion ||
    '';

  const getField = (obj, keys) => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
        return obj[k];
      }
    }
    return null;
  };

  const renderCellContent = (val) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-xs text-[var(--text-secondary)] italic">Not specified</span>;
    }
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-1">
          {val.map((item, i) => (
            <li key={i} className="text-xs sm:text-sm text-[var(--text-main)] flex items-start gap-1.5">
              <span className="text-[#8B5CF6] font-bold">•</span>
              <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'object') {
      return (
        <pre className="text-xs font-mono text-[var(--text-main)] whitespace-pre-wrap">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="text-sm text-[var(--text-main)]">{String(val)}</span>;
  };

  const COMPARISON_ROWS = [
    { label: 'Average Salary', keys: ['average_salary', 'salary', 'salary_range', 'compensation'] },
    { label: 'Growth Outlook', keys: ['growth_outlook', 'growth', 'job_growth', 'demand', 'market_outlook'] },
    { label: 'Education Requirements', keys: ['education_required', 'education_requirements', 'education', 'degree', 'qualification'] },
    { label: 'Key Skills', keys: ['key_skills', 'skills', 'required_skills', 'core_skills'] },
    { label: 'Work-Life Balance', keys: ['work_life_balance', 'work_life', 'balance', 'lifestyle'] },
    { label: 'Pros', keys: ['pros', 'advantages', 'strengths', 'benefits'] },
    { label: 'Cons', keys: ['cons', 'disadvantages', 'challenges', 'drawbacks'] },
  ];

  return (
    <div className="space-y-6 pb-8">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6"
      >
        <div className="pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#F59E0B]" />
            <span>Compare Career Paths</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Add two or more careers to evaluate compensation, growth, skills, work-life balance, pros, and cons.
          </p>
        </div>

        {/* Career Builder */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newCareerInput}
              onChange={(e) => setNewCareerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCareer(newCareerInput);
                }
              }}
              disabled={loading}
              placeholder="Enter a career title (e.g., AI/ML Engineer)..."
              className="flex-1 h-[48px] px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6]"
            />
            <button
              type="button"
              disabled={loading || !newCareerInput.trim()}
              onClick={() => addCareer(newCareerInput)}
              className="h-[48px] px-5 rounded-xl font-semibold text-sm bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/20 text-[var(--text-main)] border border-[var(--border-color)] hover:border-[#8B5CF6]/40 disabled:opacity-40 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#8B5CF6]" />
              <span>Add Career</span>
            </button>
          </div>

          {/* Active Careers Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {careers.map((c, idx) => (
              <div
                key={`${c}-${idx}`}
                className="inline-flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 text-sm font-semibold text-[var(--text-main)]"
              >
                <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{c}</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => removeCareer(idx)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
                  aria-label={`Remove ${c}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-[var(--text-secondary)] mr-1">Quick add:</span>
            {QUICK_COMPARE_CAREERS.filter(
              (item) => !careers.some((c) => c.toLowerCase() === item.toLowerCase())
            ).map((item) => (
              <button
                key={item}
                type="button"
                disabled={loading}
                onClick={() => addCareer(item)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors cursor-pointer"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>Endpoint: <code className="font-mono text-[#06B6D4]">POST /api/guidance/compare</code></span>
          </div>

          <button
            type="submit"
            disabled={loading || careers.length < 2}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 text-white shadow-lg shadow-[#8B5CF6]/25 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Comparing {careers.length} Careers...</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                <span>Compare {careers.length} Careers</span>
              </>
            )}
          </button>
        </div>
      </form>

      {loading && <SkeletonLoader count={2} type="grid" />}

      {!loading && error && <ApiErrorState error={error} onRetry={handleSubmit} />}

      {!loading && !error && !resultData && (
        <EmptyState
          icon={Scale}
          title="Side-by-Side Career Intelligence"
          description="Select two or more careers above and run the comparison to evaluate salaries, growth outlooks, education requirements, and trade-offs."
          actionLabel="Compare Selected Careers"
          onAction={handleSubmit}
        />
      )}

      {!loading && !error && resultData && (
        <div className="space-y-6 animate-fadeIn">
          {/* AI Recommendation Verdict Banner */}
          {aiRecommendation && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/15 via-[#06B6D4]/10 to-transparent border border-[#8B5CF6]/35 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                <Sparkles className="w-4 h-4" />
                <span>AI Comparison Verdict & Recommendation</span>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                {typeof aiRecommendation === 'object'
                  ? JSON.stringify(aiRecommendation)
                  : String(aiRecommendation)}
              </p>
            </div>
          )}

          {comparedCareers.length > 0 ? (
            <>
              {/* DESKTOP VIEW (>= 768px): Structured Side-by-Side Comparison Table */}
              <div className="hidden md:block rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/70">
                        <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] w-48">
                          Dimension
                        </th>
                        {comparedCareers.map((cObj, cIdx) => {
                          const cTitle =
                            cObj.career ||
                            cObj.title ||
                            cObj.name ||
                            cObj.career_title ||
                            careers[cIdx] ||
                            `Career #${cIdx + 1}`;
                          return (
                            <th
                              key={cIdx}
                              className="p-4 sm:p-5 text-base font-bold text-[var(--text-main)] border-l border-[var(--border-color)] min-w-[220px]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                                <span>{cTitle}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {COMPARISON_ROWS.map((row) => (
                        <tr key={row.label} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                          <td className="p-4 sm:p-5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] align-top bg-[var(--bg-elevated)]/20">
                            {row.label}
                          </td>
                          {comparedCareers.map((cObj, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-4 sm:p-5 align-top border-l border-[var(--border-color)]"
                            >
                              {renderCellContent(getField(cObj, row.keys))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE VIEW (< 768px): Stacked Career Cards */}
              <div className="md:hidden space-y-4">
                {comparedCareers.map((cObj, cIdx) => {
                  const cTitle =
                    cObj.career ||
                    cObj.title ||
                    cObj.name ||
                    cObj.career_title ||
                    careers[cIdx] ||
                    `Career #${cIdx + 1}`;

                  return (
                    <div
                      key={cIdx}
                      className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm"
                    >
                      <div className="pb-3 border-b border-[var(--border-color)] flex items-center justify-between">
                        <h4 className="text-lg font-bold text-[var(--text-main)]">{cTitle}</h4>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] light-chip">
                          #{cIdx + 1}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {COMPARISON_ROWS.map((row) => {
                          const val = getField(cObj, row.keys);
                          if (val === null || val === undefined) return null;
                          return (
                            <div
                              key={row.label}
                              className="p-3 rounded-xl bg-[var(--bg-elevated)]/50 border border-[var(--border-color)] space-y-1"
                            >
                              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                {row.label}
                              </div>
                              <div>{renderCellContent(val)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <ExtraFieldsRenderer
                data={unwrapped}
                omitKeys={['success', 'ai_recommendation', 'recommendation', 'verdict', 'summary', 'conclusion']}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * 11. PAGE 6: AI CAREER GUIDANCE PAGE (src/pages/CareerGuidance.jsx)
 * ============================================================================
 * Connects to POST /guidance/advice
 * Payload: { question: string, context: { skills: string[], education: string, interests: string[] } }
 * Premium structured AI Advisor interface (NOT a generic chat widget).
 */

const SAMPLE_QUESTIONS = [
  'Should I learn AI or Web Development?',
  'How can I transition from college projects to production-ready AI engineering?',
  'What portfolio projects stand out most for entry-level Machine Learning roles?',
];

const CareerGuidancePage = () => {
  const { showToast, sharedSkills } = useApp();

  const [question, setQuestion] = useState('Should I learn AI or Web Development?');
  const [skills, setSkills] = useState(
    sharedSkills && sharedSkills.length > 0 ? sharedSkills : ['Python', 'HTML']
  );
  const [education, setEducation] = useState('B.Tech CSIT, 2nd year');
  const [interests, setInterests] = useState(['Machine Learning', 'Web Development']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      showToast('Please enter a career question for the AI advisor.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await careerApiService.getCareerAdvice({
        question: question.trim(),
        context: {
          skills,
          education: education.trim(),
          interests,
        },
      });
      setResultData(response);
      setCheckedSteps({});
      showToast('AI career guidance received!', 'success');
    } catch (err) {
      setError(err);
      showToast(err.isNetworkError ? 'Backend service unreachable. Please check connection or API settings.' : err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const unwrapped = unwrapPayload(resultData) || {};
  const adviceObj =
    unwrapped.advice && typeof unwrapped.advice === 'object'
      ? unwrapped.advice
      : unwrapped;

  const adviceSummary =
    adviceObj.summary ||
    adviceObj.advice_summary ||
    unwrapped.summary ||
    adviceObj.headline ||
    adviceObj.key_takeaway ||
    '';

  const detailedResponse =
    adviceObj.detailed_response ||
    (typeof adviceObj.advice === 'string' ? adviceObj.advice : '') ||
    adviceObj.response ||
    adviceObj.answer ||
    adviceObj.explanation ||
    (typeof adviceObj === 'string' ? adviceObj : '');

  const actionSteps = toArray(
    adviceObj.action_steps ||
      unwrapped.action_steps ||
      adviceObj.steps ||
      adviceObj.next_steps ||
      adviceObj.action_plan ||
      adviceObj.recommendations
  );

  const resources = toArray(
    adviceObj.resources ||
      unwrapped.resources ||
      adviceObj.recommended_resources ||
      adviceObj.links ||
      adviceObj.references
  );

  const toggleStepCheck = (idx) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 pb-8">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6"
      >
        <div className="pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-[#8B5CF6]" />
            <span>Executive AI Career Advisor</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Pose a specific career decision or strategy question along with your academic and technical context.
          </p>
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-main)]">
            Your Career Question <span className="text-[#8B5CF6]">*</span>
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            placeholder="Ask a specific question about your career direction, technology stack, or industry specialization..."
            className="w-full p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all resize-y"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[var(--text-secondary)]">Sample prompts:</span>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => setQuestion(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors cursor-pointer text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Context Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          <TagInput
            label="Context: Skills (Optional)"
            tags={skills}
            onChange={setSkills}
            placeholder="e.g. Python, HTML..."
            suggestions={['Python', 'HTML', 'JavaScript', 'C++', 'SQL']}
            disabled={loading}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-main)]">
              Context: Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              disabled={loading}
              placeholder="e.g. B.Tech CSIT, 2nd year"
              className="w-full h-[48px] px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <TagInput
            label="Context: Interests"
            tags={interests}
            onChange={setInterests}
            placeholder="e.g. Machine Learning, Web Development..."
            suggestions={['Machine Learning', 'Web Development', 'Data Science', 'Cloud']}
            disabled={loading}
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            <span>Endpoint: <code className="font-mono text-[#06B6D4]">POST /api/guidance/advice</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 text-white shadow-lg shadow-[#8B5CF6]/25 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consulting AI Advisor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Request AI Career Guidance</span>
              </>
            )}
          </button>
        </div>
      </form>

      {loading && <SkeletonLoader count={2} />}

      {!loading && error && <ApiErrorState error={error} onRetry={handleSubmit} />}

      {!loading && !error && !resultData && (
        <EmptyState
          icon={MessageSquareCode}
          title="Personalized Strategic Career Guidance"
          description="Submit your question and academic/skill context above to receive a structured advisory briefing with action steps and curated resources."
          actionLabel="Get AI Career Advice"
          onAction={handleSubmit}
        />
      )}

      {!loading && !error && resultData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Advice Summary Card */}
          {adviceSummary && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/15 via-[#151D30]/40 to-[#06B6D4]/10 border border-[#8B5CF6]/35 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                <Sparkles className="w-4 h-4" />
                <span>Executive Advice Summary</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-[var(--text-main)] leading-relaxed">
                {adviceSummary}
              </p>
            </div>
          )}

          {/* Detailed Response Card */}
          {detailedResponse && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
                <FileText className="w-4 h-4" />
                <span>Detailed Analysis & Guidance</span>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-[var(--text-main)] leading-relaxed whitespace-pre-line">
                {typeof detailedResponse === 'object'
                  ? JSON.stringify(detailedResponse, null, 2)
                  : String(detailedResponse)}
              </div>
            </div>
          )}

          {/* Action Steps & Resources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {actionSteps.length > 0 && (
              <div
                className={`${
                  resources.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
                } p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recommended Action Steps</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Click steps to mark progress
                  </span>
                </div>

                <div className="space-y-2.5">
                  {actionSteps.map((step, idx) => {
                    const checked = !!checkedSteps[idx];
                    const stepText =
                      typeof step === 'object'
                        ? step.step || step.title || step.action || step.description || JSON.stringify(step)
                        : String(step);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleStepCheck(idx)}
                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                          checked
                            ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[var(--text-secondary)] line-through'
                            : 'bg-[var(--bg-elevated)]/60 border-[var(--border-color)] hover:border-[#8B5CF6]/40 text-[var(--text-main)]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            checked
                              ? 'bg-[#22C55E] text-white'
                              : 'bg-[#8B5CF6]/20 text-[#C4B5FD] light-chip border border-[#8B5CF6]/40'
                          }`}
                        >
                          {checked ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{stepText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {resources.length > 0 && (
              <div
                className={`${
                  actionSteps.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'
                } p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                  <BookOpen className="w-4 h-4" />
                  <span>Curated Resources & Links</span>
                </div>

                <div className="space-y-2.5">
                  {resources.map((res, rIdx) => {
                    const isObj = typeof res === 'object' && res !== null;
                    const title = isObj
                      ? res.name || res.title || res.resource || res.url || `Resource #${rIdx + 1}`
                      : String(res);
                    const rawUrl = isObj
                      ? res.url || res.link || extractUrlFromText(title)
                      : extractUrlFromText(title);
                    const desc = isObj ? res.type || res.description || '' : '';

                    return rawUrl ? (
                      <a
                        key={rIdx}
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#8B5CF6]/15 border border-[var(--border-color)] hover:border-[#8B5CF6]/40 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-[var(--text-main)] group-hover:text-[#06B6D4] transition-colors break-words">
                            {title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                        </div>
                        {desc && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{desc}</p>
                        )}
                        <div className="text-[11px] font-mono text-[#06B6D4] truncate mt-1.5">
                          {rawUrl}
                        </div>
                      </a>
                    ) : (
                      <div
                        key={rIdx}
                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1"
                      >
                        <div className="text-sm font-medium text-[var(--text-main)] break-words">
                          {title}
                        </div>
                        {desc && (
                          <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <ExtraFieldsRenderer
            data={unwrapped}
            omitKeys={[
              'success',
              'advice_summary',
              'summary',
              'headline',
              'key_takeaway',
              'detailed_response',
              'advice',
              'response',
              'answer',
              'explanation',
              'action_steps',
              'steps',
              'next_steps',
              'action_plan',
              'recommendations',
              'resources',
              'recommended_resources',
              'links',
              'references',
            ]}
          />
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * 12. MODALS: SETTINGS & HELP / API CONTRACT REFERENCE
 * ============================================================================
 */

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, reducedMotion, setReducedMotion, userProfile, setUserProfile, showToast } = useApp();
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [roleInput, setRoleInput] = useState(userProfile.role);
  const [apiBaseInput, setApiBaseInput] = useState(getApiBaseUrl());

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const updatedProfile = {
      name: nameInput.trim() || 'Student Explorer',
      role: roleInput.trim() || 'B.Tech CSIT',
    };
    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('ai_career_compass_profile', JSON.stringify(updatedProfile));
      localStorage.setItem(
        'ai_career_compass_api_base',
        apiBaseInput.trim() || DEFAULT_API_BASE_URL
      );
    } catch {
      // Ignore storage errors
    }
    showToast('Settings saved successfully.', 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-lg font-bold text-[var(--text-main)]">Application Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Theme Selection */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <div>
              <div className="text-sm font-semibold text-[var(--text-main)]">Interface Theme</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Switch between futuristic Dark Mode and clean Light Mode
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] inline-flex items-center gap-2 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#F59E0B]" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <div>
              <div className="text-sm font-semibold text-[var(--text-main)]">Reduced Motion</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Minimize animations and orbital compass motion
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                reducedMotion ? 'bg-[#8B5CF6]' : 'bg-slate-600'
              }`}
              aria-pressed={reducedMotion}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Local User Profile Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Program / Title
              </label>
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* API Endpoint Configuration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Backend API Base URL
              </label>
              <button
                type="button"
                onClick={() => setApiBaseInput(DEFAULT_API_BASE_URL)}
                className="text-[11px] text-[#06B6D4] hover:underline"
              >
                Reset to Default
              </button>
            </div>
            <input
              type="text"
              value={apiBaseInput}
              onChange={(e) => setApiBaseInput(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono text-[#06B6D4]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const endpoints = [
    {
      name: 'Career Recommendations',
      method: 'POST',
      path: '/career/recommend',
      body: '{ skills: string[], interests: string[], education: string, experience_level: string }',
    },
    {
      name: 'Skill Gap Analysis',
      method: 'POST',
      path: '/skill/gap-analysis',
      body: '{ current_skills: string[], target_career: string }',
    },
    {
      name: 'Learning Roadmap',
      method: 'POST',
      path: '/roadmap/generate',
      body: '{ target_career: string, current_skills: string[], timeline_months: number }',
    },
    {
      name: 'Career Comparison',
      method: 'POST',
      path: '/guidance/compare',
      body: '{ careers: string[] }',
    },
    {
      name: 'AI Career Guidance',
      method: 'POST',
      path: '/guidance/advice',
      body: '{ question: string, context: { skills: string[], education: string, interests: string[] } }',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#06B6D4]" />
            <h3 className="text-lg font-bold text-[var(--text-main)]">
              Help & Backend API Contract Reference
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-1.5">
          <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Strict Real-Data Policy</span>
          </div>
          <p className="leading-relaxed">
            All requests are routed through the centralized API service to{' '}
            <code className="text-[#06B6D4] font-mono">{getApiBaseUrl()}</code>. No mock or fabricated AI responses are ever substituted.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Configured API Endpoints
          </h4>
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-main)]">{ep.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD] light-chip">
                  {ep.method} {ep.path}
                </span>
              </div>
              <pre className="text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto">
                {ep.body}
              </pre>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[var(--border-color)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * 13. MAIN APPLICATION SHELL (Sidebar, Topbar, Mobile Drawer, Router Switch)
 * ============================================================================
 */

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recommendations', label: 'Career Recommendations', icon: Briefcase },
  { id: 'skill-gap', label: 'Skill Gap Analysis', icon: Target },
  { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
  { id: 'comparison', label: 'Career Comparison', icon: Scale },
  { id: 'guidance', label: 'AI Career Guidance', icon: MessageSquareCode },
];

export default function App() {
  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_career_compass_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Navigation & Layout state
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Shared workflow context across pages (e.g., jumping from a recommended career to Skill Gap / Roadmap)
  const [sharedCareerTarget, setSharedCareerTarget] = useState('AI/ML Engineer');
  const [sharedSkills, setSharedSkills] = useState(['Python', 'C', 'Basic SQL']);

  // Local user profile label
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_career_compass_profile');
      return saved ? JSON.parse(saved) : { name: 'Alex Morgan', role: 'B.Tech CSIT' };
    } catch {
      return { name: 'Alex Morgan', role: 'B.Tech CSIT' };
    }
  });

  // Toast Notification Queue
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('ai_career_compass_theme', next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const navigateTo = useCallback((pageId) => {
    setActivePage(pageId);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  const currentNavMeta = NAV_ITEMS.find((item) => item.id === activePage) || NAV_ITEMS[0];

  const contextValue = {
    theme,
    toggleTheme,
    reducedMotion,
    setReducedMotion,
    activePage,
    navigateTo,
    showToast,
    sharedCareerTarget,
    setSharedCareerTarget,
    sharedSkills,
    setSharedSkills,
    userProfile,
    setUserProfile,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {/* Global Theme Variables & Motion Styles */}
      <style>{`
        :root {
          --bg-main: ${theme === 'dark' ? '#080B14' : '#F8FAFC'};
          --bg-sidebar: ${theme === 'dark' ? '#0C1020' : '#FFFFFF'};
          --bg-card: ${theme === 'dark' ? '#111827' : '#FFFFFF'};
          --bg-elevated: ${theme === 'dark' ? '#151D30' : '#F1F5F9'};
          --text-main: ${theme === 'dark' ? '#F8FAFC' : '#0F172A'};
          --text-secondary: ${theme === 'dark' ? '#94A3B8' : '#475569'};
          --border-color: ${
            theme === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.1)'
          };
        }

        ${
          theme === 'light'
            ? `.light-chip { color: #6D28D9 !important; }`
            : ''
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: ${reducedMotion ? 'none' : 'fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'};
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes needleFloat {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }

        .compass-spin-slow {
          animation: spinSlow 36s linear infinite;
        }

        .compass-spin-reverse {
          animation: spinReverse 28s linear infinite;
        }

        .compass-needle-float {
          animation: needleFloat 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .compass-spin-slow,
          .compass-spin-reverse,
          .compass-needle-float,
          .animate-fadeIn {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col lg:flex-row font-sans selection:bg-[#8B5CF6]/30 selection:text-[#06B6D4] overflow-x-hidden">
        {/* ================================================================
            DESKTOP SIDEBAR (lg and above)
           ================================================================ */}
        <aside
          aria-label="Primary Sidebar Navigation"
          className={`hidden lg:flex flex-col justify-between shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] transition-all duration-300 sticky top-0 h-screen z-30 ${
            sidebarCollapsed ? 'w-[80px]' : 'w-[272px]'
          }`}
        >
          {/* Top Brand Header */}
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              >
                <BrandCompassIcon size={34} className="shrink-0" />
                {!sidebarCollapsed && (
                  <div className="overflow-hidden">
                    <div className="text-base font-extrabold tracking-tight text-[var(--text-main)] leading-none">
                      AI Career Compass
                    </div>
                    <div className="text-[11px] font-medium text-[#06B6D4] mt-1">
                      Intelligent Navigation
                    </div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-color)] cursor-pointer"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Primary Navigation Links */}
            <nav className="space-y-1.5" aria-label="Main features">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/10 text-[var(--text-main)] border border-[#8B5CF6]/40 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]/60 border border-transparent'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive ? 'text-[#8B5CF6]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-main)]'
                        }`}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      {!sidebarCollapsed && isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                      )}
                    </button>

                    {/* Collapsed Tooltip */}
                    {sidebarCollapsed && (
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-medium whitespace-nowrap shadow-xl border border-slate-700 z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Section: Settings, Help, User Profile */}
          <div className="p-4 border-t border-[var(--border-color)] space-y-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={sidebarCollapsed ? 'Settings' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title={sidebarCollapsed ? 'Help & Support' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Help & Support</span>}
            </button>

            {/* User Profile Card */}
            <div
              onClick={() => setSettingsOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSettingsOpen(true)}
              className={`mt-2 p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-3 cursor-pointer hover:border-[#8B5CF6]/40 transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs shrink-0">
                {userProfile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[var(--text-main)] truncate">
                    {userProfile.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">
                    {userProfile.role}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ================================================================
            MOBILE SLIDE-IN DRAWER (below lg)
           ================================================================ */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <aside className="relative w-[285px] max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] h-full flex flex-col justify-between p-5 z-10 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BrandCompassIcon size={32} />
                    <div>
                      <div className="text-base font-extrabold text-[var(--text-main)] leading-none">
                        AI Career Compass
                      </div>
                      <div className="text-[11px] text-[#06B6D4] mt-0.5">
                        Intelligent Navigation
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5" aria-label="Mobile navigation">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/10 text-[var(--text-main)] border border-[#8B5CF6]/40'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#8B5CF6]' : ''}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setHelpOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & API Contracts</span>
                </button>

                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs">
                    {userProfile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-main)] truncate">
                      {userProfile.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {userProfile.role}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ================================================================
            MAIN CONTENT COLUMN (Topbar + Active Route View)
           ================================================================ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-20 h-16 sm:h-18 px-4 sm:px-8 bg-[var(--bg-main)]/85 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-[#8B5CF6]/40"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs & Page Title */}
              <div className="min-w-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="hover:text-[var(--text-main)] cursor-pointer"
                  >
                    AI Career Compass
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#8B5CF6] font-semibold truncate">
                    {currentNavMeta.label}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--text-main)] truncate">
                  {currentNavMeta.label}
                </h1>
              </div>
            </div>

            {/* Right Controls: API Reference, Theme Toggle, Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="View API Contracts & Documentation"
              >
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                <span>{getApiBaseUrl().replace(/^https?:\/\//, '')}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-main)] transition-colors cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#F59E0B]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#8B5CF6]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] transition-colors cursor-pointer"
                aria-label="Open user profile and settings"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs">
                  {userProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[var(--text-main)] max-w-[110px] truncate">
                  {userProfile.name}
                </span>
              </button>
            </div>
          </header>

          {/* Main Page View Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div key={activePage} className="animate-fadeIn">
              {activePage === 'dashboard' && <DashboardPage />}
              {activePage === 'recommendations' && <CareerRecommendationsPage />}
              {activePage === 'skill-gap' && <SkillGapAnalysisPage />}
              {activePage === 'roadmap' && <LearningRoadmapPage />}
              {activePage === 'comparison' && <CareerComparisonPage />}
              {activePage === 'guidance' && <CareerGuidancePage />}
            </div>
          </main>
        </div>

        {/* Modals */}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

        {/* Toast Notification Stack */}
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#111827] text-white border border-slate-700/80 shadow-2xl text-xs sm:text-sm font-medium animate-fadeIn"
            >
              <div className="flex items-center gap-2.5">
                {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />}
                {t.type === 'info' && <Sparkles className="w-4 h-4 text-[#06B6D4] shrink-0" />}
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
}