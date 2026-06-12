/**
 * Professeur Hibou — mascotte Gawa (direction « Craie vive »).
 * Cartoon géométrique chaleureux ; les lunettes rondes sont la signature « prof ».
 * Porté depuis le handoff design « Direction Gawa.html ».
 */
export type HibouPose = "hello" | "cheer" | "think" | "sleep" | "neutral";

const BODY = "#0c5a41"; // --color-forest (deep)
const BODY_DARK = "#08432f"; // --color-deeper
const BELLY = "#f6efdf";
const BEAK = "#f59e0b"; // --color-orange
const EMERALD = "#17b26a";
const INK = "#142019";
const INK_FAINT = "rgba(16,41,31,0.42)";

export function Hibou({
  pose = "hello",
  size = 120,
  className,
  style,
}: {
  pose?: HibouPose;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const closed = pose === "sleep";
  const pupils =
    pose === "think"
      ? { dx: -5, dy: -5 }
      : pose === "cheer"
        ? { dx: 0, dy: -3 }
        : { dx: 0, dy: 1 };
  const leftUp = pose === "cheer";
  const rightUp = pose === "cheer" || pose === "hello";

  const wing = (side: "l" | "r", up: boolean) => {
    const x = side === "l" ? 36 : 164;
    const sign = side === "l" ? 1 : -1;
    return (
      <g transform={`translate(${x},128) rotate(${up ? sign * 130 : sign * 25})`}>
        <ellipse cx="0" cy="26" rx="17" ry="34" fill={BODY_DARK} />
      </g>
    );
  };

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 200 220"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* touffes d'oreilles */}
      <path d="M52 38 L70 18 L80 44 Z" fill={BODY} />
      <path d="M148 38 L130 18 L120 44 Z" fill={BODY} />
      {/* corps */}
      <ellipse cx="100" cy="122" rx="70" ry="84" fill={BODY} />
      {wing("l", leftUp)}
      {wing("r", rightUp)}
      {/* ventre tissé (clin d'œil à la natte) */}
      <ellipse cx="100" cy="152" rx="45" ry="48" fill={BELLY} />
      <g opacity="0.5">
        <path d="M62 138 Q 81 150, 100 138 T 138 138" stroke={BEAK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M60 156 Q 80 168, 100 156 T 140 156" stroke={EMERALD} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M64 174 Q 82 186, 100 174 T 136 174" stroke={BEAK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* yeux */}
      {closed ? (
        <g stroke={BELLY} strokeWidth="4" strokeLinecap="round">
          <path d="M58 92 Q 72 102, 86 92" fill="none" />
          <path d="M114 92 Q 128 102, 142 92" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="72" cy="90" r="25" fill="#fff" />
          <circle cx="128" cy="90" r="25" fill="#fff" />
          <circle cx={72 + pupils.dx} cy={90 + pupils.dy} r="10" fill={INK} />
          <circle cx={128 + pupils.dx} cy={90 + pupils.dy} r="10" fill={INK} />
          <circle cx={75 + pupils.dx} cy={86 + pupils.dy} r="3" fill="#fff" />
          <circle cx={131 + pupils.dx} cy={86 + pupils.dy} r="3" fill="#fff" />
        </g>
      )}
      {/* lunettes rondes de professeur — signature */}
      <g
        stroke={closed ? "rgba(246,239,223,0.55)" : INK}
        strokeWidth="3.5"
        fill="none"
        opacity={closed ? 0.6 : 0.85}
      >
        <circle cx="72" cy="90" r="29" />
        <circle cx="128" cy="90" r="29" />
        <path d="M101 88 Q 100 84, 99 88" strokeLinecap="round" />
        <path d="M43 86 L 34 80" strokeLinecap="round" />
        <path d="M157 86 L 166 80" strokeLinecap="round" />
      </g>
      {/* sourcils (réflexion) */}
      {pose === "think" && (
        <g stroke={BELLY} strokeWidth="4" strokeLinecap="round">
          <path d="M56 56 L 86 62" fill="none" />
          <path d="M144 52 L 116 60" fill="none" />
        </g>
      )}
      {/* bec */}
      <path d="M100 112 L 112 124 Q 100 136, 88 124 Z" fill={BEAK} />
      {/* pattes */}
      <ellipse cx="80" cy="205" rx="13" ry="8" fill={BEAK} />
      <ellipse cx="120" cy="205" rx="13" ry="8" fill={BEAK} />
      {/* zzz (sommeil / hors-ligne) */}
      {pose === "sleep" && (
        <g fill={INK_FAINT} style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
          <text x="158" y="40" fontSize="22">z</text>
          <text x="172" y="26" fontSize="16">z</text>
        </g>
      )}
      {/* étincelles (bravo) */}
      {pose === "cheer" && (
        <g fill={BEAK}>
          <path d="M30 52 L32.5 60 L40 62.5 L32.5 65 L30 73 L27.5 65 L20 62.5 L27.5 60 Z" />
          <path d="M172 44 L174 50 L180 52 L174 54 L172 60 L170 54 L164 52 L170 50 Z" />
        </g>
      )}
    </svg>
  );
}
