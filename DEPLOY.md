# Salary Management - VPS Deploy Qo'llanma

## Port Konfiguratsiyasi

- **Backend API:** Port 3002
- **Frontend:** Port 3005
- **Nginx:** Port 80 (HTTP)
- **Public URL:** http://45.92.173.33

## Birinchi Marta Deploy (Initial Setup)

### 1. VPS'ga ulanish
```bash
ssh root@45.92.173.33
```

### 2. Papka yaratish va clone qilish
```bash
# Salary papkasini yaratish
mkdir -p /var/www/salary
cd /var/www/salary

# GitHub'dan clone qilish
git clone https://github.com/Murodjon-sys/alibobo.git .
```

### 3. Setup scriptni ishga tushirish
```bash
# Scriptga ruxsat berish
chmod +x setup-vps.sh

# Setup ishga tushirish
./setup-vps.sh
```

Bu script avtomatik ravishda:
- ✅ .env faylini yaratadi
- ✅ Dependencies o'rnatadi
- ✅ Frontend build qiladi
- ✅ PM2 da backend va frontend ishga tushiradi
- ✅ Nginx konfiguratsiyasini sozlaydi

### 4. Tekshirish
```bash
# PM2 statusini ko'rish
pm2 ls

# Backend loglarini ko'rish
pm2 logs salary-backend --lines 50

# Frontend loglarini ko'rish
pm2 logs salary-frontend --lines 50

# Nginx statusini ko'rish
sudo systemctl status nginx
```

### 5. Saytni ochish
Brauzerda: http://45.92.173.33

## Yangilanishlarni Deploy Qilish

Har safar GitHub'ga push qilganingizdan keyin:

```bash
# VPS'ga ulanish
ssh root@45.92.173.33

# Salary papkasiga kirish
cd /var/www/salary

# Deploy scriptni ishga tushirish
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Yoki qo'lda:

```bash
# 1. Git pull
git pull origin main

# 2. Dependencies yangilash
npm install

# 3. Frontend rebuild
npm run build

# 4. PM2 restart
pm2 restart salary-backend --update-env
pm2 restart salary-frontend

# 5. PM2 save
pm2 save

# 6. Nginx reload
sudo systemctl reload nginx
```

## Muammolarni Hal Qilish

### Backend ishlamasa:

```bash
# Loglarni ko'rish
pm2 logs salary-backend --lines 100

# Port 3002 band bo'lsa
sudo lsof -i :3002

# Restart
pm2 restart salary-backend --update-env

# Agar hali ham ishlamasa, delete va qayta start
pm2 delete salary-backend
pm2 start server/index.js --name salary-backend --update-env
pm2 save
```

### Frontend ishlamasa:

```bash
# Loglarni ko'rish
pm2 logs salary-frontend --lines 100

# Port 3005 band bo'lsa
sudo lsof -i :3005

# Restart
pm2 restart salary-frontend

# Agar hali ham ishlamasa
pm2 delete salary-frontend
pm2 serve dist 3005 --name salary-frontend --spa
pm2 save
```

### Nginx 502 Bad Gateway:

```bash
# Backend ishlab turganini tekshirish
pm2 ls | grep salary

# Nginx error loglarini ko'rish
sudo tail -f /var/log/nginx/salary-error.log

# Nginx restart
sudo systemctl restart nginx
```

### Port Conflict (EADDRINUSE):

```bash
# Qaysi process portni ishlatayotganini topish
sudo lsof -i :3002

# Agar kerak bo'lsa, .env da portni o'zgartirish
nano .env
# PORT=3002 ni boshqa portga o'zgartiring

# Restart
pm2 restart salary-backend --update-env
```

## Foydali Buyruqlar

```bash
# PM2 barcha processlar
pm2 ls

# Salary processlarini ko'rish
pm2 ls | grep salary

# Backend loglar (real-time)
pm2 logs salary-backend

# Frontend loglar (real-time)
pm2 logs salary-frontend

# Nginx access log
sudo tail -f /var/log/nginx/salary-access.log

# Nginx error log
sudo tail -f /var/log/nginx/salary-error.log

# Nginx test
sudo nginx -t

# Nginx reload (downtime yo'q)
sudo systemctl reload nginx

# Nginx restart
sudo systemctl restart nginx

# PM2 save (konfiguratsiyani saqlash)
pm2 save

# PM2 resurrect (reboot'dan keyin avtomatik start)
pm2 startup
pm2 save
```

## Port Registry

| Port | Service | Status |
|------|---------|--------|
| 80 | Nginx (HTTP) | ✅ Active |
| 3001 | uzkafe | ✅ Active |
| 3002 | salary-backend | ✅ Active |
| 3005 | salary-frontend | ✅ Active |

## Xavfsizlik

### .env Faylini Himoya Qilish

```bash
# .env faylini faqat root o'qiy oladi
chmod 600 .env
```

### Firewall Sozlamalari

```bash
# Faqat HTTP portini ochish
sudo ufw allow 80/tcp

# HTTPS uchun (kelajakda)
sudo ufw allow 443/tcp

# Ichki portlarni yopish (3002, 3005)
# Ular faqat localhost orqali Nginx'ga ochiq
```

## Monitoring

### PM2 Monitoring

```bash
# PM2 monit (real-time monitoring)
pm2 monit

# PM2 web dashboard
pm2 web
```

### Nginx Monitoring

```bash
# Nginx status
sudo systemctl status nginx

# Active connections
sudo netstat -an | grep :80 | wc -l
```

## Backup

### Database Backup (MongoDB Atlas)

MongoDB Atlas avtomatik backup qiladi. Qo'shimcha backup uchun:

```bash
# mongodump (agar kerak bo'lsa)
mongodump --uri="mongodb+srv://..." --out=/backup/salary-$(date +%Y%m%d)
```

### Code Backup

GitHub'da barcha kod saqlanadi. Qo'shimcha lokal backup:

```bash
# Tar archive yaratish
tar -czf salary-backup-$(date +%Y%m%d).tar.gz /var/www/salary
```

## Yangilanishlar

Har safar kod o'zgartirilganda:

1. Lokal'da test qiling
2. Git commit va push qiling
3. VPS'da `./deploy-vps.sh` ishga tushiring
4. Saytni tekshiring

## Yordam

Muammo bo'lsa:
- PM2 loglarni tekshiring: `pm2 logs`
- Nginx loglarni tekshiring: `sudo tail -f /var/log/nginx/salary-error.log`
- Backend ishlab turganini tekshiring: `curl http://localhost:3002/api/branches`
