import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface TrialStatus {
  ip: string;
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  expiresAt: number;
}

const TRIAL_DURATION_DAYS = 15;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export async function getUserIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || '127.0.0.1';
  } catch (err) {
    console.warn('[TRIAL] No se pudo obtener la IP pública, usando respaldo local:', err);
    // Respaldo con identificador guardado localmente si falla la red
    let fallbackId = localStorage.getItem('nalia_trial_fallback_id');
    if (!fallbackId) {
      fallbackId = 'ip_fallback_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('nalia_trial_fallback_id', fallbackId);
    }
    return fallbackId;
  }
}

function sanitizeIpKey(ip: string): string {
  return ip.replace(/[\.\:\/]/g, '_');
}

export async function checkOrStartTrial(): Promise<TrialStatus> {
  const ip = await getUserIp();
  const sanitizedKey = sanitizeIpKey(ip);
  const now = Date.now();

  try {
    const trialRef = doc(db, 'trial_ips', sanitizedKey);
    const docSnap = await getDoc(trialRef);

    let firstSeenAt = now;
    let expiresAt = now + TRIAL_DURATION_MS;

    if (docSnap.exists()) {
      const data = docSnap.data();
      firstSeenAt = data.firstSeenAt || now;
      expiresAt = data.expiresAt || (firstSeenAt + TRIAL_DURATION_MS);
    } else {
      // Registrar nueva IP en Firestore con periodo de 15 días
      await setDoc(trialRef, {
        ip,
        firstSeenAt,
        expiresAt,
        createdAt: new Date().toISOString()
      });
    }

    const timeRemainingMs = expiresAt - now;
    const isExpired = timeRemainingMs <= 0;
    const daysRemaining = Math.max(0, Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000)));
    const hoursRemaining = Math.max(0, Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));

    // Guardar copia local en localStorage
    localStorage.setItem('nalia_trial_expires_at', expiresAt.toString());

    return {
      ip,
      isExpired,
      daysRemaining,
      hoursRemaining,
      expiresAt
    };
  } catch (error) {
    console.error('[TRIAL] Error al verificar estado de prueba en Firestore:', error);

    // Respaldo con localStorage si Firestore falla
    const savedExpires = localStorage.getItem('nalia_trial_expires_at');
    let expiresAt = savedExpires ? parseInt(savedExpires) : (now + TRIAL_DURATION_MS);

    if (!savedExpires) {
      localStorage.setItem('nalia_trial_expires_at', expiresAt.toString());
    }

    const timeRemainingMs = expiresAt - now;
    const isExpired = timeRemainingMs <= 0;
    const daysRemaining = Math.max(0, Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000)));
    const hoursRemaining = Math.max(0, Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));

    return {
      ip,
      isExpired,
      daysRemaining,
      hoursRemaining,
      expiresAt
    };
  }
}
