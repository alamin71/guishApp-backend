import { Subscription } from './subscription.model';
import { ISubscription } from './subscription.interface';

const create = async (payload: ISubscription) => {
  return await Subscription.create(payload);
};

const getAll = async () => {
  return await Subscription.find();
};

const update = async (id: string, payload: Partial<ISubscription>) => {
  return await Subscription.findByIdAndUpdate(id, payload, { new: true });
};

const deleteSub = async (id: string) => {
  return await Subscription.findByIdAndDelete(id);
};

export const SubscriptionService = {
  create,
  getAll,
  update,
  delete: deleteSub,
};
