import Stripe from 'stripe';
import config from './index';

const stripe = new Stripe(config.stripe_secret as string, {
  apiVersion: '2023-10-16' as any,
});

export default stripe;
