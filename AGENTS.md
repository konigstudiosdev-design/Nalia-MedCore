# MediOS SaaS

Plataforma médica modular construida con React + Vite + Tailwind CSS + Electron.

## Desarrollo

El servidor de desarrollo de Vite corre por defecto en el puerto 8443.

- `npm run dev`: Inicia la aplicación en modo desarrollo (Vite + Electron).
- `npm run build`: Compila la aplicación para producción.
- `npm run electron:build`: Genera el ejecutable nativo.

## Archivos Clave

- `src/App.tsx` - Punto de entrada de la UI
- `src/components/` - Componentes modulares (Pacientes, Consulta, Agenda, Dashboard)
- `electron/main.ts` - Proceso principal de Electron
- `package.json` - Dependencias y scripts
- `vite.config.ts` - Configuración de compilación

## Estética y Estilos

Este proyecto utiliza **Tailwind CSS v4**. Las clases de utilidad se usan directamente en los componentes JSX.

```Vamos a hacer funcional este sistema SaaS medico```
