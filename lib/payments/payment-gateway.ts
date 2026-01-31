export type PaymentResult = {
  success: boolean;
  referenceId?: string;
};

export interface PaymentGateway {
  charge(amount: number, currency: string): Promise<PaymentResult>;
}
