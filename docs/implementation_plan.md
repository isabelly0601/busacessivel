# Implementation Plan: Docker Provisioning

This plan aims to fully provision the BusAcessível project using Docker, ensuring that the backend (Fastify/Prisma), frontend (Next.js), and database (PostgreSQL) are correctly configured and can communicate with each other.

## Proposed Changes

### Root Configuration
#### [MODIFY] [docker-compose.yml](file:///c:/Users/Dev2/Documents/projetos/busacessivel/docker-compose.yml)
- Ensure environment variables are correctly set for service communication.
- Add a healthcheck for the database to ensure the backend waits for it.

### Git Repository
#### [MODIFY] [.gitignore](file:///c:/Users/Dev2/Documents/projetos/busacessivel/.gitignore)
- Ensure all environment files and build artifacts are ignored.
- Add specific patterns for Prisma and Docker logs if missing.

#### [INITIALIZE] Git Repository
- Add all files to the staging area.
- Create an initial commit with the message "feat: initial provision and project structure".

### Admin Panel (Refactoring & New Feature)
#### [NEW] [Admin Dashboard Structure](file:///c:/Users/Dev2/Documents/projetos/busacessivel/frontend/app/admin)
- **Nested Routing Strategy**: Create a folder structure for `/admin` that supports dynamic routes for each tab.
- **Lazy Loading**: Use Next.js natural route-based splitting to load tab content only when active.
- **Modular Components**:
    - `app/admin/layout.tsx`: For shared navigation and header.
    - `app/admin/dashboard/page.tsx`: Main overview tab.
    - `app/admin/frota/page.tsx`: Fleet management tab.
    - `app/admin/pontos/page.tsx`: Bus stop management tab.

### Backend
#### [MODIFY] [Dockerfile](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/Dockerfile)
- Add a script to run `npx prisma generate` and `npx prisma migrate dev` (or `db push`) before starting the server.
- Alternatively, use a `docker-compose` command override to handle this.

#### [NEW] [entrypoint.sh](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/entrypoint.sh)
- A shell script to wait for the DB, run Prisma commands, and start the app.

## Verification Plan

### Automated Tests
- Run `docker-compose up -d --build` and check if all containers are healthy.
- Check backend logs: `docker-compose logs backend` should show the Fastify server started.
- Check frontend logs: `docker-compose logs frontend` should show the Next.js dev server started.

### Manual Verification
- Access `http://localhost:3000` (Frontend) in the browser.
- Access `http://localhost:3001/health` (Backend health check if it exists) or a known route.
- Verify DB connection by checking if Prisma can list tables or if the seed was successful.
