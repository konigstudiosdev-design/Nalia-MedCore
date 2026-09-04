import { GoogleAuthProvider, signInWithPopup, linkWithPopup } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

// 'select_account' permite elegir la cuenta sin forzar el consentimiento cada vez,
// a menos que los permisos hayan sido revocados.
provider.setCustomParameters({
  prompt: 'select_account'
});

export const googleCalendarService = {
  // Conectar cuenta de Google al usuario actual
  async connectAccount() {
    if (!auth.currentUser) throw new Error("No hay usuario autenticado");

    try {
      console.log("[GOOGLE] Intentando obtener credenciales...");

      // Intentamos el flujo de inicio de sesión directo para obtener el token.
      // Si la cuenta de Google ya está asociada al usuario de Firebase, esto nos dará el token.
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        sessionStorage.setItem('google_calendar_token', token);
        return token;
      } else {
        throw new Error("Google autenticó pero no entregó un token de acceso. Asegúrese de marcar los permisos.");
      }
    } catch (error: any) {
      console.warn("[GOOGLE] Error en flujo inicial:", error.code);

      // Si el error es que la cuenta debe ser vinculada manualmente
      if (error.code === 'auth/account-exists-with-different-credential') {
        const result = await linkWithPopup(auth.currentUser, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        if (token) {
          sessionStorage.setItem('google_calendar_token', token);
          return token;
        }
      }
      throw error;
    }
  },

  // Obtener eventos reales de Google Calendar
  async fetchEvents(token: string) {
    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[GOOGLE API ERROR]", errorData);

        if (response.status === 403) {
          throw new Error("Permisos insuficientes. Al elegir tu cuenta, asegúrate de marcar la casilla para gestionar calendarios.");
        }
        throw new Error(`Google API Error (${response.status})`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error: any) {
      console.error("[FETCH EVENTS FAILED]", error);
      throw error;
    }
  },

  // Limpiar sesión de Google
  async disconnect() {
    sessionStorage.removeItem('google_calendar_token');
    // En una fase posterior podrías revocar el token vía API si es necesario
  }
};
