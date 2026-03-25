import { Card, CardContent } from "./Card";

export function SkeletonCard() {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden group border-border">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:px-8">
                    <div className="space-y-3 w-full animate-pulse">
                        <div className="flex items-center gap-3">
                            {/* Title Skeleton */}
                            <div className="h-6 bg-gray-200 rounded-md w-48"></div>
                            {/* Badge Skeleton */}
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        </div>

                        <div className="flex flex-wrap gap-5">
                            {/* Doctor Skeleton */}
                            <div className="h-5 bg-gray-200 rounded-md w-32"></div>
                            {/* Date Skeleton */}
                            <div className="h-5 bg-gray-200 rounded-md w-40"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 animate-pulse">
                        {/* Action Buttons Skeleton */}
                        <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
                        <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SkeletonDetail() {
    return (
        <Card className="shadow-lg border-border animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 bg-gray-50/50 rounded-t-xl p-6">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded-md w-64"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-48"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-full w-28"></div>
            </div>

            <div className="pt-8 px-6 sm:px-10 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-8">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div className="h-4 bg-gray-200 rounded-md w-32 mb-4"></div>
                            <div className="h-7 bg-gray-200 rounded-md w-48 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                        </div>

                        <div>
                            <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded-md w-48"></div>
                        </div>

                        <div>
                            <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                <div className="h-6 bg-gray-200 rounded-md w-40"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="h-4 bg-gray-200 rounded-md w-32 mb-3"></div>
                        <div className="h-full min-h-[150px] bg-gray-100 rounded-xl"></div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 bg-gray-200 rounded-md w-32"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-32"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-md w-36"></div>
                </div>
            </div>
        </Card>
    );
}