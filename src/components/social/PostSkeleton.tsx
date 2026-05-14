export function PostSkeleton() {
  return (
    <div className="border-b border-border/60 px-4 py-3 animate-pulse">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-muted/60 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-3 w-24 rounded bg-muted/60" />
            <div className="h-3 w-16 rounded bg-muted/40" />
          </div>
          <div className="h-3 w-full rounded bg-muted/50" />
          <div className="h-3 w-4/5 rounded bg-muted/50" />
          <div className="h-3 w-2/3 rounded bg-muted/40" />
          <div className="flex gap-6 pt-2">
            <div className="h-3 w-10 rounded bg-muted/40" />
            <div className="h-3 w-10 rounded bg-muted/40" />
            <div className="h-3 w-10 rounded bg-muted/40" />
            <div className="h-3 w-10 rounded bg-muted/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 5 }: { count?: number }) {
  return <div>{Array.from({ length: count }).map((_, i) => <PostSkeleton key={i} />)}</div>;
}
