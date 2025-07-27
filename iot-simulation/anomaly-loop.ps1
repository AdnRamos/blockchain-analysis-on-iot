# anomaly-loop.ps1
# Executar no PowerShell (Windows)

# 0) Pré‑cria todos os containers de anomalia (sem iniciar)
$AnomServices = @(
  "sim-robotArm1-anomaly",
  "sim-robotArm2-anomaly",
  "sim-conveyor1-anomaly",
  "sim-sealer1-anomaly"
)

Write-Host "🛠️ Criando containers de anomalia (sem iniciar)..."
docker compose up -d --no-start $AnomServices

# 1) Loop de ativação/desativação
while ($true) {
  # 1a) Espera entre 60 e 300 s
  $waitSec = Get-Random -Minimum 60 -Maximum 300
  Write-Host "$(Get-Date -Format 'HH:mm:ss') → aguardando $waitSec s para próxima anomalia..."
  Start-Sleep -Seconds $waitSec

  # 1b) Escolhe ao acaso
  $idx = Get-Random -Minimum 0 -Maximum $AnomServices.Count
  $svc = $AnomServices[$idx]
  Write-Host "$(Get-Date -Format 'HH:mm:ss') → iniciando anomalia: $svc"

  # 1c) Start
  docker compose start $svc

  # 1d) Duração entre 30 e 120 s
  $anomDur = Get-Random -Minimum 30 -Maximum 120
  Write-Host "$(Get-Date -Format 'HH:mm:ss') → anomalia $svc ativa por $anomDur s"
  Start-Sleep -Seconds $anomDur

  # 1e) Stop
  Write-Host "$(Get-Date -Format 'HH:mm:ss') → parando anomalia: $svc"
  docker compose stop $svc

  Write-Host ""  # separa ciclos
}
