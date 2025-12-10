# Backend Scripts Organization

This directory contains organized utility scripts for the hotel booking system.

## Directory Structure

```
scripts/
├── database/           # Database-related scripts
│   ├── create-admin.sql
│   ├── insert-admin.sql
│   └── migration-add-booking-fields.sql
├── cloudinary/         # Cloudinary image management
│   ├── migrate-to-cloudinary.ts
│   ├── migrate-uploads-to-cloudinary.ts
│   └── test-cloudinary.js
├── utilities/          # General utility scripts
│   ├── delete-all-rooms.ts
│   ├── restore-rooms.ts
│   ├── fix-room-images.ts
│   ├── check-images.js
│   └── show-tables.js
├── testing/           # Testing utilities
│   └── test-upload.html
└── README.md          # This file
```

## Usage

### Database Scripts
- **create-admin.sql**: Creates admin user with conflict handling
- **insert-admin.sql**: Inserts admin user directly
- **migration-add-booking-fields.sql**: Adds booking duration and cost fields

### Cloudinary Scripts
- **migrate-to-cloudinary.ts**: Migrates local images to Cloudinary with HD optimization
- **migrate-uploads-to-cloudinary.ts**: Bulk upload and migration utility
- **test-cloudinary.js**: Tests Cloudinary configuration

### Utility Scripts
- **delete-all-rooms.ts**: Safely deletes all rooms and related data
- **restore-rooms.ts**: Restores sample rooms with HD placeholder images
- **fix-room-images.ts**: Fixes and redistributes Cloudinary images
- **check-images.js**: Inspects room image data in database
- **show-tables.js**: Lists all database tables

### Testing
- **test-upload.html**: HTML interface for testing image uploads

## Running Scripts

### TypeScript Scripts
```bash
# From backend directory
npx ts-node scripts/utilities/delete-all-rooms.ts
npx ts-node scripts/cloudinary/migrate-to-cloudinary.ts
```

### JavaScript Scripts
```bash
# From backend directory
node scripts/utilities/check-images.js
node scripts/cloudinary/test-cloudinary.js
```

### SQL Scripts
```bash
# Execute via psql or your database client
psql -d your_database -f scripts/database/create-admin.sql
```

## Benefits of This Organization

1. **Clear Categorization**: Scripts are grouped by functionality
2. **Easy Discovery**: Related scripts are in the same directory
3. **Better Maintenance**: Easier to find and update scripts
4. **Documentation**: Each category has clear purpose
5. **Scalability**: Easy to add new scripts in appropriate categories