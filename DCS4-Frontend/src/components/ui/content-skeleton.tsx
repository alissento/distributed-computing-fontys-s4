import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ContentSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-9 w-24" />
      </div>
      
      {/* Main content area skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom section skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};

export default ContentSkeleton; 