#!/bin/bash

# Test API endpoints
API_URL="http://localhost:5000/api"

echo "Testing Disaster Response API..."

# Test health check
echo "1. Testing health check..."
curl -s $API_URL/../health | jq .

# Test creating a disaster
echo -e "\n2. Creating a disaster..."
curl -s -X POST $API_URL/disasters \
  -H "Content-Type: application/json" \
  -H "X-User-Id: netrunnerX" \
  -d '{
    "title": "Test Flood",
    "location_name": "Manhattan, NYC",
    "description": "Test flood description",
    "tags": ["flood", "test"]
  }' | jq .

# Test getting disasters
echo -e "\n3. Getting all disasters..."
curl -s $API_URL/disasters | jq .

echo -e "\nAPI tests complete!"
