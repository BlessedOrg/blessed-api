export const LoadingDashboardSkeleton = () => {
  return (
    <div role="status" className="animate-pulse w-full">
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <div className="h-[6.25rem] bg-gray-400 rounded-3xl w-full mb-4"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
