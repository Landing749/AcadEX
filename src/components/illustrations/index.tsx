/**
 * Acadex Illustration Library
 * Beautiful inline SVG illustrations — no external files, no broken images.
 */

import React from 'react';

// ─── Hero / Auth ──────────────────────────────────────────────────────────────

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="desk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="screen-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#4f46e5" floodOpacity="0.25" />
        </filter>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Background circles */}
      <circle cx="490" cy="50" r="80" fill="white" fillOpacity="0.05" />
      <circle cx="70"  cy="270" r="60" fill="white" fillOpacity="0.05" />
      <circle cx="280" cy="160" r="200" fill="white" fillOpacity="0.03" />

      {/* ── Laptop ── */}
      <g filter="url(#shadow)">
        {/* Screen body */}
        <rect x="160" y="60" width="240" height="158" rx="12" fill="url(#card-grad)" />
        {/* Screen bezel */}
        <rect x="172" y="72" width="216" height="130" rx="6" fill="url(#screen-grad)" />
        {/* Screen content lines */}
        <rect x="184" y="88"  width="80"  height="6"  rx="3" fill="white" fillOpacity="0.7" />
        <rect x="184" y="102" width="120" height="4"  rx="2" fill="white" fillOpacity="0.4" />
        <rect x="184" y="114" width="100" height="4"  rx="2" fill="white" fillOpacity="0.4" />
        {/* Mini chart on screen */}
        <rect x="184" y="128" width="30" height="40" rx="4" fill="white" fillOpacity="0.2" />
        <rect x="222" y="140" width="30" height="28" rx="4" fill="white" fillOpacity="0.3" />
        <rect x="260" y="132" width="30" height="36" rx="4" fill="white" fillOpacity="0.25" />
        <rect x="298" y="136" width="30" height="32" rx="4" fill="#a5b4fc" fillOpacity="0.6" />
        {/* Chart line */}
        <polyline
          points="199,152 237,144 275,148 313,138"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hinge */}
        <rect x="160" y="216" width="240" height="8"  rx="2" fill="#c7d2fe" />
        {/* Base */}
        <rect x="140" y="222" width="280" height="14" rx="6" fill="url(#desk-grad)" />
      </g>

      {/* ── Floating grade card (top right) ── */}
      <g filter="url(#card-shadow)" style={{ animation: 'float1 4s ease-in-out infinite' }}>
        <rect x="400" y="68" width="128" height="72" rx="14" fill="white" fillOpacity="0.97" />
        <rect x="416" y="84" width="36" height="36" rx="10" fill="#ede9fe" />
        {/* A grade icon */}
        <text x="434" y="108" textAnchor="middle" fontSize="18" fontWeight="800" fill="#7c3aed" fontFamily="system-ui">A</text>
        <rect x="462" y="88" width="50" height="6"  rx="3" fill="#e0e7ff" />
        <rect x="462" y="100" width="36" height="5"  rx="2.5" fill="#e0e7ff" />
        <rect x="462" y="112" width="42" height="5"  rx="2.5" fill="#c7d2fe" />
      </g>

      {/* ── Floating task card (bottom left) ── */}
      <g filter="url(#card-shadow)" style={{ animation: 'float2 5s ease-in-out infinite' }}>
        <rect x="32" y="148" width="120" height="88" rx="14" fill="white" fillOpacity="0.97" />
        <rect x="46" y="162" width="20" height="20" rx="6" fill="#d1fae5" />
        <rect x="70" y="165" width="66" height="5"  rx="2.5" fill="#e0e7ff" />
        <rect x="70" y="175" width="48" height="4"  rx="2"   fill="#e5e7eb" />
        {/* Checkmarks */}
        <circle cx="55" cy="200" r="7" fill="#10b981" />
        <polyline points="51,200 54,203 59,197" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="68" y="196" width="60" height="4" rx="2" fill="#d1fae5" />
        <circle cx="55" cy="218" r="7" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
        <rect x="68" y="214" width="44" height="4" rx="2" fill="#e5e7eb" />
      </g>

      {/* ── Floating notification (top left) ── */}
      <g filter="url(#card-shadow)" style={{ animation: 'float3 3.5s ease-in-out infinite' }}>
        <rect x="28" y="68" width="116" height="52" rx="14" fill="white" fillOpacity="0.97" />
        <circle cx="52" cy="94" r="14" fill="#ede9fe" />
        <text x="52" y="100" textAnchor="middle" fontSize="14">🔔</text>
        <rect x="74" y="83" width="56" height="5"  rx="2.5" fill="#e0e7ff" />
        <rect x="74" y="93" width="40" height="4"  rx="2"   fill="#e5e7eb" />
        <rect x="74" y="103" width="48" height="4" rx="2"   fill="#ede9fe" />
      </g>

      {/* ── Floating stat pill (bottom right) ── */}
      <g filter="url(#card-shadow)">
        <rect x="408" y="178" width="112" height="48" rx="24" fill="white" fillOpacity="0.97" />
        <circle cx="432" cy="202" r="14" fill="#fef3c7" />
        <text x="432" y="208" textAnchor="middle" fontSize="14">⭐</text>
        <rect x="452" y="194" width="52" height="6"  rx="3" fill="#e0e7ff" />
        <rect x="452" y="206" width="38" height="5"  rx="2.5" fill="#fde68a" />
      </g>

      {/* Dots decoration */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <circle
          key={i}
          cx={420 + (i % 4) * 18}
          cy={260 + Math.floor(i / 4) * 18}
          r="3"
          fill="white"
          fillOpacity="0.2"
        />
      ))}

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
      `}</style>
    </svg>
  );
}

// ─── Dashboard Hero Banner ────────────────────────────────────────────────────

export function DashboardHeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dh-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Book stack */}
      <rect x="40" y="100" width="80" height="12" rx="3" fill="#c7d2fe" />
      <rect x="44" y="88"  width="72" height="14" rx="3" fill="#a5b4fc" />
      <rect x="48" y="76"  width="64" height="14" rx="3" fill="#818cf8" />
      {/* Graduation cap */}
      <ellipse cx="80" cy="56" rx="28" ry="6" fill="#4f46e5" />
      <rect x="72" y="42" width="16" height="16" rx="2" fill="#4f46e5" />
      <polygon points="80,36 56,52 80,58 104,52" fill="#6366f1" />
      <ellipse cx="80" cy="58" rx="24" ry="5" fill="#4338ca" />
      {/* Tassel */}
      <line x1="104" y1="52" x2="110" y2="68" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="110" cy="70" r="4" fill="#fbbf24" />
      {/* Stars */}
      <text x="130" y="50" fontSize="16">⭐</text>
      <text x="20"  y="80" fontSize="12">✨</text>
      <text x="140" y="100" fontSize="10">📊</text>
    </svg>
  );
}

// ─── Bell / Notifications ─────────────────────────────────────────────────────

export function BellIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bell-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="bell-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="bell-glow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#fbbf24" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Glow circle */}
      <circle cx="80" cy="80" r="56" fill="url(#bell-bg)" />

      {/* Bell body */}
      <g filter="url(#bell-glow)">
        <path
          d="M80 28 C58 28 42 44 42 68 L42 96 L34 104 L126 104 L118 96 L118 68 C118 44 102 28 80 28 Z"
          fill="url(#bell-body)"
        />
        {/* Bell shine */}
        <ellipse cx="66" cy="52" rx="8" ry="14" fill="white" fillOpacity="0.25" transform="rotate(-20 66 52)" />
        {/* Clapper */}
        <ellipse cx="80" cy="108" rx="12" ry="7" fill="#f59e0b" />
        {/* Bell top knob */}
        <rect x="75" y="20" width="10" height="10" rx="5" fill="#f59e0b" />
      </g>

      {/* Notification dots */}
      <circle cx="112" cy="38" r="12" fill="#ef4444" />
      <text x="112" y="43" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">3</text>

      {/* Sound waves */}
      <path d="M128 56 Q136 68 128 80" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M136 48 Q148 68 136 88" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M32 56 Q24 68 32 80" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M24 48 Q12 68 24 88" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35" />
    </svg>
  );
}

// ─── Empty Notifications ──────────────────────────────────────────────────────

export function EmptyNotificationsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="#f5f3ff" />
      {/* Bell outline */}
      <path
        d="M60 22 C44 22 32 34 32 52 L32 72 L26 80 L94 80 L88 72 L88 52 C88 34 76 22 60 22 Z"
        fill="#ddd6fe"
        stroke="#a78bfa"
        strokeWidth="2"
      />
      <ellipse cx="60" cy="84" rx="9" ry="5" fill="#c4b5fd" />
      <rect x="56" y="16" width="8" height="8" rx="4" fill="#c4b5fd" />
      {/* Zzz */}
      <text x="76" y="44" fontSize="11" fontWeight="700" fill="#8b5cf6" opacity="0.7">z</text>
      <text x="82" y="36" fontSize="9"  fontWeight="700" fill="#8b5cf6" opacity="0.5">z</text>
      <text x="87" y="30" fontSize="7"  fontWeight="700" fill="#8b5cf6" opacity="0.3">z</text>
      {/* Check mark */}
      <circle cx="90" cy="90" r="14" fill="#10b981" />
      <polyline points="84,90 88,94 96,86" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Admin / Shield ───────────────────────────────────────────────────────────

export function AdminIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <filter id="shield-glow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#6366f1" floodOpacity="0.45" />
        </filter>
      </defs>
      <circle cx="80" cy="80" r="60" fill="#eef2ff" />
      <g filter="url(#shield-glow)">
        <path
          d="M80 26 L110 38 L110 72 C110 90 96 104 80 112 C64 104 50 90 50 72 L50 38 Z"
          fill="url(#shield-grad)"
        />
        {/* Shine */}
        <path d="M64 40 Q70 36 76 40 L72 72 Q68 68 64 72 Z" fill="white" fillOpacity="0.15" />
        {/* Check */}
        <polyline points="65,76 75,86 96,62" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Decorative dots */}
      <circle cx="34" cy="50" r="5" fill="#c7d2fe" />
      <circle cx="126" cy="50" r="5" fill="#c7d2fe" />
      <circle cx="28" cy="100" r="4" fill="#e0e7ff" />
      <circle cx="132" cy="100" r="4" fill="#e0e7ff" />
    </svg>
  );
}

// ─── Onboarding Welcome (graduation) ─────────────────────────────────────────

export function GraduationIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="grad-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <linearGradient id="grad-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="grad-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#6366f1" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="url(#grad-bg)" />

      {/* Person body */}
      <ellipse cx="100" cy="148" rx="32" ry="18" fill="url(#grad-body)" opacity="0.9" />
      <rect x="76" y="110" width="48" height="44" rx="10" fill="url(#grad-body)" />

      {/* Head */}
      <circle cx="100" cy="96" r="22" fill="#fde8d0" />
      {/* Face */}
      <ellipse cx="93" cy="95" rx="3" ry="3.5" fill="#1f2937" />
      <ellipse cx="107" cy="95" rx="3" ry="3.5" fill="#1f2937" />
      <path d="M93 105 Q100 111 107 105" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Graduation cap */}
      <g filter="url(#grad-shadow)">
        <ellipse cx="100" cy="74" rx="30" ry="7" fill="#1e1b4b" />
        <polygon points="100,58 72,72 100,78 128,72" fill="#3730a3" />
        <rect x="94" y="46" width="12" height="14" rx="2" fill="#1e1b4b" />
        <ellipse cx="100" cy="60" rx="6" ry="3" fill="#1e1b4b" />
        {/* Tassel */}
        <line x1="128" y1="72" x2="134" y2="90" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="134" cy="93" r="5" fill="#fbbf24" />
      </g>

      {/* Diploma scroll */}
      <g transform="rotate(-15 148 130)">
        <rect x="134" y="120" width="36" height="26" rx="6" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
        <rect x="140" y="126" width="24" height="3" rx="1.5" fill="#a5b4fc" />
        <rect x="140" y="133" width="18" height="3" rx="1.5" fill="#c7d2fe" />
        <rect x="140" y="140" width="21" height="3" rx="1.5" fill="#c7d2fe" />
        {/* Ribbon */}
        <rect x="148" y="118" width="4" height="30" rx="2" fill="#ef4444" opacity="0.8" />
      </g>

      {/* Stars / sparkles */}
      <text x="28"  y="56"  fontSize="20">⭐</text>
      <text x="152" y="46"  fontSize="16">✨</text>
      <text x="24"  y="148" fontSize="14">🎉</text>
      <text x="158" y="152" fontSize="14">🎓</text>
    </svg>
  );
}

// ─── Community / Study Group ──────────────────────────────────────────────────

export function CommunityIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Person 1 */}
      <circle cx="56" cy="68" r="18" fill="#ddd6fe" />
      <circle cx="56" cy="58" r="12" fill="#fde8d0" />
      <rect x="40" y="72" width="32" height="30" rx="8" fill="#7c3aed" opacity="0.85" />
      {/* Person 2 (center) */}
      <circle cx="100" cy="68" r="22" fill="#c7d2fe" />
      <circle cx="100" cy="56" r="14" fill="#fde8d0" />
      <rect x="82" y="72" width="36" height="34" rx="9" fill="#4f46e5" />
      {/* Person 3 */}
      <circle cx="144" cy="68" r="18" fill="#fce7f3" />
      <circle cx="144" cy="58" r="12" fill="#fde8d0" />
      <rect x="128" y="72" width="32" height="30" rx="8" fill="#db2777" opacity="0.85" />
      {/* Chat bubbles */}
      <rect x="30"  y="24" width="56" height="26" rx="10" fill="white" stroke="#ddd6fe" strokeWidth="1.5" />
      <polygon points="46,50 38,58 52,50" fill="white" stroke="#ddd6fe" strokeWidth="1.5" />
      <rect x="36"  y="30" width="36" height="4" rx="2" fill="#ddd6fe" />
      <rect x="36"  y="38" width="24" height="4" rx="2" fill="#ede9fe" />
      <rect x="114" y="18" width="60" height="28" rx="10" fill="white" stroke="#fce7f3" strokeWidth="1.5" />
      <polygon points="128,46 120,56 134,46" fill="white" stroke="#fce7f3" strokeWidth="1.5" />
      <rect x="120" y="25" width="40" height="4" rx="2" fill="#fce7f3" />
      <rect x="120" y="33" width="28" height="4" rx="2" fill="#fce7f3" />
      {/* Connecting line */}
      <line x1="72"  y1="90" x2="82"  y2="90" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="118" y1="90" x2="128" y2="90" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 3" />
      {/* Books at bottom */}
      <rect x="30" y="118" width="140" height="10" rx="3" fill="#e0e7ff" />
      <rect x="38" y="108" width="24" height="12" rx="2" fill="#818cf8" />
      <rect x="68" y="106" width="28" height="14" rx="2" fill="#a78bfa" />
      <rect x="102" y="109" width="22" height="11" rx="2" fill="#6366f1" />
      <rect x="130" y="107" width="26" height="13" rx="2" fill="#818cf8" />
    </svg>
  );
}

// ─── School Building ──────────────────────────────────────────────────────────

export function SchoolIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="building" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="200" height="180" rx="16" fill="url(#sky)" />

      {/* Clouds */}
      <ellipse cx="32"  cy="28" rx="22" ry="10" fill="white" fillOpacity="0.8" />
      <ellipse cx="46"  cy="22" rx="16" ry="10" fill="white" fillOpacity="0.9" />
      <ellipse cx="158" cy="32" rx="20" ry="9"  fill="white" fillOpacity="0.7" />
      <ellipse cx="172" cy="26" rx="14" ry="9"  fill="white" fillOpacity="0.85" />

      {/* Sun */}
      <circle cx="160" cy="28" r="14" fill="#fbbf24" fillOpacity="0.9" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line
          key={i}
          x1={160 + Math.cos(angle * Math.PI / 180) * 17}
          y1={28  + Math.sin(angle * Math.PI / 180) * 17}
          x2={160 + Math.cos(angle * Math.PI / 180) * 22}
          y2={28  + Math.sin(angle * Math.PI / 180) * 22}
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}

      {/* Main building */}
      <rect x="40" y="80" width="120" height="90" rx="4" fill="url(#building)" />

      {/* Roof / pediment */}
      <polygon points="30,80 100,44 170,80" fill="url(#roof)" />
      <polygon points="38,80 100,50 162,80" fill="#6366f1" opacity="0.3" />

      {/* Columns */}
      {[58, 82, 118, 142].map(x => (
        <rect key={x} x={x} y="80" width="10" height="90" rx="3" fill="#c7d2fe" opacity="0.7" />
      ))}

      {/* Windows */}
      {[56, 96, 136].map(x => (
        <g key={x}>
          <rect x={x} y="96" width="28" height="22" rx="4" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
          <line x1={x+14} y1="96" x2={x+14} y2={118} stroke="#93c5fd" strokeWidth="1" />
          <line x1={x} y1={107} x2={x+28} y2={107} stroke="#93c5fd" strokeWidth="1" />
        </g>
      ))}

      {/* Door */}
      <rect x="81" y="132" width="38" height="38" rx="6" fill="#4338ca" opacity="0.9" />
      <rect x="84" y="135" width="15" height="32" rx="3" fill="#4f46e5" />
      <rect x="101" y="135" width="15" height="32" rx="3" fill="#4f46e5" />
      <circle cx="100" cy="152" r="3" fill="#fbbf24" />

      {/* Flag on top */}
      <line x1="100" y1="44" x2="100" y2="26" stroke="#4338ca" strokeWidth="2" />
      <polygon points="100,26 118,32 100,38" fill="#ef4444" />

      {/* Ground */}
      <ellipse cx="100" cy="170" rx="80" ry="8" fill="#bbf7d0" fillOpacity="0.6" />
      <rect x="20" y="168" width="160" height="8" rx="4" fill="#86efac" fillOpacity="0.5" />

      {/* Trees */}
      <rect x="22" y="138" width="7"  height="28" rx="2" fill="#15803d" />
      <ellipse cx="26" cy="132" rx="14" ry="18" fill="#16a34a" />
      <rect x="171" y="138" width="7"  height="28" rx="2" fill="#15803d" />
      <ellipse cx="174" cy="132" rx="14" ry="18" fill="#16a34a" />
    </svg>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

export function AccessDeniedIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="80" cy="80" r="68" fill="#fef2f2" />
      <circle cx="80" cy="80" r="52" fill="#fee2e2" />
      {/* Lock body */}
      <rect x="52" y="80" width="56" height="44" rx="10" fill="#ef4444" />
      {/* Lock shackle */}
      <path d="M64 80 L64 64 Q64 46 80 46 Q96 46 96 64 L96 80" stroke="#b91c1c" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Keyhole */}
      <circle cx="80" cy="98" r="8" fill="#b91c1c" />
      <rect x="76" y="98" width="8" height="14" rx="4" fill="#b91c1c" />
      {/* X marks */}
      <line x1="36" y1="36" x2="50" y2="50" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="36" x2="36" y2="50" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="36" x2="124" y2="50" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" />
      <line x1="124" y1="36" x2="110" y2="50" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
