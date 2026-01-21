@echo off
REM Batch script to run the Flask backend
REM This ensures the virtual environment is activated

echo Starting Flask backend...

REM Activate virtual environment and run app
call venv\Scripts\activate.bat
python app.py

pause

