import { IconX } from "@tabler/icons-react";
import clsx from "clsx";

export function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-3 py-1 rounded-md border-2",
        "text-sm font-medium leading-none shadow-sm transition-colors",
        "border-[var(--chip-ring)] bg-[var(--chip-bg)] text-[var(--chip-text)]",
        "hover:bg-[var(--chip-ring)] hover:text-[var(--chip-bg)]"
      )}
    >
      {label}
      <button
        onClick={onClear}
        className="ml-1 hover:opacity-75 focus-visible:outline-none"
      >
        <IconX size={14} stroke={2} />
      </button>
    </span>
  );
}
