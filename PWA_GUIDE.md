# Guía de PWA para MedCore

He configurado la plataforma para que funcione como una **Aplicación Web Progresiva (PWA)** de alto rendimiento.

## Cambios realizados

1.  **Configuración de Vite**: Se añadió `vite-plugin-pwa` con un manifiesto completo (nombre, colores, iconos).
2.  **Modo Web Independiente**: Se añadió un script `npm run build:web` que genera una versión optimizada para navegadores en la carpeta `dist-web`, sin las dependencias de Electron.
3.  **Metadatos de PWA**: Se actualizaron las etiquetas en `index.html` para mejor soporte en iOS (Safe Areas, Status Bar) y navegadores modernos.
4.  **Service Worker**: Se integró el registro automático del Service Worker en `src/main.tsx`, con una validación para evitar conflictos cuando se ejecuta dentro de Electron.

## Acción Requerida

Debido a un problema de permisos en el caché de npm de este entorno, no pude completar la instalación física del plugin. Por favor, ejecuta el siguiente comando en tu terminal para finalizar la configuración:

```bash
npm install
```

Si encuentras errores de permisos (`EACCES`), intenta primero reparar tu caché de npm:

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

## Próximos Pasos

Para que la PWA sea instalable, debes colocar los iconos de la aplicación en la carpeta `public/`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png` (Opcional, pero recomendado para iPhone)
