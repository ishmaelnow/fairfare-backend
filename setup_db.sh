#!/bin/bash
# Bash script to set up PostgreSQL database for macOS/Linux

echo "Setting up PostgreSQL database..."

# Database configuration
DB_NAME="ride_app_db"
DB_USER="postgres"

echo "Creating database: $DB_NAME"

# Create database
createdb -U $DB_USER $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Database created successfully!"
else
    echo "Database might already exist or there was an error."
    echo "You can manually create it with: createdb -U $DB_USER $DB_NAME"
fi

echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Update DATABASE_URL in .env with your PostgreSQL credentials"
echo "3. Run: python app.py"

