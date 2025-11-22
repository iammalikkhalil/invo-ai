// Placeholder barrel for DTO typings. These should mirror backend contracts exactly.
// Add resource-specific DTOs as features are implemented.

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
