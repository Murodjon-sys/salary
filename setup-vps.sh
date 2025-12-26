#!/bin/bash

# Salary Management - VPS Initial Setup Script
# Bu scriptni VPS'da birinchi marta ishga tushiring

echo "🚀 Salary Management - VPS Setup boshlandi..."

# 1. .env faylini tekshirish
if [ ! -f .env ]; then
    echo "⚠️  .env fayli topilmadi! Yaratilmoqda..."
    cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://lmurodjon556_db_user:fPv2JMKt2IbBVNt7@cluster0.e5ikopt.mongodb.net/salary-management?retryWrites=true&w=majority
PORT=3002

# Regos API
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=your_regos_api_key_here
REGOS_COMPANY_ID=your_company_id_here

# Admin Login
ADMIN_LOGIN=Nurik1111
ADMIN_PASSWORD=Nurik3335
EOF
    echo "✅ .env fayli yaratildi"
else
    echo "✅ .env fayli mavjud"
fi

# 2. Dependencies o'rnatish
echo "📦 Dependencies o'rnatish..."
npm install

# 3. Frontend build qilish
echo "🔨 Frontend build qilish..."
npm run build

# 4. PM2 processlarni to'xtatish (agar mavjud bo'lsa)
echo "🛑 Eski PM2 processlarni to'xtatish..."
pm2 delete salary-backend 2>/dev/null || true
pm2 delete salary-frontend 2>/dev/null || true

# 5. Backend ishga tushirish
echo "🚀 Backend ishga tushirish (port 3002)..."
pm2 start server/index.js --name salary-backend --update-env

# 6. Frontend ishga tushirish
echo "🚀 Frontend ishga tushirish (port 3005)..."
pm2 serve dist 3005 --name salary-frontend --spa

# 7. PM2 saqlash
echo "💾 PM2 save..."
pm2 save

# 8. Nginx konfiguratsiyasini nusxalash
echo "📝 Nginx konfiguratsiyasini sozlash..."
if [ -f nginx-salary.conf ]; then
    sudo cp nginx-salary.conf /etc/nginx/sites-available/salary
    sudo ln -sf /etc/nginx/sites-available/salary /etc/nginx/sites-enabled/
    echo "✅ Nginx konfiguratsiyasi nusxalandi"
    
    # Nginx test
    echo "🔍 Nginx konfiguratsiyasini tekshirish..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx konfiguratsiyasi to'g'ri"
        echo "🔄 Nginx reload..."
        sudo systemctl reload nginx
    else
        echo "❌ Nginx konfiguratsiyasida xato!"
    fi
else
    echo "⚠️  nginx-salary.conf fayli topilmadi"
fi

# 9. Status ko'rsatish
echo ""
echo "✅ Setup muvaffaqiyatli tugadi!"
echo ""
echo "📊 PM2 Status:"
pm2 ls | grep salary

echo ""
echo "🌐 Saytingiz: http://45.92.173.33"
echo "📊 Backend: http://45.92.173.33/api"
echo ""
echo "📝 Foydali buyruqlar:"
echo "   pm2 logs salary-backend    # Backend loglar"
echo "   pm2 logs salary-frontend   # Frontend loglar"
echo "   pm2 restart salary-backend # Backend restart"
echo "   pm2 restart salary-frontend # Frontend restart"
echo "   sudo systemctl status nginx # Nginx status"
echo "   sudo tail -f /var/log/nginx/salary-error.log # Nginx error log"
