#!/bin/bash

echo "Setting up Disaster Response Platform..."

# Initialize npm in backend if not already done
cd backend
if [ ! -f "package-lock.json" ]; then
    npm install
fi

echo "Backend dependencies installed."

# Create sample data file
cat > sample-data.json << 'EOFDATA'
{
  "disasters": [
    {
      "title": "NYC Flood",
      "location_name": "Manhattan, NYC",
      "description": "Heavy flooding in Manhattan",
      "tags": ["flood", "urgent"]
    },
    {
      "title": "California Wildfire",
      "location_name": "Los Angeles, CA",
      "description": "Wildfire spreading in LA county",
      "tags": ["fire", "evacuation"]
    }
  ],
  "resources": [
    {
      "name": "Red Cross Shelter",
      "location_name": "Lower East Side, NYC",
      "type": "shelter"
    },
    {
      "name": "Emergency Food Distribution",
      "location_name": "Brooklyn, NYC",
      "type": "food"
    }
  ]
}
EOFDATA

echo "Sample data created."

cd ..
echo "Setup complete! Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Run 'cd backend && npm run dev' to start the backend"
echo "3. Open frontend/index.html in a browser"
