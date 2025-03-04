@echo off
REM === checknpm.bat ===

echo === Checking npm ===

REM Check if npm is available
WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH.
    pause
    exit /b 1
)

echo npm found:
npm --version

echo === End of checknpm.bat ===