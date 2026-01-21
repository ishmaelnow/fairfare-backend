# PowerShell script to run the Flask backend
# This ensures the virtual environment is activated

Write-Host "Starting Flask backend..." -ForegroundColor Green

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Run the Flask app
python app.py

