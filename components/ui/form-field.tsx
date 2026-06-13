import { useId } from "react";
import * as RSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Style de contrôle partagé : repos sobre, focus émeraude (bord + halo). */
const CONTROL =
  "w-full rounded-control border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-emerald focus:ring-2 focus:ring-emerald-soft disabled:cursor-not-allowed disabled:bg-soft disabled:text-ink/50";

/**
 * Champ de formulaire épuré : label + contrôle + indice/erreur.
 * Relie automatiquement label, contrôle et message d'erreur (a11y).
 */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** id du contrôle ; sinon, encapsulez le contrôle et fournissez votre propre id. */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const describedBy = error ? `${htmlFor}-err` : hint ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-rose">*</span>}
      </label>
      {children}
      {error ? (
        <p id={describedBy} role="alert" className="text-xs font-medium text-rose">
          {error}
        </p>
      ) : (
        hint && (
          <p id={describedBy} className="text-xs text-ink/50">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Input texte autonome (sans label) — combinez avec Field pour le contexte. */
export function TextInput({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(CONTROL, invalid && "border-rose focus:border-rose focus:ring-rose-soft", className)}
      aria-invalid={invalid}
      {...props}
    />
  );
}

/** Zone de texte multi-lignes, même grammaire de focus. */
export function Textarea({
  invalid,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(CONTROL, "min-h-[88px] resize-y", invalid && "border-rose focus:border-rose focus:ring-rose-soft", className)}
      aria-invalid={invalid}
      {...props}
    />
  );
}

export type SelectOption = { value: string; label: string; disabled?: boolean };

/**
 * Select avancé épuré (Radix) : accessible (clavier, ARIA), liste flottante stylée,
 * même grammaire de focus que les autres contrôles. Préférer à `<select>` natif.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Sélectionner…",
  invalid,
  disabled,
  id,
  className,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <RSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RSelect.Trigger
        id={id}
        aria-invalid={invalid}
        className={cn(
          CONTROL,
          "flex cursor-pointer items-center justify-between gap-2 text-left data-placeholder:text-ink/35",
          invalid && "border-rose focus:border-rose focus:ring-rose-soft",
          className,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown className="h-4 w-4 text-ink/40" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-card border border-line bg-white p-1 shadow-md"
        >
          <RSelect.Viewport>
            {options.map((opt) => (
              <RSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-control px-3 py-2 text-sm text-ink outline-none data-disabled:cursor-not-allowed data-disabled:text-ink/35 data-highlighted:bg-mint data-highlighted:text-forest"
              >
                <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check className="h-4 w-4 text-emerald" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}

/** Génère un id stable pour relier Field + contrôle quand on n'en fournit pas. */
export function useFieldId(prefix = "field") {
  const id = useId();
  return `${prefix}-${id}`;
}
