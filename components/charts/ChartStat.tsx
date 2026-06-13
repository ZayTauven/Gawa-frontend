import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

type Tone = "emerald" | "orange" | "sky" | "violet";

const TONES: Record<Tone, string> = {
  emerald: "bg-emerald-soft",
  orange: "bg-orange-soft",
  sky: "bg-sky-100",
  violet: "bg-violet-100",
};

/**
 * Carte-stat « console » : pastille illustrée + grand chiffre (+ delta) + sparkline.
 * Variante data-viz de StickerStat. Kit Craie vive.
 */
export function ChartStat({
  sticker,
  icon,
  value,
  label,
  delta,
  data,
  color = "var(--color-emerald)",
  tone = "emerald",
}: {
  sticker?: string;
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  /** Ex. « +33 pts » — affiché en émeraude à côté du chiffre. */
  delta?: string;
  data: number[];
  color?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3.5 shadow-card">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-control",
          TONES[tone],
        )}
      >
        {sticker ? <Image src={sticker} alt="" width={28} height={28} /> : icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[23px] font-extrabold leading-none tracking-tight text-ink">
          {value}
          {delta && (
            <span className="ml-1.5 align-[3px] text-[10.5px] font-extrabold text-emerald">
              {delta}
            </span>
          )}
        </p>
        <p className="mt-1.5 truncate text-xs font-semibold text-ink/60">{label}</p>
      </div>
      <Sparkline data={data} color={color} width={96} height={42} />
    </div>
  );
}
