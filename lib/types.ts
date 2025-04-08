


export type DashboardData = {
    calorieIntake: string,
    fatIntake: string,
    proteinIntake: string,
    waterIntake: string,
    carbsIntake: string
}

export type DashboardContextType = {
    data: DashboardData;
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>
}
