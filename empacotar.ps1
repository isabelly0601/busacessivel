# Script de Empacotamento BusAcessível
# Executar no diretório raiz do projeto

Write-Host "--- Iniciando Empacotamento BusAcessível ---" -ForegroundColor Cyan

# 1. Backend Setup
Write-Host "1. Configurando Backend..." -ForegroundColor Yellow
cd backend
npm.cmd install
cd ..

# 2. Frontend Setup & Build
Write-Host "2. Compilando Frontend (Next.js Export)..." -ForegroundColor Yellow
cd frontend
npm.cmd install
npm.cmd run build

# 3. Capacitor Sync
Write-Host "3. Sincronizando Capacitor para dispositivos móveis..." -ForegroundColor Yellow
npx.cmd cap sync

# 4. Play Store Build (Android App Bundle)
Write-Host "4. Gerando Build para Play Store (AAB)..." -ForegroundColor Cyan
Write-Host "Para gerar o arquivo .aab para a Play Store, execute:" -ForegroundColor White
Write-Host "  cd frontend"
Write-Host "  npx cap build android --androidreleasetype bundle"

Write-Host "`n--- Instruções de Acessibilidade ---" -ForegroundColor Yellow
Write-Host "O novo sistema de Guia por Voz foi integrado ao frontend." -ForegroundColor White
Write-Host "As cores foram atualizadas para o padrão Premium (Gold/Midnight Blue) para melhor contraste."

Write-Host "`n--- APIs Disponíveis ---" -ForegroundColor Green
Write-Host "API de SMS: http://localhost:3001/api/sms"
Write-Host "API de APK: http://localhost:3001/api/app/download-apk"

Write-Host "`n--- FIM ---" -ForegroundColor Green

cd ..
