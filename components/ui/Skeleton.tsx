import { Card, CardContent } from "./Card";

/** Placeholder para lista de citas mientras se cargan datos. */
export function SkeletonCard() {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden group border-border">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:px-8">
                    <div className="space-y-3 w-full animate-pulse">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Title Skeleton */}
                            <div className="h-6 bg-gray-200 rounded-md w-32 sm:w-48"></div>
                            {/* Badge Skeleton */}
                            <div className="h-6 bg-gray-200 rounded-full w-20 sm:w-24"></div>
                        </div>

                        <div className="flex flex-wrap gap-3 sm:gap-5">
                            {/* Doctor Skeleton */}
                            <div className="h-5 bg-gray-200 rounded-md w-24 sm:w-32"></div>
                            {/* Date Skeleton */}
                            <div className="h-5 bg-gray-200 rounded-md w-32 sm:w-40"></div>
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

/** Placeholder para pantalla de detalle de una cita. */
export function SkeletonDetail() {
    return (
        <Card className="shadow-lg border-border animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 bg-gray-50/50 rounded-t-xl p-4 sm:p-6">
                <div className="space-y-2 w-full">
                    <div className="h-8 bg-gray-200 rounded-md w-full max-w-[16rem]"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-full max-w-48"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-full w-24 sm:w-28 self-start sm:self-center"></div>
            </div>

            <div className="pt-6 px-4 sm:px-10 pb-8 sm:pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-8 w-full">
                        <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100">
                            <div className="h-4 bg-gray-200 rounded-md w-full max-w-32 mb-4"></div>
                            <div className="h-7 bg-gray-200 rounded-md w-full max-w-48 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                        </div>

                        <div className="w-full">
                            <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded-md w-full max-w-48"></div>
                        </div>

                        <div className="w-full">
                            <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                                <div className="h-6 bg-gray-200 rounded-md w-full max-w-40"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full w-full">
                        <div className="h-4 bg-gray-200 rounded-md w-32 mb-3"></div>
                        <div className="h-full min-h-36 bg-gray-100 rounded-xl w-full"></div>
                    </div>
                </div>

                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-md w-full sm:w-36"></div>
                </div>
            </div>
        </Card>
    );
}