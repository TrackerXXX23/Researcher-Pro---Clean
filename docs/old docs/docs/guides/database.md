# Researcher Pro Database Documentation

## Database Overview
Researcher Pro uses PostgreSQL as its database management system. This document provides comprehensive information about the database setup, configuration, and usage for the Researcher Pro project.

## Setup and Configuration
### Prerequisites
- PostgreSQL 14 or later
- Prisma ORM

### Local Setup Instructions
1. Install PostgreSQL:
   ```
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Create the database and user:
   ```sql
   CREATE DATABASE researcher_pro;
   CREATE USER researcher_pro_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE researcher_pro TO researcher_pro_user;
   GRANT CREATEDB TO researcher_pro_user;
   ```

3. Configure the .env file:
   ```
   DATABASE_URL="postgresql://researcher_pro_user:your_secure_password@localhost:5432/researcher_pro?schema=public"
   ```

## Schema Description
The database schema includes the following main tables:

### ProcessedData
Stores information about processed research data.

| Column            | Type     | Description                    |
|-------------------|----------|--------------------------------|
| id                | Int      | Primary Key, Auto-increment    |
| prompt            | String   | Research prompt                |
| category          | String   | Category of research           |
| clientSegment     | String   | Target client segment          |
| legalJurisdiction | String   | Applicable legal jurisdiction  |
| date              | DateTime | Date of data processing        |

### Insights
Stores structured insights derived from processed data.

| Column          | Type     | Description                         |
|-----------------|----------|-------------------------------------|
| id              | Int      | Primary Key, Auto-increment         |
| processedDataId | Int      | Foreign Key to ProcessedData        |
| analysis        | Json     | Structured analysis data            |
| date            | DateTime | Date of insight generation          |

Relationship: `Insights` has a many-to-one relationship with `ProcessedData`.

## Connection Details
Prisma is used to connect to the database. The connection string is stored in the .env file:

```
DATABASE_URL="postgresql://researcher_pro_user:your_secure_password@localhost:5432/researcher_pro?schema=public"
```

To connect to the database using Prisma in your code:

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Use prisma in your application logic
```

## Maintenance and Backup
1. Regular backups:
   ```
   pg_dump -U researcher_pro_user -d researcher_pro > backup_filename.sql
   ```

2. Restore from backup:
   ```
   psql -U researcher_pro_user -d researcher_pro < backup_filename.sql
   ```

3. Monitor database size:
   ```sql
   SELECT pg_size_pretty(pg_database_size('researcher_pro'));
   ```

## Troubleshooting Common Issues
1. Connection issues:
   - Verify PostgreSQL is running: `brew services list | grep postgresql`
   - Check .env file for correct DATABASE_URL
   - Ensure the database user has correct permissions

2. Migration failures:
   - Check if the database user has CREATEDB permission
   - Verify Prisma schema matches the current database state

3. Performance issues:
   - Analyze slow queries using PostgreSQL's EXPLAIN ANALYZE
   - Consider adding indexes to frequently queried columns

## Running Migrations and Updating Schema
To apply new migrations:
```
npx prisma migrate dev --name descriptive_migration_name
```

To apply migrations in production:
```
npx prisma migrate deploy
```

After changing the Prisma schema, always regenerate the Prisma client:
```
npx prisma generate
```

Remember to commit the new migration files to your version control system.
