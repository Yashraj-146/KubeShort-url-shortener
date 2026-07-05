import { cn } from "../../lib/utils";

export function Avatar({
  src,
  fallback,
  className,
}: {
  src?: string | null;
  fallback: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground",
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}
