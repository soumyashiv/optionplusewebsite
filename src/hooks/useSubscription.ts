import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys } from './queries';

export interface SubscriptionSummary {
  has_access: boolean;
  plan_type: 'trial' | 'weekly' | 'monthly' | 'dev' | null;
  status: 'active' | 'expired' | 'cancelled' | 'none';
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  days_remaining: number;
  hours_remaining: number;
  razorpay_customer_id: string | null;
  last_payment_date: string | null;
}

export function useSubscription() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subscription(),
    queryFn: () => api.get<SubscriptionSummary>('/api/subscription/status'),
    retry: false, // Don't retry if 403 or unauthorized
  });

  const createOrderMutation = useMutation({
    mutationFn: (plan: 'weekly' | 'monthly') => 
      api.post<Record<string, unknown>>('/api/payments/create-order', { plan }),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<SubscriptionSummary>('/api/payments/verify', payload),
    onSuccess: (data) => {
      // Instantly update the subscription cache with the activated summary
      queryClient.setQueryData(queryKeys.subscription(), data);
    },
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    createOrder: createOrderMutation.mutateAsync,
    verifyPayment: verifyPaymentMutation.mutateAsync,
  };
}
