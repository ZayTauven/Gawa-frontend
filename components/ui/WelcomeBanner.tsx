import Image from "next/image";
import { RingProgress } from "./RingProgress";

/** Bannière d'accueil "plateforme" : dégradé émeraude, illustration, anneau de réussite. */
export function WelcomeBanner({
  name,
  dateLabel,
  subtitle,
  ringValue,
  ringLabel,
  sticker = "/stickers/welcome.png",
}: {
  name: string;
  dateLabel: string;
  subtitle: string;
  ringValue: number;
  ringLabel: string;
  sticker?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-card p-6 text-white shadow-night sm:p-7"
      style={{
        background:
          "linear-gradient(130deg, var(--color-night) 0%, var(--color-forest) 62%, var(--color-emerald) 145%)",
      }}
    >
      {/* halo décoratif */}
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-glow), transparent)",
        }}
      />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">
            {dateLabel}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold sm:text-3xl">
            Bonjour{" "}
            <span className="relative inline-block">
              {name}
              {/* trait de craie sous le prénom — signature « tableau d'école » */}
              <svg
                viewBox="0 0 120 8"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-2 w-full text-chalk"
              >
                <path
                  d="M2 6 Q 30 2, 60 4 T 118 3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{" "}
            👋
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/75">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <RingProgress
            value={ringValue}
            color="var(--role-accent, var(--color-chalk))"
          >
            <span className="text-center leading-tight">
              <span className="block text-lg font-extrabold">
                {Math.round(ringValue)}%
              </span>
            </span>
          </RingProgress>
          <Image
            src={sticker}
            alt=""
            width={96}
            height={96}
            className="hidden h-24 w-24 object-contain sm:block"
            priority
          />
        </div>
      </div>

      <p className="relative mt-1 text-xs text-white/60">{ringLabel}</p>
    </div>
  );
}
