"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const menuContentClass =
  "z-[80] min-w-[12rem] rounded-xl border border-line bg-paper-light p-1.5 shadow-[0_12px_36px_rgb(36_33_28_/_0.14)]";

export const menuItemClass =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans text-sm text-ink outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-paper-deep";

export function MenuContent({
  children,
  align = "end",
  side = "bottom",
  sideOffset = 6,
  className,
}: {
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(menuContentClass, className)}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  disabled,
  className,
}: {
  children: ReactNode;
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(menuItemClass, className)}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="px-2.5 pb-1.5 pt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft/90">
      {children}
    </DropdownMenu.Label>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />;
}

export const Dropdown = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;
