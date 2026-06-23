"use client";

import { useState } from "react";
import { Menu } from "@base-ui/react/menu";
import { LuPlus, LuX } from "react-icons/lu";

import {
  CollectSheet,
  METHODS,
  type Method,
} from "@/components/passport/collect-sheet";

/**
 * The "Collect" action as a speed-dial. Built on Base UI's Menu (the same
 * primitive `ui/menu` wraps) so it gets the backdrop, positioning, focus and
 * flicker-free enter/exit for free — but each option is its own floating pill,
 * right-aligned above the button, over a see-through dimmed page. The pill flips
 * to an ✕ to fold them away. Picking one opens its step screen (CollectSheet).
 */
// Hidden for now (the flows still exist; just not offered yet).
const HIDDEN: Method[] = ["nearby", "nfc"];
const VISIBLE_METHODS = METHODS.filter((m) => !HIDDEN.includes(m.id));

export function CollectFab() {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 mx-auto flex w-full max-w-md justify-end px-4">
        <Menu.Root open={open} onOpenChange={setOpen}>
          <Menu.Trigger className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)] outline-none transition-colors hover:bg-primary/90 active:translate-y-px">
            {open ? (
              <LuX className="size-4" aria-hidden />
            ) : (
              <LuPlus className="size-4" aria-hidden />
            )}
            {open ? "Close" : "Collect"}
          </Menu.Trigger>

          <Menu.Portal>
            <Menu.Backdrop className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <Menu.Positioner
              side="top"
              align="end"
              sideOffset={14}
              className="z-50"
            >
              <Menu.Popup className="flex origin-(--transform-origin) flex-col items-end gap-2.5 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                {VISIBLE_METHODS.map((m) => (
                  <Menu.Item
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="flex cursor-default items-center gap-3 rounded-full bg-card py-1.5 pl-5 pr-1.5 text-[13.5px] font-semibold text-foreground shadow-[0_10px_24px_-12px_rgba(15,23,42,0.45)] ring-1 ring-border outline-none transition-colors select-none data-highlighted:bg-muted"
                  >
                    {m.label}
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                      <m.Icon className="size-[18px]" aria-hidden />
                    </span>
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      <CollectSheet method={method} onClose={() => setMethod(null)} />
    </>
  );
}
