import { PaymentGateway } from "./payment-gateway";

export class BankGateway implements PaymentGateway {
  async charge(amount: number, currency: string) {
    return {
      success: true,
      referenceId: "bank_ref",
    };
  }
}
