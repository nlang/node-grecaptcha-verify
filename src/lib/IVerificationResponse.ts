export interface IVerificationResponse {
    isHuman: boolean;
    score: number;
    action: string;
    errors?: string[];
}
