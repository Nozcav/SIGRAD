# SIGRAD
SIGRAD es una plataforma para gestionar formularios académicos, respuestas, grupos de estudiantes, retroalimentación docente y calificaciones.

## Requisitos

- Node.js 20 LTS o posterior y npm.
- PostgreSQL en ejecución.
- PowerShell en Windows para el script de desarrollo del backend.

## Configuración inicial

1. Crea una base de datos PostgreSQL vacía para SIGRAD.
2. Copia `backend/.env.example` a `backend/.env` y configura `DATABASE_URL`, `JWT_SECRET` y los datos del administrador inicial. No compartas ni subas `backend/.env`.
3. Si la API no estará en `http://localhost:4000/api`, define `VITE_API_URL` en `frontend/.env` con la URL correcta.
4. Instala y prepara las dependencias desde la raíz:

   ```powershell
   npm --prefix backend ci
   npm --prefix frontend ci
   npm --prefix backend run prisma:generate
   npm --prefix backend run prisma:migrate:deploy
   npm --prefix backend run prisma:seed
   ```

El seed crea o habilita el administrador indicado en las variables `ADMIN_*` de `backend/.env`; el administrador debe cambiar su contraseña temporal en el primer acceso.

## Desarrollo local

Inicia cada aplicación en una terminal independiente desde la raíz:

```powershell
npm --prefix backend run dev
```

```powershell
npm --prefix frontend run dev -- --host 127.0.0.1
```

Abre <http://localhost:5173/>. La API escucha en el puerto `4000` por defecto y su comprobación de salud está en `/api/health`.

## Compilación

```powershell
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix backend test
```

Para desplegar, configura primero `backend/.env` para el entorno de producción y ejecuta `npm --prefix backend run deploy`. El script instala dependencias si hace falta, genera Prisma, compila ambas aplicaciones y aplica las migraciones.

## Flujos principales

- El administrador crea cuentas institucionales; cada cuenta nueva debe cambiar la contraseña temporal antes de usar las funciones del sistema.
- El docente crea formularios, comparte su código, revisa respuestas y organiza en grupos a los estudiantes que ya respondieron.
- Cada grupo puede tener una rúbrica de hasta 20 criterios. Los porcentajes deben sumar exactamente 100%; la nota de cada criterio va de `0,0` a `5,0` en pasos de `0,1`.
- SIGRAD calcula la nota ponderada sobre `5,0`. Al completarse o cambiar la nota final, el estudiante recibe una notificación en el panel y puede consultar el detalle en su respuesta.
- Las notificaciones y los comentarios son internos a la plataforma; el proyecto no envía correos electrónicos.

Las migraciones versionadas de PostgreSQL se encuentran en `backend/prisma/migrations`.
