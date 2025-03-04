@echo off
REM === run.bat ===

echo === Running Node.js Project ===

REM Call install.bat to set up the environment
call install.bat
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to set up the environment.
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

REM Run the application
echo Starting application...
npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to start the application.
    pause
    exit /b 1
)

echo Application started successfully.
pause