import { PaymentGateway } from "./payment-gateway";

export class StripeGateway implements PaymentGateway {
  async charge(amount: number, currency: string) {
    return {
      success: true,
      referenceId: "stripe_ref",
    };
  }
}
