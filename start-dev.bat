@echo off
echo ====================================
echo Starting BMS 2025 - DEVELOPMENT MODE
echo ====================================
echo.

REM Copy development environment
copy /Y .env.development .env

echo Environment: DEVELOPMENT
echo Server will start on http://localhost:3000
echo.

npm start
