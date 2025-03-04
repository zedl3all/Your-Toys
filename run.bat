@echo off
REM === Node.js Project Runner ===

echo === Node.js Project Runner ===

REM Check if Node.js is installed
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo Attempting to install Node.js using winget...
    winget install Schniz.fnm
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to install fnm. Please install Node.js manually.
        pause
        exit /b 1
    )
    fnm install 22
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to install Node.js using fnm. Please install Node.js manually.
        pause
        exit /b 1
    )
    echo Node.js installed successfully.
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
REM Check if package.json exists
IF NOT EXIST package.json (
    echo Warning: package.json not found. Creating a basic one.
    echo { "name": "project2", "version": "1.0.0", "description": "", "main": "index.js", "scripts": { "start": "node index.js" } } > package.json
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to create package.json.
        pause
        exit /b 1
    )
    echo package.json created successfully.
) ELSE (
    echo package.json found.
)

REM Check if node_modules exists, if not install dependencies
IF NOT EXIST node_modules\ (
    echo Installing dependencies...
    npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully.
) ELSE (
    echo Dependencies already installed.
)

REM Run the application
echo Starting application...
npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to start the application.
    pause
    exit /b 1
)

echo Application started successfully.

REM Keep the CMD window open
pause