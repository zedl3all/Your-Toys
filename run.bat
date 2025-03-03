@echo off
REM === Node.js Project Runner ===

echo === Node.js Project Runner ===

REM Check if Node.js is installed
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    winget install Schniz.fnm
    fnm install 22
)

echo Node.js found: 
node --version

REM Check if npm is available
WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH.
    pause
    exit /b 1
)

echo npm found:
npm --version

REM Check if package.json exists
IF NOT EXIST package.json (
    echo Warning: package.json not found. Creating a basic one.
    echo { "name": "project2", "version": "1.0.0", "description": "", "main": "index.js", "scripts": { "start": "node index.js" } } > package.json
)

REM Check if node_modules exists, if not install dependencies
IF NOT EXIST node_modules\ (
    echo Installing dependencies...
    npm install
) ELSE (
    echo Dependencies already installed.
)

REM Run the application
echo Starting application...
npm start

pause