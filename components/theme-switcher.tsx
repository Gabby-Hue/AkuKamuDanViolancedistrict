"use client";

import { type ComponentProps } from "react";
import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ThemeSwitcherProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  label?: string;
};

export function ThemeSwitcher({
  className,
  label = "Toggle theme",
  disabled,
  ...props
}: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isReady = typeof resolvedTheme === "string";
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      disabled={!isReady || disabled}
      onClick={() => {
        if (!isReady) {
          return;
        }
        setTheme(isDark ? "light" : "dark");
      }}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
        className
      )}
      {...props}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          isDark && "rotate-90 scale-0 opacity-0"
        )}
      />
      <MoonStar
        className={cn(
          "absolute h-5 w-5 rotate-90 scale-0 opacity-0 transition-all",
          isDark && "rotate-0 scale-100 opacity-100"
        )}
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
