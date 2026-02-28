#!/bin/bash
# Check if your IP is blocked by IONOS Firewall

echo "--- Checking Network ---"
MY_IP=$(curl -s ifconfig.me)

if [ -z "$MY_IP" ]; then
    echo "Could not fetch your IP. Are you online?"
    exit 1
fi

echo "✅ Your Public IP is: $MY_IP"
echo ""
echo "--- Testing Database Connection (Port 3306) ---"
echo "Target: db5019545004.hosting-data.io"

# Try to connect (timeout 5s)
nc -zv -w 5 db5019545004.hosting-data.io 3306 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CONNECTION SUCCESSFUL!"
    echo "You can run: npx prisma db push"
else
    echo ""
    echo "❌ CONNECTION FAILED (BLOCKED)"
    echo "ACTION REQUIRED:"
    echo "1. Go to IONOS Dashboard -> Hosting -> Databases."
    echo "2. Find database: 'dbs15269470'"
    echo "3. Look for 'External Access' or 'Remote Access'."
    echo "4. Add this IP to the whitelist: $MY_IP"
    echo "5. Wait 1 minute and run this script again."
fi
