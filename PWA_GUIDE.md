# Guía de Publicación e Instalación: Nalia MedCore

Esta guía explica cómo publicar la plataforma en **GitHub** y hacerla accesible o descargable en **cualquier computadora o dispositivo** como PWA e instalable de escritorio.

---

## 1. Subir el Código a GitHub

1. Crea un repositorio nuevo en tu cuenta de GitHub (ejemplo: `nalia-medcore`).
2. Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/nalia-medcore.git
git branch -M main
git push -u origin main
```

---

## 2. Publicar como PWA Web (Vercel / Netlify / GitHub Pages)

Para que cualquier persona pueda entrar desde una URL e instalar la PWA en su computadora o celular:

### Opción A: Vercel (Recomendada - 2 minutos)
1. Inicia sesión en [Vercel](https://vercel.com).
2. Haz clic en **"Add New Project"** e importa tu repositorio de GitHub `nalia-medcore`.
3. Configuración del Build:
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist-web`
4. Haz clic en **Deploy**.
5. ¡Listo! Vercel te dará una URL HTTPS (ejemplo: `https://nalia-medcore.vercel.app`).

### Instalación como PWA en cualquier computadora:
- Entran a la URL en Chrome, Edge o Safari.
- Hacen clic en el botón **"Instalar Nalia MedCore"** en la barra del navegador.
- La aplicación se abrirá en su propia ventana independiente con icono nativo.

---

## 3. Generar Ejecutables de Escritorio (Mac / Windows)

Si deseas ofrecer instaladores descargables (`.dmg` para Mac o `.exe` para Windows):

1. Ejecuta en tu computadora:
```bash
npm run electron:build
```
2. Los ejecutables se compilarán en la carpeta `release/`:
   - **Mac**: `Nalia MedCore-1.0.0-mac.dmg`
   - **Windows**: `Nalia MedCore-1.0.0-win.exe`
3. En tu repositorio de GitHub, ve a **Releases > Draft a new release**, sube los archivos de la carpeta `release/` y publica la release.
4. Cualquier usuario podrá descargar directamente el ejecutable e instalarlo.
