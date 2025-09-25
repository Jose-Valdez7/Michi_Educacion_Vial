# Michi Educación Vial

Este repositorio contiene las aplicaciones **frontend** y **backend** del proyecto "Michi Educación Vial". A continuación se describe la estructura actualizada y los pasos para ejecutar cada parte.

## Estructura del repositorio

```
Michi_Educacion_Vial/
├── Backend_App_Educacion_Vial/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── child/
│   │   │   ├── game/
│   │   │   └── common/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
└── Frontend_App_Educacion_vial/
    ├── app/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── utils/
    │   └── types/
    └── package.json
```

## Backend (NestJS + Prisma)

### Requisitos previos

- Node.js 18+
- PNPM o NPM (el proyecto usa scripts de NPM)
- Base de datos configurada vía Prisma

### Instalación y ejecución

```bash
cd Backend_App_Educacion_Vial
npm install
npm run build
npm run start:dev
```

### Notas de estructura

- Los módulos están centralizados en `src/modules/`.
- Los servicios compartidos (por ejemplo `PrismaModule`, enums) viven en `src/modules/common/`.
- Los módulos que consumen `PrismaService` deben importar `PrismaModule` desde `src/modules/common/database/prisma.module`.

## Frontend (Expo / React Native)

### Requisitos previos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Instalación y ejecución

```bash
cd Frontend_App_Educacion_vial
npm install
npm start
```

### Notas de estructura

- Los imports usan alias `@/` (configurado en `tsconfig.json`).
- Los gradientes (`LinearGradient`) utilizan tuplas tipadas ( `as const` ) definidas en `src/utils/colors.ts`.
- `src/services/storageService.ts` centraliza el uso de `AsyncStorage` para modales de configuración y registro.

## Scripts útiles

| Comando | Ubicación | Descripción |
|---------|-----------|-------------|
| `npm run build` | Backend | Genera artefactos compilados en `dist/`. |
| `npm run start:dev` | Backend | Inicia NestJS en modo watch. |
| `npm start` | Frontend | Lanza Metro Bundler de Expo. |

## Próximos pasos sugeridos

- Configurar aliases de TypeScript en el backend (`@modules/*`) si se desea simplificar imports.
- Añadir pruebas automatizadas y pipelines CI para validar la estructura nueva.
- Documentar endpoints en Swagger (`/api/docs`) si no están habilitados.

## Variables de entorno

| Entorno | Archivo | Claves principales |
|---------|---------|--------------------|
| Backend | `.env` en `Backend_App_Educacion_Vial/` | `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT` |
| Frontend | `.env` o `app.config.js` en `Frontend_App_Educacion_vial/` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL` |

> Asegúrate de copiar los archivos `.env.example` (si existen) o de crear uno nuevo antes de ejecutar los proyectos.

## Migraciones y base de datos (Prisma)

```bash
cd Backend_App_Educacion_Vial
npx prisma migrate dev
npx prisma db seed   # opcional, si existe el script de seed
```

- Los esquemas y migraciones viven en `prisma/schema.prisma`.
- Ejecuta `npx prisma studio` para inspeccionar la base de datos en un navegador.

## Pruebas y linting

| Comando | Ubicación | Descripción |
|---------|-----------|-------------|
| `npm run test` | Backend | Ejecuta la suite de pruebas de NestJS (si está configurada). |
| `npm run lint` | Backend | Analiza el código con ESLint. |
| `npm run lint` | Frontend | Valida el código de React Native/Expo. |
| `npm run test` | Frontend | Ejecuta pruebas con Jest/Testing Library (si están configuradas). |

## Despliegue sugerido

1. Ejecuta `npm run build` en el backend y publica `dist/` en el servidor de tu elección (Heroku, Render, Railway, etc.).
2. Configura las variables de entorno en el proveedor remoto.
3. Para el frontend, genera un build de Expo (`expo build`) o usa Expo Go según el entorno.
4. Asegura que el backend sea accesible mediante HTTPS si la app móvil se distribuirá públicamente.

## Recursos adicionales

- Documentación de NestJS: <https://docs.nestjs.com/>
- Documentación de Prisma: <https://www.prisma.io/docs/>
- Documentación de Expo: <https://docs.expo.dev/>

---

Si actualizas la estructura o los scripts, recuerda sincronizar este README con los cambios. 
