"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/CountUp";

type Tone = "emerald" | "orange" | "sky" | "violet";

const TONES: Record<Tone, string> = {
  emerald: "bg-emerald-soft ring-emerald/15",
  orange: "bg-orange-soft ring-orange/15",
  sky: "bg-sky-100 ring-sky-300/30",
  violet: "bg-violet-100 ring-violet-300/30",
};

/** Carte de statistique "plateforme" : pastille (sticker illustré OU icône) + grand chiffre. */
export function StickerStat({
  sticker,
  icon,
  value,
  label,
  caption,
  tone = "emerald",
}: {
  sticker?: string;
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  caption?: string;
  tone?: Tone;
}) {
  return (
    <div className="lift flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-card">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ring-1",
          TONES[tone],
        )}
      >
        {sticker ? (
          <Image src={sticker} alt="" width={34} height={34} />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0">
        <p className="nums font-heading text-2xl font-extrabold leading-none text-ink">
          <CountUp value={value} />
        </p>
        <p className="mt-1 truncate text-sm font-medium text-ink/70">{label}</p>
        {caption && <p className="text-xs text-ink/45">{caption}</p>}
      </div>
    </div>
  );
}
