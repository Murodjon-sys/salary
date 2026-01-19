#!/bin/bash

# Salary Backend ni ishga tushirish skripti
# VPS da ishlatish uchun

set -e

echo "🚀 Salary Backend ni ishga tushirish..."

# 1. Loyiha papkasiga o'tish
cd /root/projects/YOUR_PROJECT_NAME/salary

# 2. .env faylini tekshirish
if [ ! -f ".env" ]; then
    echo "❌ .env fayl topilmadi!"
    echo "Iltimos, .env faylini yarating va kerakli ma'lumotlarni kiriting."
    exit 1
fi

# 3. Dependencies o'rnatilganligini tekshirish
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies o'rnatilmoqda..."
    npm install
fi

# 4. Eski PM2 processni to'xtatish
echo "🛑 Eski processni to'xtatish..."
pm2 delete salary-backend 2>/dev/null || true

# 5. Backend ni ishga tushirish
echo "✅ Backend ni ishga tushirish (PORT 3010)..."
pm2 start server/index.js --name "salary-backend" --time

# 6. PM2 ni saqlash
pm2 save

# 7. Status ko'rsatish
echo ""
echo "✅ Salary Backend muvaffaqiyatli ishga tushirildi!"
echo ""
pm2 list
echo ""
echo "📊 Loglarni ko'rish uchun: pm2 logs salary-backend"
echo "🔄 Restart qilish uchun: pm2 restart salary-backend"
echo "🛑 To'xtatish uchun: pm2 stop salary-backend"
