@echo off
REM === install.bat ===

echo === Installing Node.js and npm ===

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

call checknpm.bat

REM Install dependencies if node_modules does not exist
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

echo Installation completed successfully.

echo === End of install.bat ===