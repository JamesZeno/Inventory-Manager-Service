# Database Configuration Guide

The Inventory Manager Service supports multiple database providers. Configure your preferred database in `appsettings.json`.

## Supported Databases

### 1. **SQLite** (Default)
Best for: Development, prototyping, small-scale applications

**appsettings.json:**
```json
{
  "DatabaseProvider": "Sqlite",
  "ConnectionStrings": {
    "DataBase": "Data Source=inventory.db"
  }
}
```

### 2. **SQL Server**
Best for: Enterprise environments, Windows-based systems

**appsettings.json:**
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DataBase": "Server=localhost;Database=InventoryDB;Trusted_Connection=true;"
  }
}
```

Or with authentication:
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DataBase": "Server=localhost;Database=InventoryDB;User Id=sa;Password=YourPassword;"
  }
}
```

### 3. **PostgreSQL**
Best for: Open-source environments, cloud deployments (AWS RDS, Azure Database)

**appsettings.json:**
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DataBase": "Host=localhost;Port=5432;Database=inventory_db;Username=postgres;Password=YourPassword"
  }
}
```

### 4. **MySQL**
Best for: Web hosting environments, open-source deployments (AWS RDS, Azure Database)

**appsettings.json:**
```json
{
  "DatabaseProvider": "MySQL",
  "ConnectionStrings": {
    "DataBase": "Server=localhost;Port=3306;Database=inventory_db;User Id=root;Password=YourPassword;"
  }
}
```

## Configuration Steps

1. **Choose your database provider** and set `DatabaseProvider` in `appsettings.json`
2. **Provide the connection string** appropriate for your database
3. **Install dependencies** (if not already installed via NuGet):
   - SQL Server: `Microsoft.EntityFrameworkCore.SqlServer`
   - PostgreSQL: `Npgsql.EntityFrameworkCore.PostgreSQL`
   - MySQL: `Pomelo.EntityFrameworkCore.MySql`
4. **Run the application** - the database and tables will be created automatically via `EnsureCreated()`

## Environment-Specific Configuration

You can use different databases for different environments by creating environment-specific `appsettings` files:

- `appsettings.json` - Production
- `appsettings.Development.json` - Development
- `appsettings.Production.json` - Explicit production
- `appsettings.Testing.json` - Testing (uses in-memory database automatically)

## Example: Production SQL Server Setup

**appsettings.Production.json:**
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DataBase": "Server=my-production-server.database.windows.net;Database=InventoryDB;User Id=admin;Password=SecurePassword123;"
  },
  "Jwt": {
    "Key": "YourSecureJWTKeyHere",
    "Issuer": "inventory-service"
  }
}
```

## Migration Notes

- Current implementation uses `Database.EnsureCreated()` for automatic schema creation
- For production environments with data, consider using Entity Framework Migrations instead:
  ```bash
  dotnet ef migrations add InitialCreate
  dotnet ef database update
  ```

## Troubleshooting

**Connection refused:**
- Verify the database server is running
- Check the connection string format for your database type
- Ensure network connectivity and firewall rules

**Database creation failed:**
- Check user permissions for database creation
- Verify the connection string syntax
- Review application logs for specific error messages
