export type BillingCycle = 'monthly' | 'yearly';

export interface ISubscription {
  title: string;
  shortDescription: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
}
