export const StatsPreview = () => {
    return (
        <div className="bg-gray-50 pt-12 sm:pt-16 mt-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="font-ubuntu text-20 tracking-light text-matteBlack sm:text-xl">
                        This Weeks Workout Stats
                    </h2>
                </div>
            </div>

            <div className="mt-10 bg-gray-50 pb-12 sm:pb-16">
                <div className="relative">
                    <div className="absolute inset-0 h-1/2 bg-gray-50" />
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                                <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                                        Completion
                                    </dt>
                                    <dd className="order-1 text-5xl font-bold tracking-tight text-green-primary">
                                        0%
                                    </dd>
                                </div>
                                <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                                        Number of Workouts
                                    </dt>
                                    <dd className="order-1 text-5xl font-bold tracking-tight text-green-primary">
                                        0 / 7
                                    </dd>
                                </div>
                                <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                                        Calories Burned
                                    </dt>
                                    <dd className="order-1 text-5xl font-bold tracking-tight text-green-primary">
                                        0k
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
