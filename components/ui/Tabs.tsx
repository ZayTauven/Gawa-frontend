"use client";

import * as RTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";

/**
 * Onglets accessibles (Radix Tabs) habillés Craie vive : barre soulignée épurée,
 * onglet actif en encre + filet émeraude. Navigation clavier gérée par Radix.
 *
 * Usage :
 *   <Tabs defaultValue="a">
 *     <TabsList>
 *       <TabsTrigger value="a">Cours</TabsTrigger>
 *       <TabsTrigger value="b">Ressources</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="a">…</TabsContent>
 *   </Tabs>
 */
export const Tabs = RTabs.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof RTabs.List>) {
  return (
    <RTabs.List
      className={cn("flex items-center gap-1 border-b border-line", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof RTabs.Trigger>) {
  return (
    <RTabs.Trigger
      className={cn(
        "-mb-px border-b-2 border-transparent px-3.5 py-2.5 text-sm font-semibold text-ink/55 transition-colors hover:text-ink",
        "data-[state=active]:border-emerald data-[state=active]:text-forest",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof RTabs.Content>) {
  return (
    <RTabs.Content
      className={cn("pt-4 focus:outline-none", className)}
      {...props}
    />
  );
}
