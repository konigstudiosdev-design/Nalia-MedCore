import React from 'react';
import { SubscriptionStatus } from '../../lib/trialService';

interface TrialBannerProps {
  subscriptionStatus: SubscriptionStatus | null;
}

export function TrialBanner({ subscriptionStatus }: TrialBannerProps) {
  // Modo prueba desactivado definitivamente a solicitud del cliente
  return null;
}
