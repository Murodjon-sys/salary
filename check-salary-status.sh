#!/bin/bash

# Salary Backend statusini tekshirish skripti

echo "🔍 Salary Backend statusini tekshirish..."
echo ""

# 1. PM2 status
echo "📊 PM2 Status:"
pm2 list | grep salary-backend || echo "❌ salary-backend PM2 da topilmadi"
echo ""

# 2. Port tekshirish
echo "🔌 Port 3010 holati:"
netstat -tulpn | grep :3010 || echo "❌ Port 3010 da hech narsa ishlamayapti"
echo ""

# 3. Process tekshirish
echo "⚙️  Node.js processlar:"
ps aux | grep "server/index.js" | grep -v grep || echo "❌ server/index.js process topilmadi"
echo ""

# 4. PM2 logs (oxirgi 20 qator)
echo "📝 Oxirgi loglar:"
pm2 logs salary-backend --lines 20 --nostream 2>/dev/null || echo "❌ Loglar topilmadi"
echo ""

# 5. Nginx status
echo "🌐 Nginx holati:"
systemctl status nginx | grep "Active:" || echo "❌ Nginx holati aniqlanmadi"
echo ""

# 6. Test API request
echo "🧪 API test (GET /api/branches):"
curl -s http://localhost:3010/api/branches | head -c 100 || echo "❌ API javob bermadi"
echo ""
echo ""

echo "✅ Tekshirish tugadi!"
