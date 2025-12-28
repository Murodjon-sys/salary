#!/bin/bash
# REGOS Kunlik Savdo Tizimini O'rnatish Scripti

echo "=========================================="
echo "REGOS Kunlik Savdo Tizimini O'rnatish"
echo "=========================================="

# 1. Python3 va pip tekshiruvi
echo ""
echo "1️⃣  Python3 va pip tekshirilmoqda..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 topilmadi. O'rnatish:"
    echo "   sudo apt update && sudo apt install python3 python3-pip -y"
    exit 1
fi
echo "✅ Python3 topildi: $(python3 --version)"

# 2. requests kutubxonasini o'rnatish
echo ""
echo "2️⃣  Python requests kutubxonasi o'rnatilmoqda..."
pip3 install requests --quiet
if [ $? -eq 0 ]; then
    echo "✅ requests kutubxonasi o'rnatildi"
else
    echo "❌ requests kutubxonasini o'rnatishda xatolik"
    exit 1
fi

# 3. Reports papkasini yaratish
echo ""
echo "3️⃣  Reports papkasi yaratilmoqda..."
sudo mkdir -p /opt/reports
sudo chmod 755 /opt/reports
echo "✅ /opt/reports papkasi yaratildi"

# 4. Script faylini ko'chirish
echo ""
echo "4️⃣  Script fayli ko'chirilmoqda..."
SCRIPT_PATH="/opt/reports/regos_daily_sales.py"
sudo cp regos_daily_sales.py $SCRIPT_PATH
sudo chmod +x $SCRIPT_PATH
echo "✅ Script ko'chirildi: $SCRIPT_PATH"

# 5. REGOS_TOKEN ni .bashrc ga qo'shish
echo ""
echo "5️⃣  REGOS_TOKEN sozlanmoqda..."
read -p "REGOS API Token kiriting: " REGOS_TOKEN

if [ -z "$REGOS_TOKEN" ]; then
    echo "⚠️  Token kiritilmadi. Keyinroq qo'lda qo'shing:"
    echo "   export REGOS_TOKEN='your_token_here'"
else
    # .bashrc ga qo'shish
    if ! grep -q "REGOS_TOKEN" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# REGOS API Token" >> ~/.bashrc
        echo "export REGOS_TOKEN='$REGOS_TOKEN'" >> ~/.bashrc
        echo "✅ Token ~/.bashrc ga qo'shildi"
    else
        echo "⚠️  Token allaqachon ~/.bashrc da mavjud"
    fi
    
    # Hozirgi sessiya uchun export qilish
    export REGOS_TOKEN="$REGOS_TOKEN"
fi

# 6. Cron job qo'shish
echo ""
echo "6️⃣  Cron job sozlanmoqda..."

# Cron yozuvi
CRON_JOB="59 23 * * * export REGOS_TOKEN='$REGOS_TOKEN' && /usr/bin/python3 $SCRIPT_PATH >> /opt/reports/cron.log 2>&1"

# Mavjud cron joblarni olish
crontab -l > /tmp/current_cron 2>/dev/null || true

# Agar allaqachon mavjud bo'lmasa, qo'shish
if ! grep -q "regos_daily_sales.py" /tmp/current_cron; then
    echo "$CRON_JOB" >> /tmp/current_cron
    crontab /tmp/current_cron
    echo "✅ Cron job qo'shildi (har kuni 23:59 da)"
else
    echo "⚠️  Cron job allaqachon mavjud"
fi

rm /tmp/current_cron

# 7. Test qilish
echo ""
echo "7️⃣  Test qilish..."
read -p "Hozir test qilishni xohlaysizmi? (y/n): " TEST_NOW

if [ "$TEST_NOW" = "y" ] || [ "$TEST_NOW" = "Y" ]; then
    echo ""
    echo "🧪 Test ishga tushirilmoqda..."
    python3 $SCRIPT_PATH
    echo ""
    echo "📄 Natijalarni ko'rish:"
    echo "   ls -lh /opt/reports/"
    echo "   cat /opt/reports/cron.log"
fi

echo ""
echo "=========================================="
echo "✅ O'rnatish muvaffaqiyatli yakunlandi!"
echo "=========================================="
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. Cron jobni ko'rish: crontab -l"
echo "   2. Loglarni ko'rish: tail -f /opt/reports/cron.log"
echo "   3. Fayllarni ko'rish: ls -lh /opt/reports/"
echo "   4. Qo'lda test: python3 $SCRIPT_PATH"
echo ""
