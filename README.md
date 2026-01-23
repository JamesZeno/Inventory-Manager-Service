# Inventory Manager Service

This repository contains a full‑stack inventory management solution built with a .NET 9 backend and a React frontend.  The project is split into two main parts:

* **backend/** – A Web API written in C# that exposes CRUD endpoints for companies, warehouses, items, users, and SKU restrictions.  It uses Entity Framework Core with a SQL database for persistence and JWT authentication for secure access.
* **frontend/** – A single‑page application (SPA) built with React and CSS. It consumes the backend API and provides a user interface for managing inventory, users, and permissions.

The goal of this project is to serve as a personal reference for building a modern, full‑stack application with clean architecture, unit tests, and a simple deployment workflow.

## Getting Started

Clone the repository and navigate to the root folder:

```bash
git clone https://github.com/your-username/InventoryManagerService.git
cd InventoryManagerService
```

### Option 1: Docker (Recommended)

The project includes Docker support for easy deployment and development.

#### Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop)
* [Docker Compose](https://docs.docker.com/compose/install/)

The services will be available at:
* **API**: `http://localhost:8080` (with Swagger docs at `/swagger/index.html`)
* **Frontend**: `http://localhost:3000`


### Option 2: Local Development

#### Backend

```bash
cd backend
dotnet build
dotnet run
```

The API will be available at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be served at `http://localhost:5173`.

## Project Structure

```
InventoryManagerService.sln
├─ backend/                # .NET 9 Web API
│  ├─ Controllers/         # API controllers
│  ├─ Models/              # EF Core entities
│  ├─ Services/            # Business logic services
│  ├─ Helpers/             # Utility helpers
│  ├─ AppDbContext.cs      # EF Core DbContext
│  ├─ Program.cs           # Application entry point
│  └─ backend.csproj
├─ backend.Tests/          # Unit tests for the API
│  ├─ Controllers/         # Controller tests
│  ├─ Services/            # Service tests
│  └─ backend.Tests.csproj
├─ frontend/               # React
│  ├─ src/
│  │  ├─ components/      # Reusable UI components
│  │  ├─ pages/           # Page components
│  │  ├─ context/         # React context for auth
│  │  └─ main.jsx
│  ├─ public/              # Static assets
│  ├─ vite.config.js
│  └─ package.json
└─ README.md
```

### Prerequisites

* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* SQLite (default; can be configured to other databases)
* [Node.js](https://nodejs.org/) (v22 or newer)

### Running the API

The backend uses the default `appsettings.json` configuration.  To run in development mode:

```bash
cd backend
dotnet run
```

The API exposes the following endpoints (prefix `/api`):

| Resource | Methods | Description |
|----------|---------|-------------|
| `/companies` | GET, POST, PUT, DELETE | CRUD for companies |
| `/warehouses` | GET, POST, PUT, DELETE | CRUD for warehouses |
| `/items` | GET, POST, PUT, DELETE | CRUD for Inventory Records |
| `/allowed-skus` | GET, POST, PUT, DELETE | Manage SKUs for Items |
| `/auth` | POST | Login and obtain JWT |

### Testing

Unit tests are located in `backend.Tests`.  Run them with:

```bash
cd backend.Tests
dotnet test
```

## Contributing

Feel free to fork the repository and submit pull requests.  Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Write tests for any new functionality.
3. Ensure all tests pass: `dotnet test` for backend, `npm test` for frontend.
4. Submit a pull request with a clear description of the changes.
