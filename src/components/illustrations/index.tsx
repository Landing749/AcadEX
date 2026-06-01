/**
 * Acadex Illustration Library — v2
 * Richly detailed inline SVG illustrations with animations.
 */
import React from 'react';

// ─── Hero / Auth ──────────────────────────────────────────────────────────────
export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="h-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="h-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="h-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d2fe"/>
          <stop offset="100%" stopColor="#a5b4fc"/>
        </linearGradient>
        <linearGradient id="h-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98"/>
          <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0.94"/>
        </linearGradient>
        <linearGradient id="h-chart-bar1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#c4b5fd"/>
        </linearGradient>
        <linearGradient id="h-chart-bar2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#a5b4fc"/>
        </linearGradient>
        <filter id="h-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#312e81" floodOpacity="0.3"/>
        </filter>
        <filter id="h-card-shadow" x="-15%" y="-10%" width="130%" height="135%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.14"/>
        </filter>
        <filter id="h-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <clipPath id="h-screen-clip">
          <rect x="176" y="82" width="228" height="148" rx="8"/>
        </clipPath>
      </defs>

      {/* Ambient orbs */}
      <circle cx="520" cy="60"  r="110" fill="white" fillOpacity="0.04"/>
      <circle cx="80"  cy="300" r="90"  fill="white" fillOpacity="0.04"/>
      <circle cx="300" cy="190" r="220" fill="white" fillOpacity="0.02"/>

      {/* ── Laptop body ── */}
      <g filter="url(#h-shadow)">
        {/* Lid */}
        <rect x="154" y="58" width="252" height="168" rx="14" fill="url(#h-card)"/>
        {/* Screen bezel */}
        <rect x="166" y="70" width="228" height="148" rx="8" fill="url(#h-screen)"/>
        {/* Screen content */}
        <g clipPath="url(#h-screen-clip)">
          {/* Header bar */}
          <rect x="176" y="82" width="228" height="28" fill="rgba(255,255,255,0.12)"/>
          <circle cx="191" cy="96" r="5" fill="rgba(255,255,255,0.35)"/>
          <circle cx="205" cy="96" r="5" fill="rgba(255,255,255,0.25)"/>
          <circle cx="219" cy="96" r="5" fill="rgba(255,255,255,0.15)"/>
          <rect x="235" y="90" width="80" height="12" rx="6" fill="rgba(255,255,255,0.15)"/>

          {/* Chart area */}
          <rect x="184" y="122" width="24" height="52" rx="5" fill="url(#h-chart-bar1)"/>
          <rect x="216" y="135" width="24" height="39" rx="5" fill="url(#h-chart-bar2)"/>
          <rect x="248" y="118" width="24" height="56" rx="5" fill="url(#h-chart-bar1)"/>
          <rect x="280" y="128" width="24" height="46" rx="5" fill="url(#h-chart-bar2)"/>
          <rect x="312" y="112" width="24" height="62" rx="5" fill="rgba(196,181,253,0.9)"/>
          <rect x="344" y="120" width="24" height="54" rx="5" fill="url(#h-chart-bar1)"/>

          {/* Chart line */}
          <polyline
            points="196,148 228,160 260,142 292,153 324,134 356,145"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            style={{ strokeDasharray: 300, strokeDashoffset: 0 }}
          />
          {/* Data dots */}
          {[[196,148],[228,160],[260,142],[292,153],[324,134],[356,145]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
          ))}

          {/* Sidebar */}
          <rect x="176" y="110" width="3" height="120" fill="rgba(255,255,255,0.08)"/>
          {/* Y-axis labels */}
          <rect x="183" y="114" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
          <rect x="183" y="128" width="16" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
          <rect x="183" y="142" width="18" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
        </g>

        {/* Webcam dot */}
        <circle cx="280" cy="74" r="3" fill="rgba(255,255,255,0.3)"/>
        {/* Hinge */}
        <rect x="154" y="224" width="252" height="7" rx="2" fill="#c7d2fe"/>
        {/* Base */}
        <rect x="136" y="230" width="288" height="16" rx="8" fill="url(#h-desk)"/>
        {/* Keyboard rows */}
        {[0,1,2].map(row=>(
          <g key={row}>
            {[0,1,2,3,4,5,6,7].map(col=>(
              <rect key={col} x={152+(col*35)} y={234+(row*4)} width="28" height="2.5" rx="1.2"
                fill="rgba(100,116,139,0.3)"/>
            ))}
          </g>
        ))}
        <rect x="196" y="246" width="168" height="2.5" rx="1.2" fill="rgba(100,116,139,0.25)"/>
      </g>

      {/* ── Grade card (top right) — floating ── */}
      <g filter="url(#h-card-shadow)" style={{ animation: 'float 4.5s ease-in-out infinite' }}>
        <rect x="420" y="50" width="148" height="88" rx="18" fill="white" fillOpacity="0.98"/>
        {/* Icon bg */}
        <rect x="436" y="66" width="44" height="44" rx="14" fill="#ede9fe"/>
        {/* A grade */}
        <text x="458" y="96" textAnchor="middle" fontSize="22" fontWeight="800" fill="#7c3aed" fontFamily="Plus Jakarta Sans, sans-serif">A+</text>
        {/* Labels */}
        <rect x="490" y="70" width="60" height="7" rx="3.5" fill="#e0e7ff"/>
        <rect x="490" y="83" width="44" height="6"  rx="3"   fill="#e0e7ff"/>
        <rect x="490" y="96" width="52" height="6"  rx="3"   fill="#c7d2fe"/>
        {/* Score bar */}
        <rect x="436" y="116" width="112" height="5" rx="2.5" fill="#f3f4f6"/>
        <rect x="436" y="116" width="90"  height="5" rx="2.5" fill="url(#h-chart-bar1)"/>
        {/* Sparkle */}
        <circle cx="556" cy="62" r="5" fill="#fbbf24" fillOpacity="0.8"/>
        <circle cx="428" cy="128" r="3" fill="#a78bfa" fillOpacity="0.6"/>
      </g>

      {/* ── Task card (bottom left) — floating ── */}
      <g filter="url(#h-card-shadow)" style={{ animation: 'float 5.5s ease-in-out infinite', animationDelay: '-1.2s' }}>
        <rect x="22" y="168" width="136" height="116" rx="18" fill="white" fillOpacity="0.98"/>
        {/* Header */}
        <rect x="38" y="184" width="24" height="24" rx="8" fill="#dbeafe"/>
        <rect x="70" y="187" width="72" height="7"  rx="3.5" fill="#e0e7ff"/>
        <rect x="70" y="199" width="52" height="5"  rx="2.5" fill="#e5e7eb"/>
        {/* Task items */}
        <circle cx="50" cy="228" r="9" fill="#10b981"/>
        <polyline points="45,228 49,232 55,224" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="66" y="224" width="76" height="5" rx="2.5" fill="#d1fae5"/>

        <circle cx="50" cy="248" r="9" fill="#f59e0b"/>
        <rect x="45" y="246" width="10" height="4" rx="1" fill="white" fillOpacity="0.9"/>
        <rect x="66" y="244" width="60" height="5" rx="2.5" fill="#fef3c7"/>

        <circle cx="50" cy="268" r="9" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
        <rect x="66" y="264" width="50" height="5" rx="2.5" fill="#e5e7eb"/>
        {/* Progress */}
        <rect x="38" y="276" width="104" height="4" rx="2" fill="#f3f4f6"/>
        <rect x="38" y="276" width="68"  height="4" rx="2" fill="#10b981"/>
      </g>

      {/* ── Notification toast (top left) — floating ── */}
      <g filter="url(#h-card-shadow)" style={{ animation: 'float 3.8s ease-in-out infinite', animationDelay: '-0.5s' }}>
        <rect x="20" y="60" width="144" height="68" rx="18" fill="white" fillOpacity="0.98"/>
        {/* Bell icon bg */}
        <rect x="34" y="74" width="36" height="36" rx="12" fill="#fef3c7"/>
        <text x="52" y="97" textAnchor="middle" fontSize="18">🔔</text>
        {/* Dot */}
        <circle cx="65" cy="73" r="6" fill="#ef4444"/>
        <text x="65" y="77" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">2</text>
        {/* Text lines */}
        <rect x="80" y="79" width="68" height="7" rx="3.5" fill="#1f2937" fillOpacity="0.85"/>
        <rect x="80" y="92" width="52" height="5" rx="2.5" fill="#6b7280" fillOpacity="0.6"/>
        <rect x="80" y="103" width="60" height="5" rx="2.5" fill="#6366f1" fillOpacity="0.4"/>
      </g>

      {/* ── Stats pill (bottom right) — floating ── */}
      <g filter="url(#h-card-shadow)">
        <rect x="432" y="200" width="128" height="60" rx="30" fill="white" fillOpacity="0.98"/>
        <circle cx="464" cy="230" r="18" fill="#fef3c7"/>
        <text x="464" y="235" textAnchor="middle" fontSize="16">⭐</text>
        <rect x="490" y="220" width="56" height="7" rx="3.5" fill="#e0e7ff"/>
        <rect x="490" y="233" width="40" height="6" rx="3"   fill="#fde68a"/>
        <text x="490" y="248" fontSize="8" fill="#10b981" fontWeight="700" fontFamily="Sora, sans-serif">↑ 12%</text>
      </g>

      {/* Dot grid decoration */}
      {Array.from({length: 12}).map((_,i)=>(
        <circle key={i} cx={432+(i%4)*20} cy={280+Math.floor(i/4)*18} r="3.5"
          fill="white" fillOpacity={0.1 + (i%3)*0.05}/>
      ))}

      {/* Corner sparkles */}
      <g opacity="0.6">
        <circle cx="542" cy="290" r="4" fill="white" fillOpacity="0.3"/>
        <circle cx="554" cy="278" r="2.5" fill="white" fillOpacity="0.2"/>
        <circle cx="530" cy="304" r="2" fill="white" fillOpacity="0.25"/>
      </g>
    </svg>
  );
}

// ─── Dashboard Hero Banner ────────────────────────────────────────────────────
export function DashboardHeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dh-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d2fe"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="dh-book1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
        <linearGradient id="dh-book2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
        <linearGradient id="dh-book3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <filter id="dh-glow">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#4f46e5" floodOpacity="0.35"/>
        </filter>
      </defs>

      {/* Orbit ring */}
      <circle cx="120" cy="95" r="72" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="6 4"/>

      {/* Book stack — 3D style */}
      <g filter="url(#dh-glow)">
        {/* Book 3 (bottom) */}
        <rect x="56" y="130" width="108" height="18" rx="4" fill="url(#dh-book1)"/>
        <rect x="56" y="130" width="8"   height="18" rx="2" fill="rgba(0,0,0,0.12)"/>
        <rect x="60" y="134" width="3"   height="10" rx="1.5" fill="rgba(255,255,255,0.25)"/>
        {/* Book 2 */}
        <rect x="62" y="112" width="96"  height="20" rx="4" fill="url(#dh-book2)"/>
        <rect x="62" y="112" width="8"   height="20" rx="2" fill="rgba(0,0,0,0.1)"/>
        <rect x="66" y="116" width="3"   height="12" rx="1.5" fill="rgba(255,255,255,0.2)"/>
        {/* Book 1 (top) */}
        <rect x="68" y="94"  width="84"  height="20" rx="4" fill="url(#dh-book3)"/>
        <rect x="68" y="94"  width="8"   height="20" rx="2" fill="rgba(0,0,0,0.08)"/>
        <rect x="72" y="98"  width="3"   height="12" rx="1.5" fill="rgba(255,255,255,0.25)"/>
        {/* Pages illusion */}
        <rect x="76" y="96" width="70" height="16" rx="2" fill="rgba(255,255,255,0.06)"/>
      </g>

      {/* Graduation cap */}
      <g style={{ animation: 'float 5s ease-in-out infinite' }}>
        <ellipse cx="120" cy="74" rx="36" ry="9" fill="white" fillOpacity="0.9"/>
        <polygon points="120,50 84,72 120,80 156,72" fill="url(#dh-cap)"/>
        <ellipse cx="120" cy="80" rx="30" ry="7" fill="rgba(79,70,229,0.7)"/>
        <rect x="114" y="34" width="12" height="18" rx="3" fill="rgba(255,255,255,0.85)"/>
        {/* Tassel */}
        <line x1="154" y1="72" x2="162" y2="94" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="162" cy="96" r="6" fill="#fbbf24"/>
        <line x1="158" y1="96" x2="156" y2="108" stroke="#fbbf24" strokeWidth="1.5"/>
        <line x1="162" y1="96" x2="162" y2="110" stroke="#fbbf24" strokeWidth="1.5"/>
        <line x1="166" y1="96" x2="168" y2="108" stroke="#fbbf24" strokeWidth="1.5"/>
      </g>

      {/* Floating accent orbs */}
      <circle cx="50"  cy="70"  r="8" fill="white" fillOpacity="0.15" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '-1s' }}/>
      <circle cx="192" cy="110" r="6" fill="white" fillOpacity="0.12" style={{ animation: 'float 3.5s ease-in-out infinite', animationDelay: '-0.3s' }}/>
      <circle cx="172" cy="52"  r="4" fill="#fbbf24" fillOpacity="0.5"/>
      <circle cx="50"  cy="130" r="3" fill="#a78bfa" fillOpacity="0.5"/>

      {/* Star sparkles */}
      <text x="30"  y="86"  fontSize="18" opacity="0.8">✨</text>
      <text x="190" y="76"  fontSize="14" opacity="0.7">⭐</text>
      <text x="186" y="160" fontSize="12" opacity="0.6">📊</text>
    </svg>
  );
}

// ─── Bell / Notifications ─────────────────────────────────────────────────────
export function BellIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
        <linearGradient id="bl-bell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="bl-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <filter id="bl-glow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#fbbf24" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* Background orb */}
      <circle cx="90" cy="90" r="72" fill="url(#bl-bg)"/>
      <circle cx="90" cy="90" r="60" fill="rgba(251,191,36,0.15)"/>

      {/* Sound waves */}
      <path d="M150 56 Q162 75 150 94" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M162 44 Q180 75 162 106" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.3"/>
      <path d="M30 56 Q18 75 30 94"    stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M18 44 Q0  75 18 106"   stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.3"/>

      {/* Bell body */}
      <g filter="url(#bl-glow)">
        {/* Main bell shape */}
        <path
          d="M90 30 C62 30 42 50 42 78 L42 110 L32 122 L148 122 L138 110 L138 78 C138 50 118 30 90 30 Z"
          fill="url(#bl-bell)"
        />
        {/* Shine overlay */}
        <ellipse cx="72" cy="62" rx="12" ry="20" fill="url(#bl-shine)" transform="rotate(-15 72 62)"/>
        {/* Inner shadow at bottom */}
        <path d="M42 110 L32 122 L148 122 L138 110 Z" fill="rgba(0,0,0,0.08)"/>
        {/* Clapper */}
        <ellipse cx="90" cy="128" rx="14" ry="8" fill="#f59e0b"/>
        <ellipse cx="90" cy="126" rx="10" ry="5" fill="#fbbf24"/>
        {/* Top knob */}
        <rect x="84" y="20" width="12" height="12" rx="6" fill="#f59e0b"/>
        <rect x="86" y="18" width="8"  height="4"  rx="2" fill="#fcd34d"/>
      </g>

      {/* Badge */}
      <circle cx="128" cy="42" r="16" fill="#ef4444"/>
      <circle cx="128" cy="42" r="13" fill="#f87171" fillOpacity="0.4"/>
      <text x="128" y="47" textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Plus Jakarta Sans">3</text>

      {/* Sparkles */}
      <circle cx="148" cy="138" r="5" fill="#fbbf24" fillOpacity="0.5"/>
      <circle cx="36"  cy="42"  r="4" fill="#fbbf24" fillOpacity="0.4"/>
      <circle cx="156" cy="66"  r="3" fill="#fde68a" fillOpacity="0.6"/>
    </svg>
  );
}

// ─── Empty Notifications ──────────────────────────────────────────────────────
export function EmptyNotificationsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="en-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f3ff"/>
          <stop offset="100%" stopColor="#ede9fe"/>
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="62" fill="url(#en-bg)"/>
      <circle cx="70" cy="70" r="50" fill="rgba(167,139,250,0.08)"/>

      {/* Bell outline */}
      <path
        d="M70 26 C50 26 36 40 36 60 L36 84 L28 94 L112 94 L104 84 L104 60 C104 40 90 26 70 26 Z"
        fill="#ddd6fe" stroke="#a78bfa" strokeWidth="1.5"
      />
      {/* Shine */}
      <ellipse cx="56" cy="46" rx="7" ry="14" fill="white" fillOpacity="0.3" transform="rotate(-15 56 46)"/>
      <ellipse cx="70" cy="98" rx="10" ry="6" fill="#c4b5fd"/>
      <rect x="64" y="18" width="12" height="10" rx="5" fill="#c4b5fd"/>

      {/* Zzz */}
      <text x="90" y="52" fontSize="13" fontWeight="700" fill="#8b5cf6" opacity="0.75">z</text>
      <text x="98" y="43" fontSize="10" fontWeight="700" fill="#8b5cf6" opacity="0.5">z</text>
      <text x="104" y="36" fontSize="8"  fontWeight="700" fill="#8b5cf6" opacity="0.3">z</text>

      {/* Check mark badge */}
      <circle cx="106" cy="106" r="18" fill="#10b981"/>
      <circle cx="106" cy="106" r="14" fill="rgba(52,211,153,0.3)"/>
      <polyline points="99,106 103,111 113,100" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Stars */}
      <circle cx="28" cy="110" r="4" fill="#a78bfa" fillOpacity="0.5"/>
      <circle cx="20" cy="68"  r="3" fill="#c4b5fd" fillOpacity="0.5"/>
    </svg>
  );
}

// ─── Admin / Shield ───────────────────────────────────────────────────────────
export function AdminIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ad-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff"/>
          <stop offset="100%" stopColor="#e0e7ff"/>
        </linearGradient>
        <linearGradient id="ad-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#3730a3"/>
        </linearGradient>
        <linearGradient id="ad-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <filter id="ad-glow">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#4f46e5" floodOpacity="0.45"/>
        </filter>
      </defs>

      <circle cx="90" cy="90" r="76" fill="url(#ad-bg)"/>

      {/* Orbit dots */}
      {[0,60,120,180,240,300].map((deg,i)=>(
        <circle key={i}
          cx={90+68*Math.cos(deg*Math.PI/180)}
          cy={90+68*Math.sin(deg*Math.PI/180)}
          r="3.5" fill="#c7d2fe" fillOpacity={0.5+i*0.08}
        />
      ))}

      {/* Shield */}
      <g filter="url(#ad-glow)">
        <path
          d="M90 28 L124 42 L124 82 C124 104 110 120 90 130 C70 120 56 104 56 82 L56 42 Z"
          fill="url(#ad-shield)"
        />
        {/* Shield inner highlight */}
        <path
          d="M90 28 L124 42 L124 82 C124 104 110 120 90 130 C70 120 56 104 56 82 L56 42 Z"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
        />
        {/* Shine panel */}
        <path d="M72 44 Q80 40 88 44 L84 82 Q78 78 72 82 Z" fill="url(#ad-shine)"/>
        {/* Check mark */}
        <polyline points="72,88 82,100 108,72" stroke="white" strokeWidth="6"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Star inside */}
        <circle cx="90" cy="88" r="28" fill="rgba(255,255,255,0.05)"/>
      </g>

      {/* Corner accents */}
      <circle cx="34"  cy="56"  r="7"   fill="#c7d2fe" fillOpacity="0.8"/>
      <circle cx="146" cy="56"  r="7"   fill="#c7d2fe" fillOpacity="0.8"/>
      <circle cx="28"  cy="110" r="5"   fill="#e0e7ff" fillOpacity="0.9"/>
      <circle cx="152" cy="110" r="5"   fill="#e0e7ff" fillOpacity="0.9"/>
      <circle cx="50"  cy="148" r="4"   fill="#a5b4fc" fillOpacity="0.6"/>
      <circle cx="130" cy="148" r="4"   fill="#a5b4fc" fillOpacity="0.6"/>
    </svg>
  );
}

// ─── Onboarding Welcome (Graduation) ─────────────────────────────────────────
export function GraduationIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="gr-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0e7ff"/>
          <stop offset="100%" stopColor="#ede9fe"/>
        </radialGradient>
        <linearGradient id="gr-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
        <linearGradient id="gr-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312e81"/>
          <stop offset="100%" stopColor="#1e1b4b"/>
        </linearGradient>
        <filter id="gr-shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#4f46e5" floodOpacity="0.28"/>
        </filter>
      </defs>

      {/* Background */}
      <circle cx="110" cy="110" r="100" fill="url(#gr-bg)"/>
      {/* Inner ring */}
      <circle cx="110" cy="110" r="82" stroke="rgba(99,102,241,0.1)" strokeWidth="1.5" strokeDasharray="8 5"/>

      {/* Person — robe */}
      <ellipse cx="110" cy="165" rx="40" ry="22" fill="url(#gr-robe)" opacity="0.9"/>
      <rect x="78" y="126" width="64" height="50" rx="14" fill="url(#gr-robe)"/>
      {/* Collar */}
      <path d="M96 126 Q110 140 124 126" fill="#4f46e5" stroke="#6366f1" strokeWidth="1"/>

      {/* Head */}
      <circle cx="110" cy="106" r="26" fill="#fde8d0"/>
      {/* Ears */}
      <ellipse cx="84"  cy="108" rx="5" ry="7" fill="#f9d5b5"/>
      <ellipse cx="136" cy="108" rx="5" ry="7" fill="#f9d5b5"/>
      {/* Face */}
      <ellipse cx="102" cy="105" rx="3.5" ry="4" fill="#1f2937"/>
      <ellipse cx="118" cy="105" rx="3.5" ry="4" fill="#1f2937"/>
      {/* Smile */}
      <path d="M102 117 Q110 125 118 117" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Cheeks */}
      <ellipse cx="100" cy="115" rx="5" ry="3" fill="#f9a8a8" fillOpacity="0.6"/>
      <ellipse cx="120" cy="115" rx="5" ry="3" fill="#f9a8a8" fillOpacity="0.6"/>
      {/* Hair */}
      <path d="M84 98 Q110 78 136 98 L136 88 Q110 68 84 88 Z" fill="#374151"/>

      {/* Graduation cap */}
      <g filter="url(#gr-shadow)" style={{ animation: 'float 5s ease-in-out infinite' }}>
        <ellipse cx="110" cy="80" rx="34" ry="8"   fill="url(#gr-cap)"/>
        <polygon points="110,60 76,78 110,86 144,78" fill="#4338ca"/>
        <ellipse cx="110" cy="86" rx="28" ry="6.5" fill="#1e1b4b"/>
        <rect x="104" y="44" width="12" height="18" rx="3" fill="url(#gr-cap)"/>
        <ellipse cx="110" cy="62" rx="7" ry="4" fill="#312e81"/>
        {/* Tassel */}
        <line x1="142" y1="78" x2="150" y2="100" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="150" cy="103" r="6" fill="#fbbf24"/>
        <line x1="146" y1="103" x2="144" y2="116" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="150" y1="103" x2="150" y2="118" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="154" y1="103" x2="156" y2="116" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Diploma */}
      <g transform="rotate(-18 170 145)" style={{ animation: 'float 4.5s ease-in-out infinite', animationDelay: '-0.8s' }}>
        <rect x="148" y="132" width="44" height="32" rx="8" fill="white" stroke="#c7d2fe" strokeWidth="1.5"/>
        <rect x="155" y="139" width="30" height="4"  rx="2" fill="#a5b4fc"/>
        <rect x="155" y="147" width="22" height="3"  rx="1.5" fill="#c7d2fe"/>
        <rect x="155" y="154" width="26" height="3"  rx="1.5" fill="#c7d2fe"/>
        {/* Red ribbon */}
        <rect x="166" y="130" width="5" height="36" rx="2.5" fill="#ef4444" opacity="0.85"/>
        <polygon points="166,130 171,130 168.5,136" fill="#dc2626"/>
      </g>

      {/* Confetti / sparkles */}
      <text x="24"  y="68"  fontSize="22" opacity="0.9">🎉</text>
      <text x="170" y="52"  fontSize="18" opacity="0.85">✨</text>
      <text x="18"  y="162" fontSize="16" opacity="0.8">🎓</text>
      <text x="172" y="170" fontSize="14" opacity="0.75">⭐</text>

      {/* Small circles */}
      <circle cx="58"  cy="52"  r="5" fill="#fbbf24" fillOpacity="0.5"/>
      <circle cx="168" cy="138" r="4" fill="#a78bfa" fillOpacity="0.4"/>
      <circle cx="46"  cy="140" r="3" fill="#6366f1" fillOpacity="0.3"/>
    </svg>
  );
}

// ─── Community / Study Group ──────────────────────────────────────────────────
export function CommunityIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cm-p1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
        <linearGradient id="cm-p2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
        <linearGradient id="cm-p3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#db2777"/>
          <stop offset="100%" stopColor="#be185d"/>
        </linearGradient>
        <filter id="cm-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1"/>
        </filter>
      </defs>

      {/* Background arc */}
      <path d="M20 160 Q120 100 220 160" stroke="rgba(99,102,241,0.08)" strokeWidth="80" fill="none"/>

      {/* ── Person 1 (left) ── */}
      <g>
        <circle cx="60" cy="80"  r="22" fill="rgba(221,214,254,0.5)"/>
        <circle cx="60" cy="66"  r="14" fill="#fde8d0"/>
        {/* Hair */}
        <path d="M46 62 Q60 50 74 62 L74 56 Q60 44 46 56 Z" fill="#374151"/>
        <rect x="42" y="78" width="36" height="38" rx="10" fill="url(#cm-p1)"/>
        {/* Face details */}
        <ellipse cx="55" cy="67" rx="2.5" ry="3" fill="#1f2937"/>
        <ellipse cx="65" cy="67" rx="2.5" ry="3" fill="#1f2937"/>
        <path d="M55 75 Q60 79 65 75" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* ── Person 2 (center) ── */}
      <g>
        <circle cx="120" cy="76" r="28" fill="rgba(199,210,254,0.5)"/>
        <circle cx="120" cy="60" r="17" fill="#fde8d0"/>
        <path d="M103 56 Q120 44 137 56 L137 48 Q120 36 103 48 Z" fill="#1f2937"/>
        <rect x="96" y="80" width="48" height="44" rx="12" fill="url(#cm-p2)"/>
        <ellipse cx="114" cy="61" rx="3" ry="3.5" fill="#1f2937"/>
        <ellipse cx="126" cy="61" rx="3" ry="3.5" fill="#1f2937"/>
        <path d="M114 70 Q120 75 126 70" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <ellipse cx="110" cy="68" rx="5" ry="3" fill="#f9a8a8" fillOpacity="0.5"/>
        <ellipse cx="130" cy="68" rx="5" ry="3" fill="#f9a8a8" fillOpacity="0.5"/>
      </g>

      {/* ── Person 3 (right) ── */}
      <g>
        <circle cx="180" cy="80" r="22" fill="rgba(252,231,243,0.5)"/>
        <circle cx="180" cy="66" r="14" fill="#fde8d0"/>
        {/* Curly hair */}
        <path d="M166 60 Q180 48 194 60 L194 54 Q180 42 166 54 Z" fill="#7c3aed"/>
        <rect x="162" y="78" width="36" height="38" rx="10" fill="url(#cm-p3)"/>
        <ellipse cx="175" cy="67" rx="2.5" ry="3" fill="#1f2937"/>
        <ellipse cx="185" cy="67" rx="2.5" ry="3" fill="#1f2937"/>
        <path d="M175 75 Q180 79 185 75" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* Chat bubbles */}
      <g filter="url(#cm-shadow)" style={{ animation: 'float 4s ease-in-out infinite' }}>
        <rect x="24" y="18" width="72" height="36" rx="14" fill="white" stroke="#ddd6fe" strokeWidth="1.5"/>
        <polygon points="38,54 28,64 50,54" fill="white"/>
        <polygon points="38,54 28,64 50,54" fill="white" stroke="#ddd6fe" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="34" y="28" width="48" height="5"  rx="2.5" fill="#ddd6fe"/>
        <rect x="34" y="38" width="36" height="4"  rx="2"   fill="#ede9fe"/>
        <circle cx="34" cy="30" r="4" fill="#a78bfa" fillOpacity="0.5"/>
      </g>
      <g filter="url(#cm-shadow)" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '-0.8s' }}>
        <rect x="144" y="12" width="76" height="38" rx="14" fill="white" stroke="#fce7f3" strokeWidth="1.5"/>
        <polygon points="160,50 150,62 170,50" fill="white"/>
        <polygon points="160,50 150,62 170,50" fill="white" stroke="#fce7f3" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="154" y="22" width="52" height="5" rx="2.5" fill="#fce7f3"/>
        <rect x="154" y="32" width="36" height="4" rx="2"   fill="#fce7f3"/>
        <text x="196" y="30" fontSize="16">💡</text>
      </g>

      {/* Connection lines */}
      <line x1="82"  y1="104" x2="96"  y2="104" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="5 4"/>
      <line x1="144" y1="104" x2="158" y2="104" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="5 4"/>

      {/* Books bottom shelf */}
      <rect x="24"  y="144" width="192" height="12" rx="4" fill="#e0e7ff"/>
      {[
        {x:32, h:20, c:'#818cf8'},{x:56, h:24, c:'#a78bfa'},{x:84, h:18, c:'#6366f1'},
        {x:108,h:22, c:'#7c3aed'},{x:136,h:20, c:'#818cf8'},{x:160,h:26, c:'#4f46e5'},
        {x:190,h:18, c:'#a78bfa'}
      ].map(({x,h,c},i)=>(
        <g key={i}>
          <rect x={x} y={144-h} width="20" height={h+4} rx="3" fill={c}/>
          <rect x={x} y={144-h} width="4"  height={h+4} rx="2" fill="rgba(0,0,0,0.12)"/>
        </g>
      ))}
    </svg>
  );
}

// ─── School Building ──────────────────────────────────────────────────────────
export function SchoolIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#e0f2fe"/>
        </linearGradient>
        <linearGradient id="sc-building" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff"/>
          <stop offset="100%" stopColor="#c7d2fe"/>
        </linearGradient>
        <linearGradient id="sc-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
        <linearGradient id="sc-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4338ca"/>
          <stop offset="100%" stopColor="#312e81"/>
        </linearGradient>
        <linearGradient id="sc-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <filter id="sc-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#312e81" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="240" height="200" rx="20" fill="url(#sc-sky)"/>

      {/* Clouds */}
      <g opacity="0.85">
        <ellipse cx="44" cy="36" rx="26" ry="13" fill="white"/>
        <ellipse cx="58" cy="28" rx="20" ry="13" fill="white"/>
        <ellipse cx="36" cy="38" rx="16" ry="10" fill="white"/>
      </g>
      <g opacity="0.75">
        <ellipse cx="190" cy="40" rx="24" ry="11" fill="white"/>
        <ellipse cx="204" cy="32" rx="18" ry="11" fill="white"/>
      </g>

      {/* Sun */}
      <g>
        <circle cx="200" cy="34" r="18" fill="url(#sc-sun)" opacity="0.9"/>
        {[0,45,90,135,180,225,270,315].map((angle,i)=>(
          <line key={i}
            x1={200+Math.cos(angle*Math.PI/180)*21} y1={34+Math.sin(angle*Math.PI/180)*21}
            x2={200+Math.cos(angle*Math.PI/180)*28} y2={34+Math.sin(angle*Math.PI/180)*28}
            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.7"
          />
        ))}
        <circle cx="200" cy="34" r="14" fill="#fef3c7" fillOpacity="0.5"/>
      </g>

      {/* Shadow on ground */}
      <ellipse cx="120" cy="190" rx="90" ry="10" fill="rgba(79,70,229,0.08)"/>

      {/* Main building */}
      <g filter="url(#sc-shadow)">
        <rect x="44" y="94" width="152" height="96" rx="4" fill="url(#sc-building)"/>
        {/* Side shadows */}
        <rect x="44"  y="94" width="10" height="96" fill="rgba(0,0,0,0.06)"/>
        <rect x="186" y="94" width="10" height="96" fill="rgba(0,0,0,0.04)"/>
      </g>

      {/* Pediment / Roof */}
      <polygon points="28,94 120,50 212,94" fill="url(#sc-roof)"/>
      {/* Roof ridge shading */}
      <polygon points="34,94 120,56 206,94" fill="rgba(255,255,255,0.06)"/>
      {/* Entablature */}
      <rect x="38" y="92" width="164" height="8" rx="2" fill="#4f46e5"/>

      {/* Columns */}
      {[62, 90, 150, 178].map(x=>(
        <g key={x}>
          <rect x={x} y="94" width="12" height="96" rx="4" fill="rgba(255,255,255,0.35)"/>
          <ellipse cx={x+6} cy={94} rx={8} ry={3} fill="rgba(255,255,255,0.4)"/>
          <ellipse cx={x+6} cy={190} rx={8} ry={3} fill="rgba(255,255,255,0.25)"/>
        </g>
      ))}

      {/* Windows row 1 */}
      {[64, 108, 152].map(x=>(
        <g key={x}>
          <rect x={x} y="106" width="32" height="26" rx="5" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
          <rect x={x} y="106" width="32" height="26" rx="5" fill="rgba(255,255,255,0.15)"/>
          <line x1={x+16} y1={106} x2={x+16} y2={132} stroke="#93c5fd" strokeWidth="1"/>
          <line x1={x} y1={119} x2={x+32} y2={119} stroke="#93c5fd" strokeWidth="1"/>
          {/* Window reflection */}
          <rect x={x+3} y={109} width={8} height={8} rx={2} fill="white" fillOpacity={0.25}/>
        </g>
      ))}

      {/* Windows row 2 */}
      {[72, 116, 160].map(x=>(
        <g key={x}>
          <rect x={x} y="142" width="24" height="18" rx="4" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="0.75"/>
          <line x1={x+12} y1={142} x2={x+12} y2={160} stroke="#93c5fd" strokeWidth="0.75"/>
        </g>
      ))}

      {/* Door */}
      <rect x="96" y="152" width="48" height="38" rx="8" fill="url(#sc-door)"/>
      {/* Door panels */}
      <rect x="99" y="155" width="20" height="30" rx="4" fill="#4f46e5"/>
      <rect x="121" y="155" width="20" height="30" rx="4" fill="#4f46e5"/>
      {/* Door arch */}
      <path d="M96 160 Q120 148 144 160" fill="url(#sc-door)"/>
      {/* Door knob */}
      <circle cx="120" cy="172" r="4" fill="#fbbf24"/>
      <circle cx="120" cy="172" r="2.5" fill="#fde68a"/>
      {/* Door steps */}
      <rect x="88"  y="188" width="64" height="5" rx="2" fill="rgba(79,70,229,0.3)"/>
      <rect x="84"  y="193" width="72" height="4" rx="2" fill="rgba(79,70,229,0.2)"/>

      {/* Flag */}
      <line x1="120" y1="50" x2="120" y2="28" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="120,28 142,34 120,42" fill="#ef4444"/>
      <polygon points="120,28 142,34 120,40" fill="#f87171"/>

      {/* Trees */}
      <g>
        <rect x="22"  y="156" width="9" height="34" rx="3" fill="#15803d"/>
        <ellipse cx="26.5" cy="148" rx="18" ry="22" fill="#16a34a"/>
        <ellipse cx="26.5" cy="142" rx="14" ry="16" fill="#22c55e"/>
      </g>
      <g>
        <rect x="209" y="156" width="9" height="34" rx="3" fill="#15803d"/>
        <ellipse cx="213.5" cy="148" rx="18" ry="22" fill="#16a34a"/>
        <ellipse cx="213.5" cy="142" rx="14" ry="16" fill="#22c55e"/>
      </g>

      {/* Ground */}
      <rect x="14" y="190" width="212" height="8" rx="4" fill="#86efac" fillOpacity="0.6"/>
    </svg>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────
export function AccessDeniedIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ac-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fee2e2"/>
          <stop offset="100%" stopColor="#fef2f2"/>
        </radialGradient>
        <linearGradient id="ac-lock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171"/>
          <stop offset="100%" stopColor="#ef4444"/>
        </linearGradient>
        <filter id="ac-glow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#ef4444" floodOpacity="0.35"/>
        </filter>
      </defs>

      <circle cx="90" cy="90" r="82" fill="url(#ac-bg)"/>
      <circle cx="90" cy="90" r="66" fill="rgba(239,68,68,0.06)"/>

      {/* Lock body */}
      <g filter="url(#ac-glow)">
        <rect x="54" y="90" width="72" height="58" rx="14" fill="url(#ac-lock)"/>
        {/* Inner panel */}
        <rect x="60" y="96" width="60" height="46" rx="10" fill="rgba(255,255,255,0.1)"/>
        {/* Shackle */}
        <path d="M68 90 L68 70 Q68 48 90 48 Q112 48 112 70 L112 90"
          stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" fill="none"/>
        {/* Shackle inner */}
        <path d="M68 90 L68 70 Q68 48 90 48 Q112 48 112 70 L112 90"
          stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Keyhole */}
        <circle cx="90" cy="112" r="10" fill="#b91c1c"/>
        <rect x="85" y="112" width="10" height="16" rx="5" fill="#b91c1c"/>
        <circle cx="90" cy="110" r="7" fill="#991b1b"/>
      </g>

      {/* X marks */}
      {[[38,38],[126,38],[32,130],[144,130]].map(([x,y],i)=>(
        <g key={i} opacity="0.6">
          <line x1={x-7} y1={y-7} x2={x+7} y2={y+7} stroke="#fca5a5" strokeWidth="4.5" strokeLinecap="round"/>
          <line x1={x+7} y1={y-7} x2={x-7} y2={y+7} stroke="#fca5a5" strokeWidth="4.5" strokeLinecap="round"/>
        </g>
      ))}

      {/* Warning triangle */}
      <g transform="translate(72, 48)">
        <polygon points="18,0 36,32 0,32" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="18" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="#d97706">!</text>
      </g>
    </svg>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyStateIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="es-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff"/>
          <stop offset="100%" stopColor="#f5f3ff"/>
        </linearGradient>
        <linearGradient id="es-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d2fe"/>
          <stop offset="100%" stopColor="#a5b4fc"/>
        </linearGradient>
        <filter id="es-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#4f46e5" floodOpacity="0.2"/>
        </filter>
      </defs>

      <ellipse cx="100" cy="160" rx="80" ry="14" fill="rgba(99,102,241,0.06)"/>

      {/* Box */}
      <g filter="url(#es-shadow)">
        {/* Bottom */}
        <rect x="50" y="100" width="100" height="60" rx="8" fill="url(#es-box)"/>
        {/* Left side */}
        <path d="M50 100 L40 112 L40 168 L50 160 Z" fill="#a5b4fc"/>
        {/* Right side */}
        <path d="M150 100 L160 112 L160 168 L150 160 Z" fill="#818cf8"/>
        {/* Lid left */}
        <path d="M50 100 L40 112 L100 112 L100 100 Z" fill="#ddd6fe"/>
        {/* Lid right */}
        <path d="M100 100 L100 112 L160 112 L150 100 Z" fill="#c4b5fd"/>
        {/* Flaps */}
        <path d="M50 100 Q75 88 100 100" stroke="#c4b5fd" strokeWidth="2" fill="#ede9fe" strokeLinejoin="round"/>
        <path d="M100 100 Q125 88 150 100" stroke="#c4b5fd" strokeWidth="2" fill="#ede9fe" strokeLinejoin="round"/>
      </g>

      {/* Stars floating */}
      <text x="28" y="80" fontSize="24" style={{ animation: 'float 4s ease-in-out infinite' }} opacity="0.7">✨</text>
      <text x="154" y="72" fontSize="18" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '-1s' }} opacity="0.6">⭐</text>

      {/* Plus icon */}
      <circle cx="100" cy="80" r="24" fill="#6366f1" fillOpacity="0.15" style={{ animation: 'float 3.5s ease-in-out infinite' }}/>
      <line x1="100" y1="70" x2="100" y2="90" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90"  y1="80" x2="110" y2="80" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round"/>

      {/* Dots */}
      <circle cx="56"  cy="140" r="4" fill="#c4b5fd" fillOpacity="0.5"/>
      <circle cx="148" cy="148" r="3" fill="#a78bfa" fillOpacity="0.5"/>
    </svg>
  );
}
