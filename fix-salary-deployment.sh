#!/bin/bash

# Salary loyihasini to'liq deploy qilish va tuzatish skripti
# VPS da ishlatish uchun

set -e

echo "🔧 Salary loyihasini to'liq deploy qilish..."

# Loyiha papkasini aniqlash (o'zgartiring!)
PROJECT_DIR="/root/projects/YOUR_PROJECT_NAME"

# 1. Loyiha papkasiga o'tish
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Loyiha papkasi topilmadi: $PROJECT_DIR"
    echo "Iltimos, PROJECT_DIR o'zgaruvchisini to'g'ri sozlang!"
    exit 1
fi

cd "$PROJECT_DIR/salary"
echo "📁 Hozirgi papka: $(pwd)"
echo ""

# 2. Dependencies o'rnatish
echo "📦 Dependencies o'rnatilmoqda..."
npm install
echo ""

# 3. Frontend build qilish
echo "🔨 Frontend build qilinmoqda..."
npm run build
echo ""

# 4. Frontend fayllarni nginx papkasiga ko'chirish
echo "📋 Frontend fayllarni ko'chirish..."
mkdir -p /var/www/salary
rm -rf /var/www/salary/dist
cp -r dist /var/www/salary/
chown -R www-data:www-data /var/www/salary
echo "✅ Frontend fayllari ko'chirildi: /var/www/salary/dist"
echo ""

# 5. Backend ni to'xtatish
echo "🛑 Eski backend processni to'xtatish..."
pm2 delete salary-backend 2>/dev/null || true
echo ""

# 6. Backend ni ishga tushirish
echo "🚀 Backend ni ishga tushirish (PORT 3010)..."
pm2 start server/index.js --name "salary-backend" --time
pm2 save
echo ""

# 7. Nginx konfiguratsiyani ko'chirish
echo "🌐 Nginx konfiguratsiyani sozlash..."
if [ -f "$PROJECT_DIR/nginx-salary.conf" ]; then
    cp "$PROJECT_DIR/nginx-salary.conf" /etc/nginx/sites-available/salary
    ln -sf /etc/nginx/sites-available/salary /etc/nginx/sites-enabled/salary
    echo "✅ Nginx konfiguratsiya ko'chirildi"
else
    echo "⚠️  nginx-salary.conf topilmadi, o'tkazib yuborildi"
fi
echo ""

# 8. Nginx test va restart
echo "✅ Nginx test qilinmoqda..."
nginx -t
if [ $? -eq 0 ]; then
    echo "🔄 Nginx restart qilinmoqda..."
    systemctl restart nginx
    echo "✅ Nginx muvaffaqiyatli restart qilindi"
else
    echo "❌ Nginx konfiguratsiyada xato bor!"
    exit 1
fi
echo ""

# 9. Status ko'rsatish
echo "📊 Hozirgi holat:"
pm2 list
echo ""

# 10. Test qilish
echo "🧪 API test qilinmoqda..."
sleep 2
curl -s http://localhost:3010/api/branches > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API ishlayapti!"
else
    echo "❌ Backend API javob bermadi!"
    echo "Loglarni ko'ring: pm2 logs salary-backend"
fi
echo ""

echo "🎉 Deploy tugadi!"
echo ""
echo "📝 Foydali komandalar:"
echo "  - PM2 status: pm2 list"
echo "  - Backend loglar: pm2 logs salary-backend"
echo "  - Nginx loglar: tail -f /var/log/nginx/salary-error.log"
echo "  - Backend restart: pm2 restart salary-backend"
echo "  - Nginx restart: systemctl restart nginx"
