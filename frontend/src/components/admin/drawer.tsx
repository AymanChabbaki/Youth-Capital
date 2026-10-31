import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const WIDTHS = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-2xl", xl: "sm:max-w-3xl" };

// Right-side panel for viewing/editing a record without leaving the table.
export function Drawer({ open, onOpenChange, title, description, headerExtra, children, footer, width = "md" }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description?: ReactNode;
  headerExtra?: ReactNode; children: ReactNode; footer?: ReactNode; width?: keyof typeof WIDTHS;
}) {
  const { isAr } = useLanguage();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isAr ? "left" : "right"}
        className={cn("flex w-full flex-col gap-0 border-border bg-card p-0", WIDTHS[width], "[&>button]:top-4 [&>button]:end-4 [&>button]:start-auto rtl:[&>button]:left-4 rtl:[&>button]:right-auto")}
      >
        <div className="shrink-0 border-b border-border px-6 py-4 pe-12">
          <SheetTitle className="text-base font-semibold text-foreground">{title}</SheetTitle>
          {description && <SheetDescription className="mt-0.5 text-xs text-muted-foreground">{description}</SheetDescription>}
          {headerExtra && <div className="mt-3">{headerExtra}</div>}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/30 px-6 py-3">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

// Centered modal for short forms (e.g. triggering a crisis).
export function Modal({ open, onOpenChange, title, description, children, footer, className }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description?: ReactNode;
  children: ReactNode; footer?: ReactNode; className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] gap-0 overflow-hidden rounded-xl border-border bg-card p-0 sm:max-w-lg", className)}>
        <div className="border-b border-border px-6 py-4">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {description && <DialogDescription className="mt-0.5 text-xs text-muted-foreground">{description}</DialogDescription>}
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/30 px-6 py-3">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
