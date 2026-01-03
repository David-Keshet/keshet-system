@echo off
echo ====================================
echo Building BMS 2025 - PRODUCTION MODE
echo ====================================
echo.

REM Copy production environment
copy /Y .env.production .env

echo Environment: PRODUCTION
echo Building optimized production version...
echo.

npm run build

echo.
echo ====================================
echo Build completed!
echo Files are in the 'build' folder
echo ====================================
