export interface SubscriptionStatus {
  organizationId: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  daysRemaining: number;
  hoursRemaining: number;
  expiresAt: number;
  isExpired: boolean;
}

export function isDevOrElectron(): boolean {
  return true;
}

/**
 * Obtiene el estado de suscripción activa permanente para la Organización
 */
export async function getOrganizationSubscription(orgId: string): Promise<SubscriptionStatus | null> {
  if (!orgId) return null;

  return {
    organizationId: orgId,
    plan: 'pro',
    status: 'active',
    daysRemaining: 365,
    hoursRemaining: 0,
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
    isExpired: false
  };
}
