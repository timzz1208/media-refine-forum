@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo 自媒體精修論壇 展示伺服器
echo ==============================
echo.
echo 請確認你的電腦和學員手機連到同一個 Wi-Fi。
echo.
echo 你的電腦 IPv4 可能是：
ipconfig | findstr /i "IPv4"
echo.
echo 學員手機請打開瀏覽器，輸入：
echo http://你的IPv4:8000/
echo.
echo 例如：
echo http://192.168.x.x:8000/
echo.
echo 如果要停止展示，關掉這個黑色視窗即可。
echo.
python -m http.server 8000 --bind 0.0.0.0
pause
