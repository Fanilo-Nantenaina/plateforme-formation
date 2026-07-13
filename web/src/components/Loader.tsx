export function Loader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
