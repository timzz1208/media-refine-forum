@echo off
chcp 65001 > nul
echo.
echo 正在尋找使用 8000 連接埠的展示伺服器...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  echo 停止程序 PID %%a
  taskkill /PID %%a /F
)
echo.
echo 如果上方沒有 PID，代表目前沒有展示伺服器正在執行。
pause
