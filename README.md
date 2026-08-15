# VPS Metrics Monitor

Un panel de monitoreo en tiempo real, elegante y de alto rendimiento para rastrear y analizar las métricas vitales de tu servidor Virtual Private Server (VPS), incluyendo el uso de **CPU, Memoria, Disco y Red**. 

Construido con una arquitectura moderna utilizando **Node.js** para la recolección de datos y **React + Vite** para la visualización de la interfaz de usuario, manteniendo la comunicación bidireccional de baja latencia mediante **WebSockets**.

---

## Arquitectura del Sistema

El proyecto está dividido en dos partes principales usando un esquema de monorepositorio con *npm workspaces*:

1. **Frontend (`/frontend`)**: Una SPA (Single Page Application) construida con **React 19**, **TypeScript** y empaquetada con **Vite**. 
   - Utiliza **Socket.io-client** para recibir el flujo continuo de métricas sin necesidad de hacer polling (peticiones HTTP repetitivas).
   - Las gráficas y visualizaciones están renderizadas utilizando **Recharts**.
   - Íconos por cortesía de **Lucide React**.

2. **Backend (`/backend`)**: Un servidor de **Node.js** con **Express** y **TypeScript**.
   - Hace uso intensivo de la librería **systeminformation** para extraer datos profundos a nivel del sistema operativo.
   - Envía los datos recolectados en tiempo real al frontend a través de **Socket.io**.
   - Sirve los archivos estáticos generados por la compilación del frontend en entornos de producción.

---

## Estructura del Proyecto

```text
vps_metrics/
│
├── backend/                  # Servidor de Node.js (API y WebSockets)
│   ├── src/
│   │   ├── index.ts          # Punto de entrada del servidor
│   │   └── monitor.ts        # Lógica de recolección de métricas (systeminformation)
│   ├── package.json          # Dependencias del backend
│   └── tsconfig.json         # Configuración de TypeScript (Backend)
│
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── App.tsx           # Componente principal del Dashboard
│   │   ├── hooks/
│   │   │   └── useMetrics.ts # Custom Hook para la lógica de WebSockets
│   │   └── types.ts          # Definiciones de tipos compartidos
│   ├── package.json          # Dependencias del frontend
│   ├── vite.config.ts        # Configuración de compilación de Vite
│   └── tsconfig.json         # Configuración de TypeScript (Frontend)
│
├── Dockerfile                # Receta para contenerización del proyecto completo
├── ecosystem.config.js       # Configuración de PM2 para gestión de procesos
├── integration.md            # Roadmap de integraciones empresariales a futuro
└── package.json              # Configuración raíz (Workspaces de NPM)
```

---

## Configuración y Desarrollo Local

### Pre-requisitos
- Node.js (v18 o superior)
- NPM (v9 o superior)

### 1. Instalación de dependencias
El proyecto utiliza npm workspaces. Para instalar tanto las dependencias del root, frontend y backend de una sola vez, ejecuta desde la raíz del proyecto:
```bash
npm install
```

### 2. Entorno de Desarrollo
Dado que son dos servicios separados, necesitas levantar ambos para desarrollo local.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
La aplicación frontend por defecto se levantará en `http://localhost:5173/` y tratará de comunicarse con el backend en el puerto `3012`.

---

## Despliegue a Producción (Docker)

La manera recomendada de desplegar este proyecto en un VPS es a través de Docker. Esto asegura que el entorno de ejecución sea idéntico en cualquier máquina.

El proyecto cuenta con un `Dockerfile` optimizado y multi-etapa que hace lo siguiente:
1. Instala el gestor de procesos **PM2**.
2. Copia todo el código e instala las dependencias.
3. Transpila el código TypeScript del backend.
4. Construye los estáticos de React (`dist/`) usando Vite.
5. Inicia el servidor Node.js utilizando PM2 en modo *runtime*.

### Construir la imagen de Docker
```bash
docker build -t vps-monitor .
```

### Ejecutar el contenedor
```bash
docker run -d \
  --name vps-monitor-instance \
  -p 3012:3012 \
  -e API_KEY="tu_llave_secreta_aqui" \
  --restart unless-stopped \
  vps-monitor
```

> **NOTA SOBRE SEGURIDAD (`API_KEY`)**:  
> Al correr en producción a través de `ecosystem.config.js`, el servicio buscará una variable de entorno `API_KEY`. Si está definida, deberás utilizarla para asegurar el acceso a tus métricas.

## Roadmap y Próximos Pasos

Para una lista completa de cómo escalar este proyecto a un estándar empresarial (incluyendo Notificaciones Push, CI/CD, SSL y Testing), por favor consulta el archivo [integration.md](./integration.md) ubicado en la raíz del proyecto.

---
*Diseñado y desarrollado para control absoluto de infraestructura.*
