import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type Tone = "emerald" | "orange" | "sky" | "violet";

const TONES: Record<Tone, string> = {
  emerald: "bg-emerald-soft",
  orange: "bg-orange-soft",
  sky: "bg-sky-100",
  violet: "bg-violet-100",
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
    <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg",
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
        <p className="font-heading text-2xl font-extrabold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-ink/70">{label}</p>
        {caption && <p className="text-xs text-ink/45">{caption}</p>}
      </div>
    </div>
  );
}
