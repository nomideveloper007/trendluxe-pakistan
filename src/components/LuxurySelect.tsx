import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LuxurySelectOption = {
  value: string;
  label: string;
};

type LuxurySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: LuxurySelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: "default" | "sm";
};

const EMPTY = "__empty__";

function toInternal(value: string) {
  return value === "" ? EMPTY : value;
}

function fromInternal(value: string) {
  return value === EMPTY ? "" : value;
}

export function LuxurySelect({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  className,
  triggerClassName,
  contentClassName,
  size = "default",
}: LuxurySelectProps) {
  return (
    <div className={cn("w-full", className)}>
      <Select value={toInternal(value)} onValueChange={(v) => onValueChange(fromInternal(v))}>
        <SelectTrigger
          className={cn(
            "w-full border border-border bg-white text-foreground shadow-none",
            "rounded-full px-4 font-semibold outline-none transition",
            "hover:border-primary/50 focus:border-primary focus:ring-0 focus:ring-offset-0",
            "data-[state=open]:border-primary data-[state=open]:shadow-soft",
            "[&>span]:line-clamp-1 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-primary/70",
            size === "sm" ? "h-9 text-xs" : "h-10 text-xs",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className={cn(
            "z-[80] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl",
            "border border-[#F8BBD0]/55 bg-white p-1.5 text-foreground shadow-elegant",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            contentClassName,
          )}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value === "" ? EMPTY : opt.value}
              value={toInternal(opt.value)}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium outline-none",
                "focus:bg-[#FFF5F8] focus:text-primary",
                "data-[state=checked]:bg-primary/10 data-[state=checked]:font-semibold data-[state=checked]:text-primary",
              )}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
