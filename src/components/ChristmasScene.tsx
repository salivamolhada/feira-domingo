import React from 'react';

interface TreeProps {
  className?: string;
  scale?: number;
  delayOffset?: number;
}

const BlinkingChristmasTree: React.FC<TreeProps> = ({
  className = '',
  scale = 1,
  delayOffset = 0,
}) => {
  const bulbs = [
    { cx: 50, cy: 36, color: '#ef4444', delay: 0.1 },
    { cx: 40, cy: 48, color: '#fbbf24', delay: 0.4 },
    { cx: 61, cy: 50, color: '#38bdf8', delay: 0.7 },
    { cx: 34, cy: 65, color: '#34d399', delay: 0.25 },
    { cx: 51, cy: 67, color: '#ef4444', delay: 0.85 },
    { cx: 68, cy: 66, color: '#fbbf24', delay: 0.55 },
    { cx: 28, cy: 84, color: '#38bdf8', delay: 0.35 },
    { cx: 43, cy: 86, color: '#fbbf24', delay: 0.95 },
    { cx: 58, cy: 87, color: '#ef4444', delay: 0.15 },
    { cx: 73, cy: 85, color: '#34d399', delay: 0.65 },
    { cx: 23, cy: 103, color: '#fbbf24', delay: 0.45 },
    { cx: 39, cy: 105, color: '#ef4444', delay: 0.75 },
    { cx: 54, cy: 106, color: '#38bdf8', delay: 0.2 },
    { cx: 70, cy: 104, color: '#fbbf24', delay: 0.6 },
    { cx: 80, cy: 102, color: '#ef4444', delay: 0.9 },
  ];

  return (
    <svg
      viewBox="0 0 100 132"
      className={className}
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      aria-hidden="true"
    >
      {/* Trunk */}
      <rect x="44" y="108" width="12" height="18" rx="2" fill="#4a2c18" />

      {/* Tree Tiers */}
      <polygon points="50,18 26,52 74,52" fill="#0d4a35" />
      <polygon points="50,34 20,72 80,72" fill="#0a3f2d" />
      <polygon points="50,50 14,92 86,92" fill="#083525" />
      <polygon points="50,66 8,112 92,112" fill="#062c1e" />

      {/* Soft Snow Tips on Branches */}
      <path d="M50 18 L43 28 Q50 31 57 28 Z" fill="#e2f1f8" opacity="0.7" />
      <path d="M26 52 Q35 55 43 51 L40 47 Z" fill="#e2f1f8" opacity="0.45" />
      <path d="M74 52 Q65 55 57 51 L60 47 Z" fill="#e2f1f8" opacity="0.45" />
      <path d="M14 92 Q25 96 36 91 L32 86 Z" fill="#e2f1f8" opacity="0.35" />

      {/* Warm String Wire */}
      <path
        d="M36 46 Q50 53 64 47 M28 65 Q50 74 72 64 M20 84 Q50 94 80 83 M14 103 Q50 113 86 102"
        fill="none"
        stroke="#134e3a"
        strokeWidth="1.2"
        opacity="0.75"
      />

      {/* Star on Top */}
      <g className="animate-star-pulse" style={{ transformOrigin: '50px 13px', animationDelay: `${delayOffset}s` }}>
        <circle cx="50" cy="13" r="8" fill="#fbbf24" opacity="0.28" />
        <polygon
          points="50,4 52.5,10 59,10.5 54,14.8 55.5,21 50,17.5 44.5,21 46,14.8 41,10.5 47.5,10"
          fill="#fcd34d"
          stroke="#f59e0b"
          strokeWidth="0.6"
        />
      </g>

      {/* Blinking String Lights (Pisca-Pisca) */}
      {bulbs.map((b, i) => (
        <g
          key={i}
          className="animate-bulb"
          style={{
            transformOrigin: `${b.cx}px ${b.cy}px`,
            animationDelay: `${b.delay + delayOffset}s`,
          }}
        >
          <circle cx={b.cx} cy={b.cy} r="5.2" fill={b.color} opacity="0.32" />
          <circle cx={b.cx} cy={b.cy} r="2.2" fill={b.color} />
          <circle cx={b.cx - 0.5} cy={b.cy - 0.5} r="0.8" fill="#ffffff" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
};

interface ChristmasSceneProps {
  enabled?: boolean;
}

/**
 * Unobstructed Sky Stage placed directly below the Navbar so Santa, reindeer,
 * sparkles, and dropping gifts are never clipped behind the header or covered by cards.
 */
export const ChristmasSkyStage: React.FC<ChristmasSceneProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <div
      className="relative z-10 w-full h-28 sm:h-32 overflow-hidden pointer-events-none select-none print:hidden"
      aria-hidden="true"
    >
      {/* Winter Moon in upper right */}
      <div
        className="absolute top-3 right-6 sm:right-20 w-14 h-14 sm:w-20 sm:h-20 rounded-full opacity-45"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #fef3c7 0%, #fde68a 55%, rgba(251, 191, 36, 0) 75%)',
          boxShadow: '0 0 50px rgba(253, 224, 71, 0.35)',
        }}
      />

      {/* Flying Santa Claus + Sleigh + Gift Drops + Sparkle-Emitting Reindeer */}
      <div className="absolute top-2 sm:top-3 left-0 w-[300px] sm:w-[420px] animate-santa-flight">
        <div className="relative">
          {/* Magic Golden Sparkle Trail Behind Reindeer & Sleigh (Soltando Brilhinho) */}
          <div className="absolute top-5 left-8">
            {[
              { x: 0, y: 8, delay: 0, color: '#fde047', size: 13 },
              { x: 36, y: 15, delay: 0.35, color: '#fef08a', size: 10 },
              { x: 74, y: 3, delay: 0.7, color: '#bae6fd', size: 12 },
              { x: 112, y: 16, delay: 0.2, color: '#fde047', size: 11 },
              { x: 152, y: 5, delay: 0.55, color: '#ffffff', size: 9 },
              { x: 192, y: 12, delay: 0.9, color: '#fcd34d', size: 13 },
              { x: 232, y: 4, delay: 0.45, color: '#fef08a', size: 10 },
              { x: 272, y: 14, delay: 0.15, color: '#fde047', size: 12 },
              { x: 312, y: 6, delay: 0.65, color: '#ffffff', size: 10 },
            ].map((sp, i) => (
              <svg
                key={`spark-${i}`}
                viewBox="0 0 24 24"
                className="animate-sparkle-trail"
                style={{
                  position: 'absolute',
                  left: `${sp.x}px`,
                  top: `${sp.y}px`,
                  width: `${sp.size}px`,
                  height: `${sp.size}px`,
                  animationDelay: `${sp.delay}s`,
                  filter: `drop-shadow(0 0 6px ${sp.color})`,
                }}
              >
                <path
                  d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"
                  fill={sp.color}
                />
              </svg>
            ))}
          </div>

          {/* Dropping Christmas Presents from Santa's Sleigh (Distribuindo Presentes) */}
          <div className="absolute top-12 left-14">
            {[
              { delay: 0.2, boxColor: '#dc2626', ribbonColor: '#facc15', offsetX: 0 },
              { delay: 1.4, boxColor: '#059669', ribbonColor: '#fde047', offsetX: 16 },
              { delay: 2.6, boxColor: '#2563eb', ribbonColor: '#f87171', offsetX: -10 },
            ].map((gift, idx) => (
              <svg
                key={`gift-${idx}`}
                viewBox="0 0 32 42"
                className="w-6 h-8 animate-gift-drop"
                style={{
                  position: 'absolute',
                  left: `${gift.offsetX}px`,
                  top: 0,
                  animationDelay: `${gift.delay}s`,
                }}
              >
                {/* Mini parachute */}
                <path d="M5 12 Q16 0 27 12 Z" fill="#fef3c7" opacity="0.9" />
                <line x1="6" y1="12" x2="11" y2="21" stroke="#fde68a" strokeWidth="0.9" />
                <line x1="26" y1="12" x2="21" y2="21" stroke="#fde68a" strokeWidth="0.9" />
                {/* Gift Box */}
                <rect x="8" y="21" width="16" height="14" rx="2" fill={gift.boxColor} />
                <rect x="14.5" y="21" width="3" height="14" fill={gift.ribbonColor} />
                <rect x="8" y="26.5" width="16" height="3" fill={gift.ribbonColor} />
                <circle cx="14" cy="20" r="2" fill={gift.ribbonColor} />
                <circle cx="18" cy="20" r="2" fill={gift.ribbonColor} />
              </svg>
            ))}
          </div>

          {/* Main SVG: Santa Sleigh + 3 Flying Reindeer */}
          <svg viewBox="0 0 420 110" className="w-full h-auto drop-shadow-[0_4px_12px_rgba(251,191,36,0.32)]">
            {/* Reins connecting Sleigh to Reindeer */}
            <path
              d="M115 58 Q185 68 235 52 M115 58 Q250 70 302 50 M115 58 Q310 68 368 48"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.4"
              opacity="0.75"
            />

            {/* Sleigh */}
            <g transform="translate(18, 28)">
              <path
                d="M10 56 L82 56 Q96 56 102 44"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line x1="25" y1="45" x2="25" y2="56" stroke="#f59e0b" strokeWidth="2.5" />
              <line x1="65" y1="45" x2="65" y2="56" stroke="#f59e0b" strokeWidth="2.5" />

              <ellipse cx="26" cy="30" rx="14" ry="15" fill="#92400e" />
              <rect x="20" y="12" width="11" height="8" rx="1.5" fill="#16a34a" />
              <rect x="30" y="14" width="9" height="9" rx="1.5" fill="#fbbf24" />

              <ellipse cx="52" cy="30" rx="11" ry="13" fill="#dc2626" />
              <circle cx="54" cy="14" r="6" fill="#fed7aa" />
              <path d="M48 16 Q54 27 60 16 Z" fill="#ffffff" />
              <path d="M47 11 Q54 0 62 11 Z" fill="#dc2626" />
              <rect x="47" y="10" width="15" height="3" rx="1.5" fill="#ffffff" />
              <circle cx="62" cy="6" r="2.2" fill="#ffffff" />
              <path d="M58 24 L72 16" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
              <circle cx="73" cy="15" r="2.5" fill="#ffffff" />

              <path
                d="M12 36 Q20 48 45 48 L76 48 Q90 48 92 32 L78 32 Q72 39 58 39 L34 39 Q22 39 14 28 Z"
                fill="#b91c1c"
                stroke="#fbbf24"
                strokeWidth="2"
              />
            </g>

            {/* Reindeer 3 */}
            <g transform="translate(205, 34)" className="animate-reindeer-gallop" style={{ animationDelay: '0.2s' }}>
              <ellipse cx="24" cy="24" rx="15" ry="7.5" fill="#9a5b32" />
              <path d="M34 22 L42 12 L49 13 L46 18 L39 25 Z" fill="#9a5b32" />
              <path d="M42 12 L39 3 M41 7 L36 6 M44 12 L47 4" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M13 28 L4 35 M18 29 L12 37 M31 28 L39 36 M35 27 L44 33" stroke="#7c4724" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="38" cy="21" r="2" fill="#fbbf24" />
            </g>

            {/* Reindeer 2 */}
            <g transform="translate(272, 30)" className="animate-reindeer-gallop" style={{ animationDelay: '0.05s' }}>
              <ellipse cx="24" cy="24" rx="15" ry="7.5" fill="#854d27" />
              <path d="M34 22 L42 12 L49 13 L46 18 L39 25 Z" fill="#854d27" />
              <path d="M42 12 L39 3 M41 7 L36 6 M44 12 L47 4" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M13 28 L4 35 M18 29 L12 37 M31 28 L39 36 M35 27 L44 33" stroke="#683a1b" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="38" cy="21" r="2" fill="#fbbf24" />
            </g>

            {/* Reindeer 1 (Rudolph) */}
            <g transform="translate(338, 25)" className="animate-reindeer-gallop" style={{ animationDelay: '0.35s' }}>
              <ellipse cx="24" cy="24" rx="16" ry="8" fill="#a86437" />
              <path d="M35 22 L43 11 L51 12 L48 18 L40 25 Z" fill="#a86437" />
              <path d="M43 11 L40 2 M42 6 L37 5 M45 11 L49 3" stroke="#fde68a" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M12 28 L3 36 M17 29 L11 38 M32 28 L41 36 M36 27 L46 33" stroke="#7c4724" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="52" cy="13" r="6" fill="#ef4444" opacity="0.38" />
              <circle cx="52" cy="13" r="2.6" fill="#ef4444" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export const ChristmasScene: React.FC<ChristmasSceneProps> = ({ enabled = true }) => {
  const snowflakes = React.useMemo(
    () => [
      { left: '4%', size: 4, duration: 11, delay: 0 },
      { left: '11%', size: 6, duration: 15, delay: 2.2 },
      { left: '18%', size: 3.5, duration: 13, delay: 4.5 },
      { left: '25%', size: 5, duration: 16, delay: 1.1 },
      { left: '33%', size: 4.5, duration: 12, delay: 6.0 },
      { left: '41%', size: 6, duration: 17, delay: 3.4 },
      { left: '49%', size: 3.5, duration: 14, delay: 7.8 },
      { left: '57%', size: 5.5, duration: 15.5, delay: 0.8 },
      { left: '64%', size: 4, duration: 12.5, delay: 5.1 },
      { left: '72%', size: 6, duration: 16.5, delay: 2.9 },
      { left: '80%', size: 4.5, duration: 13.5, delay: 8.2 },
      { left: '88%', size: 5, duration: 14.5, delay: 1.6 },
      { left: '94%', size: 4, duration: 11.5, delay: 4.0 },
      { left: '21%', size: 5, duration: 18, delay: 9.2 },
      { left: '67%', size: 4.5, duration: 17.5, delay: 6.5 },
    ],
    []
  );

  const skyStars = React.useMemo(
    () => [
      { top: '14%', left: '8%', size: 2.5, delay: 0.2 },
      { top: '19%', left: '22%', size: 2, delay: 1.1 },
      { top: '12%', left: '37%', size: 3, delay: 0.6 },
      { top: '22%', left: '52%', size: 2, delay: 1.5 },
      { top: '15%', left: '68%', size: 2.5, delay: 0.3 },
      { top: '20%', left: '84%', size: 3, delay: 0.9 },
      { top: '25%', left: '93%', size: 2, delay: 1.8 },
      { top: '28%', left: '14%', size: 2, delay: 0.7 },
      { top: '31%', left: '77%', size: 2.5, delay: 1.3 },
    ],
    []
  );

  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none print:hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #10382a 0%, #092219 48%, #04120d 100%)',
      }}
      aria-hidden="true"
    >
      {/* Twinkling Winter Sky Stars */}
      {skyStars.map((star, idx) => (
        <span
          key={`sky-star-${idx}`}
          className="absolute rounded-full bg-amber-100 animate-bulb"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            boxShadow: '0 0 8px rgba(253, 230, 138, 0.75)',
          }}
        />
      ))}

      {/* Falling Snowflakes */}
      {snowflakes.map((flake, idx) => (
        <span
          key={`snow-${idx}`}
          className="absolute -top-4 rounded-full bg-white/85 animate-snowfall"
          style={{
            left: flake.left,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            boxShadow: '0 0 6px rgba(255,255,255,0.65)',
          }}
        />
      ))}

      {/* Bottom Snowy Hills & Blinking Christmas Trees */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-52">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-24 sm:h-32"
        >
          <path
            d="M0,70 C240,15 480,105 720,55 C960,5 1200,90 1440,45 L1440,160 L0,160 Z"
            fill="#0d2e23"
            opacity="0.85"
          />
          <path
            d="M0,100 C320,55 620,130 920,85 C1180,45 1340,100 1440,80 L1440,160 L0,160 Z"
            fill="#dbeafe"
            opacity="0.16"
          />
        </svg>

        <div className="relative w-full h-full max-w-[1600px] mx-auto">
          <BlinkingChristmasTree
            className="absolute bottom-2 left-2 sm:left-8 w-24 sm:w-32 opacity-90"
            scale={1.05}
            delayOffset={0}
          />
          <BlinkingChristmasTree
            className="absolute bottom-1 left-20 sm:left-36 w-16 sm:w-24 opacity-80"
            scale={0.9}
            delayOffset={0.45}
          />
          <BlinkingChristmasTree
            className="absolute bottom-2 left-[32%] w-14 sm:w-20 opacity-55 hidden md:block"
            scale={0.85}
            delayOffset={0.9}
          />
          <BlinkingChristmasTree
            className="absolute bottom-2 right-[30%] w-16 sm:w-22 opacity-55 hidden md:block"
            scale={0.9}
            delayOffset={0.3}
          />
          <BlinkingChristmasTree
            className="absolute bottom-1 right-20 sm:right-36 w-20 sm:w-24 opacity-80"
            scale={0.95}
            delayOffset={0.65}
          />
          <BlinkingChristmasTree
            className="absolute bottom-2 right-2 sm:right-8 w-24 sm:w-34 opacity-90"
            scale={1.1}
            delayOffset={0.15}
          />
        </div>
      </div>
    </div>
  );
};
