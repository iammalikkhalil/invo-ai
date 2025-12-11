export type UUID = string;

export interface TaxDto {
    id: UUID;
    name: string;
}

export interface UnitDto {
    id: UUID;
    name: string;
}

export interface CategoryDto {
    id: UUID;
    name: string;
}

export interface TermsDto {
    id: UUID;
    title: string;
    description?: string | null;
}

export interface PaymentInstructionDto {
    id: UUID;
    fieldsJson: string;
}

export const isValidUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim()
    );
