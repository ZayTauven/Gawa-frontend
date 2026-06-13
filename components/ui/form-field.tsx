"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* Confort terrain : contrôles h-10 (cibles tactiles ≥ 40px, WCAG),
   plus généreux que le h-8 compact par défaut de shadcn. */
const COMFORT = "h-10 px-3.5 bg-white";

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
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-rose">*</span>}
      </Label>
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
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <Input
      aria-invalid={invalid || undefined}
      className={cn(COMFORT, className)}
      {...props}
    />
  );
}

/** Zone de texte multi-lignes, même grammaire de focus. */
export function Textarea({
  invalid,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <UiTextarea
      aria-invalid={invalid || undefined}
      className={cn("min-h-[88px] resize-y bg-white px-3.5", className)}
      {...props}
    />
  );
}

export type SelectOption = { value: string; label: string; disabled?: boolean };

/**
 * Select piloté par options (API historique), bâti sur le select shadcn :
 * accessible (clavier, ARIA), même grammaire de focus que les autres contrôles.
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
    <UiSelect
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(String(v)) : undefined}
      disabled={disabled}
      items={options.map((o) => ({ value: o.value, label: o.label }))}
    >
      <SelectTrigger
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(COMFORT, "w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}

/** Génère un id stable pour relier Field + contrôle quand on n'en fournit pas. */
export function useFieldId(prefix = "field") {
  const id = useId();
  return `${prefix}-${id}`;
}
