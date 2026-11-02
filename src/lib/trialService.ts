import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface SubscriptionStatus {
  organizationId: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  daysRemaining: number;
  hoursRemaining: number;
  expiresAt: number;
  isExpired: boolean;
}

const TRIAL_DURATION_DAYS = 15;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function isDevOrElectron(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    navigator.userAgent.includes('Electron')
  ) {
    return true;
  }
  return false;
}

/**
 * Obtiene o inicializa el estado de suscripción/prueba gratuita a nivel de Organización en Firestore
 */
export async function getOrganizationSubscription(orgId: string): Promise<SubscriptionStatus | null> {
  if (!orgId) return null;

  const now = Date.now();

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    let expiresAt = now + TRIAL_DURATION_MS;
    let status: 'trialing' | 'active' | 'past_due' | 'canceled' = 'trialing';
    let plan: 'starter' | 'pro' | 'enterprise' = 'pro';

    if (orgSnap.exists()) {
      const data = orgSnap.data();

      // Si ya cuenta con estado de suscripción explícito
      if (data.subscriptionStatus) {
        status = data.subscriptionStatus;
      }
      if (data.plan) {
        plan = data.plan;
      }

      if (data.trialEndsAt) {
        expiresAt = typeof data.trialEndsAt === 'number'
          ? data.trialEndsAt
          : new Date(data.trialEndsAt).getTime();
      } else if (data.createdAt) {
        const createdMs = new Date(data.createdAt).getTime();
        expiresAt = createdMs + TRIAL_DURATION_MS;
      } else {
        // Inicializar trialEndsAt en la organización
        await setDoc(orgRef, {
          trialEndsAt: expiresAt,
          subscriptionStatus: 'trialing',
          plan: 'pro'
        }, { merge: true });
      }
    }

    // Si la suscripción está activa (paga), no expira
    if (status === 'active') {
      return {
        organizationId: orgId,
        plan,
        status,
        daysRemaining: 365,
        hoursRemaining: 0,
        expiresAt: now + (365 * 24 * 60 * 60 * 1000),
        isExpired: false
      };
    }

    const timeRemainingMs = expiresAt - now;
    const isExpired = timeRemainingMs <= 0 || status === 'canceled';
    const daysRemaining = Math.max(0, Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000)));
    const hoursRemaining = Math.max(0, Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));

    return {
      organizationId: orgId,
      plan,
      status,
      daysRemaining,
      hoursRemaining,
      expiresAt,
      isExpired
    };

  } catch (error) {
    console.error('[SUBSCRIPTION] Error al verificar estado de suscripción en Firestore:', error);

    // Respaldo resiliente
    return {
      organizationId: orgId,
      plan: 'pro',
      status: 'trialing',
      daysRemaining: 15,
      hoursRemaining: 0,
      expiresAt: now + TRIAL_DURATION_MS,
      isExpired: false
    };
  }
}
