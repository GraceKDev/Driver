"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  FolderPlus,
  HardDrive,
  LogOut,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { StorageMeter } from "@/components/drive/storage-meter";
import {
  Dropdown,
  DropdownTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { TRASH_HREF, driveHref, getInitials } from "@/lib/format";
import type { StorageDto, UserDto } from "@/lib/types";

export type DriveView = "drive" | "trash";

function NewMenu({
  compact,
  onNewFolder,
  onUpload,
}: {
  compact?: boolean;
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="marker"
          size={compact ? "sm" : "md"}
          className={compact ? "px-3" : "w-full justify-between"}
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus aria-hidden="true" className="h-4 w-4" />
            New
          </span>
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 opacity-75" />
        </Button>
      </DropdownTrigger>
      <MenuContent align="start" className="min-w-[13rem]">
        <MenuLabel>Create</MenuLabel>
        <MenuItem onSelect={onNewFolder}>
          <FolderPlus aria-hidden="true" className="h-4 w-4" />
          New folder
        </MenuItem>
        <MenuItem onSelect={onUpload}>
          <Upload aria-hidden="true" className="h-4 w-4" />
          Upload files
        </MenuItem>
      </MenuContent>
    </Dropdown>
  );
}

function UserMenu({
  user,
  compact,
  side,
}: {
  user: UserDto;
  compact?: boolean;
  side: "top" | "bottom";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/sign-in");
      router.refresh();
    },
  });

  if (compact) {
    return (
      <Dropdown>
        <DropdownTrigger asChild>
          <button
            type="button"
            aria-label={`Account menu for ${user.displayName}`}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-manila text-[11px] font-semibold text-ink hover:border-ink/25 hover:bg-sticky/70"
          >
            {getInitials(user.displayName)}
          </button>
        </DropdownTrigger>
        <MenuContent align="end" side="bottom">
          <MenuLabel>
            <span className="block max-w-[12rem] truncate normal-case tracking-normal">
              {user.displayName}
            </span>
            <span className="mt-0.5 block max-w-[12rem] truncate text-[9px] normal-case tracking-normal text-ink-soft/90">
              {user.email}
            </span>
          </MenuLabel>
          <MenuSeparator />
          <MenuItem
            onSelect={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-marker data-[highlighted]:bg-accent-soft"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {logout.isPending ? "Signing out…" : "Log out"}
          </MenuItem>
        </MenuContent>
      </Dropdown>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${user.displayName}`}
          className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-paper-light p-2 text-left hover:border-ink/20 hover:bg-paper"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-manila text-xs font-semibold text-ink"
          >
            {getInitials(user.displayName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-sans text-[13px] font-semibold text-ink">
              {user.displayName}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-ink-soft/90">
              {user.email}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-ink-soft/90"
          />
        </button>
      </DropdownTrigger>
      <MenuContent align="start" side={side}>
        <MenuLabel>Signed in as</MenuLabel>
        <div className="px-2.5 pb-2">
          <p className="truncate font-sans text-sm font-semibold text-ink">
            {user.displayName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-ink-soft/90">
            {user.email}
          </p>
        </div>
        <MenuSeparator />
        <MenuItem
          onSelect={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-marker data-[highlighted]:bg-accent-soft"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {logout.isPending ? "Signing out…" : "Log out"}
        </MenuItem>
      </MenuContent>
    </Dropdown>
  );
}

function NavLinks({
  view,
  compact,
  onNavigate,
}: {
  view: DriveView;
  compact?: boolean;
  onNavigate: () => void;
}) {
  const items = [
    {
      href: driveHref(null),
      label: "My Drive",
      icon: HardDrive,
      active: view === "drive",
    },
    {
      href: TRASH_HREF,
      label: "Trash",
      icon: Trash2,
      active: view === "trash",
    },
  ];

  return (
    <nav
      aria-label="Drive sections"
      className={compact ? "flex gap-2" : "space-y-1"}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg font-sans text-sm",
              compact ? "px-3 py-1.5" : "px-3 py-2.5",
              item.active
                ? "bg-accent-soft font-semibold text-marker"
                : "font-medium text-ink-soft hover:bg-paper hover:text-ink",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  user,
  storage,
  view,
  onNewFolder,
  onUpload,
  onNavigate,
}: {
  user: UserDto;
  storage: StorageDto;
  view: DriveView;
  onNewFolder: () => void;
  onUpload: () => void;
  onNavigate: () => void;
}) {
  return (
    <>
      <aside className="scroll-slim fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col overflow-y-auto border-r border-line bg-paper-light/85 px-3.5 pb-4 pt-5 lg:flex">
        <div className="px-1">
          <Logo href="/drive" />
        </div>

        <div className="mt-6">
          <NewMenu onNewFolder={onNewFolder} onUpload={onUpload} />
        </div>

        <div className="mt-7">
          <p className="mb-2 px-2 font-sans text-xs font-medium text-ink-soft/90">
            Workspace
          </p>
          <NavLinks view={view} onNavigate={onNavigate} />
        </div>

        <div className="mt-6 rounded-xl border border-line bg-paper p-3.5">
          <StorageMeter storage={storage} compact />
        </div>

        <div className="mt-auto space-y-3 pt-5">
          <UserMenu user={user} side="top" />
          <p className="text-center font-mono text-[8px] uppercase tracking-[0.16em] text-ink-soft/90">
            A local-first drive
          </p>
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-paper/95 px-3 py-2.5">
          <Logo href="/drive" compact showTagline={false} />
          <div className="flex items-center gap-1.5">
            <NewMenu compact onNewFolder={onNewFolder} onUpload={onUpload} />
            <UserMenu user={user} compact side="bottom" />
          </div>
        </div>
        <div className="border-b border-line bg-paper-light px-3 py-2">
          <NavLinks view={view} compact onNavigate={onNavigate} />
        </div>
      </div>
    </>
  );
}
