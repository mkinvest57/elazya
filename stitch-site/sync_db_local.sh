#!/bin/bash
# Helper script to sync database from local machine
# Run this after whitelisting your IP in IONOS

echo "Syncing database schema..."
npx prisma db push

echo "Done!"
