import { IconLoader2 } from "@tabler/icons-react";

export function Spinner({ className = "w-8 h-8 text-primary" }: { className?: string }) {
  return (
    <IconLoader2 className={`animate-spin ${className}`} />
  );
}
