export function SkeletonCard() {
  return (
    <div className="card p-4 flex gap-4">
      <div className="skeleton h-24 w-28 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return <div className="card p-5 space-y-2">
    <div className="skeleton h-3 w-20" />
    <div className="skeleton h-8 w-28" />
  </div>;
}
