#!/bin/bash

# Salary Management - VPS Deploy Script
# Bu scriptni VPS'da /var/www/salary papkasida ishga tushiring

echo "🚀 Salary Management - Deploy boshlandi..."

# 1. Git pull (yangilanishlarni olish)
echo "📥 Git pull..."
git pull origin main

# 2. Dependencies o'rnatish
echo "📦 Dependencies o'rnatish..."
npm install

# 3. Frontend build qilish
echo "🔨 Frontend build qilish..."
npm run build

# 4. PM2 processlarni restart qilish
echo "🔄 PM2 restart..."
pm2 restart salary-backend --update-env
pm2 restart salary-frontend

# 5. PM2 saqlash
echo "💾 PM2 save..."
pm2 save

# 6. Nginx reload
echo "🔄 Nginx reload..."
sudo systemctl reload nginx

# 7. Status tekshirish
echo "✅ Status tekshirish..."
pm2 ls | grep salary

echo ""
echo "✅ Deploy muvaffaqiyatli tugadi!"
echo ""
echo "🌐 Saytingiz: http://45.92.173.33"
echo "📊 Backend: http://45.92.173.33/api"
echo ""
echo "📝 Loglarni ko'rish:"
echo "   pm2 logs salary-backend"
echo "   pm2 logs salary-frontend"
echo "   sudo tail -f /var/log/nginx/salary-error.log"
