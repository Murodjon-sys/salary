# Alibobo Oylik Tizimi - To'liq Deploy Qo'llanma

## 1. SERVER TAYYORLASH

### 1.1. Serverga ulanish
```bash
ssh root@45.92.173.33
```

### 1.2. Kerakli dasturlarni o'rnatish
```bash
# Sistema yangilash
sudo apt update && sudo apt upgrade -y

# Node.js va npm o'rnatish (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js versiyasini tekshirish
node -v
npm -v

# Git o'rnatish
sudo apt install -y git

# PM2 o'rnatish (global)
sudo npm install -g pm2

# Nginx o'rnatish
sudo apt install -y nginx

# Certbot o'rnatish (SSL uchun)
sudo apt install -y certbot python3-certbot-nginx
```

## 2. LOYIHANI CLONE QILISH

### 2.1. Loyiha papkasini yaratish
```bash
# Web papkasini yaratish
sudo mkdir -p /var/www

# Papkaga o'tish
cd /var/www
```

### 2.2. GitHub'dan clone qilish
```bash
# Loyihani clone qilish
sudo git clone https://github.com/Murodjon-sys/alibobo.git salary

# Papkaga o'tish
cd /var/www/salary

# Branch'ni tekshirish
git branch
git status
```

## 3. LOYIHANI SOZLASH

### 3.1. Dependencies o'rnatish
```bash
cd /var/www/salary

# Node modules o'rnatish
npm install
```

### 3.2. Environment variables sozlash
```bash
# .env faylini yaratish
nano .env
```

Quyidagi ma'lumotlarni kiriting:
```env
MONGODB_URI=mongodb+srv://lmurodjon556_db_user:fPv2JMKt2IbBVNt7@cluster0.e5ikopt.mongodb.net/salary-management?retryWrites=true&w=majority
PORT=3010

# Regos API
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=your_regos_api_key_here
REGOS_COMPANY_ID=your_company_id_here

# Admin Login
ADMIN_LOGIN=Nurik1111
ADMIN_PASSWORD=Nurik3335
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.3. Frontend build qilish
```bash
cd /var/www/salary

# Production build
npm run build

# dist papkasini tekshirish
ls -la dist/
```

## 4. PM2 BILAN BACKEND ISHGA TUSHIRISH

### 4.1. PM2 jarayonini yaratish
```bash
cd /var/www/salary

# Backend ni ishga tushirish
pm2 start npm --name "salary-backend" -- start

# Statusni tekshirish
pm2 status

# Loglarni ko'rish
pm2 logs salary-backend --lines 30
```

### 4.2. PM2 ni avtomatik ishga tushirish
```bash
# PM2 ni saqlash
pm2 save

# Startup script yaratish
pm2 startup

# Chiqgan buyruqni nusxalash va bajarish
# Masalan: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### 4.3. Backend ni tekshirish
```bash
# Backend API ni tekshirish
curl http://localhost:3010/api/branches

# Agar xato bo'lsa, loglarni ko'ring
pm2 logs salary-backend
```

## 5. NGINX SOZLASH

### 5.1. Nginx konfiguratsiyasini yaratish
```bash
# Konfiguratsiya faylini yaratish
sudo nano /etc/nginx/sites-available/oylik.aliboboqurilish.uz
```

Quyidagi konfiguratsiyani kiriting:
```nginx
# Salary Management - Nginx Configuration
# Domain: oylik.aliboboqurilish.uz
# Backend Port: 3010 (PM2)
# Frontend: Static files in /var/www/salary/dist

# Backend API Server
upstream salary_backend {
    server 127.0.0.1:3010;
    keepalive 64;
}

# Main Server Block
server {
    listen 80;
    listen [::]:80;
    
    # Server name
    server_name oylik.aliboboqurilish.uz;
    
    # Logs
    access_log /var/log/nginx/salary-access.log;
    error_log /var/log/nginx/salary-error.log;
    
    # Client body size limit
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Frontend static files root
    root /var/www/salary/dist;
    index index.html;
    
    # Backend API - /api bilan boshlanadigan barcha so'rovlar
    location /api/ {
        proxy_pass http://salary_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
        
        # Disable buffering
        proxy_buffering off;
    }
    
    # Frontend - Root va boshqa barcha so'rovlar
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.2. Nginx konfiguratsiyasini faollashtirish
```bash
# Symlink yaratish
sudo ln -sf /etc/nginx/sites-available/oylik.aliboboqurilish.uz /etc/nginx/sites-enabled/

# Default konfiguratsiyani o'chirish (agar kerak bo'lsa)
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx konfiguratsiyasini test qilish
sudo nginx -t

# Nginx ni qayta yuklash
sudo systemctl reload nginx

# Nginx statusni tekshirish
sudo systemctl status nginx
```

### 5.3. Nginx ni tekshirish
```bash
# API ni tekshirish
curl http://localhost/api/branches

# Frontend ni tekshirish
curl http://localhost/

# Loglarni ko'rish
sudo tail -f /var/log/nginx/salary-error.log
```

## 6. SSL SERTIFIKAT O'RNATISH (HTTPS)

### 6.1. DNS sozlamalarini tekshirish
```bash
# Domain IP manzilini tekshirish
nslookup oylik.aliboboqurilish.uz

# Ping qilish
ping oylik.aliboboqurilish.uz
```

**MUHIM:** Domain DNS sozlamalarida A record qo'shilgan bo'lishi kerak:
- Type: A
- Name: oylik
- Value: 45.92.173.33
- TTL: 3600

### 6.2. Certbot bilan SSL sertifikat olish
```bash
# SSL sertifikat olish
sudo certbot --nginx -d oylik.aliboboqurilish.uz

# Savollar:
# 1. Email: sizning@email.com
# 2. Terms of Service: Y (yes)
# 3. Share email: N (no)
# 4. Redirect HTTP to HTTPS: 2 (yes, redirect)
```

### 6.3. SSL sertifikatni avtomatik yangilash
```bash
# Certbot timer statusni tekshirish
sudo systemctl status certbot.timer

# Agar o'chirilgan bo'lsa, yoqish
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Yangilashni test qilish (dry run)
sudo certbot renew --dry-run
```

### 6.4. HTTPS ni tekshirish
```bash
# HTTPS orqali API ni tekshirish
curl https://oylik.aliboboqurilish.uz/api/branches

# Brauzerda ochish
# https://oylik.aliboboqurilish.uz
```

## 7. FIREWALL SOZLASH (IXTIYORIY)

```bash
# UFW ni o'rnatish
sudo apt install -y ufw

# SSH, HTTP, HTTPS portlarini ochish
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# UFW ni yoqish
sudo ufw enable

# Statusni tekshirish
sudo ufw status
```

## 8. YANGILANISHLARNI DEPLOY QILISH

### 8.1. Yangi kodlarni pull qilish
```bash
cd /var/www/salary

# Git pull
git pull origin main

# Dependencies yangilash (agar kerak bo'lsa)
npm install

# Frontend qayta build qilish
npm run build

# PM2 ni qayta ishga tushirish
pm2 restart salary-backend

# Statusni tekshirish
pm2 status
pm2 logs salary-backend --lines 30
```

### 8.2. Nginx ni qayta yuklash (agar kerak bo'lsa)
```bash
# Nginx konfiguratsiyasini yangilash
sudo cp /var/www/salary/nginx-salary.conf /etc/nginx/sites-available/oylik.aliboboqurilish.uz

# Test qilish
sudo nginx -t

# Qayta yuklash
sudo systemctl reload nginx
```

## 9. MONITORING VA DEBUGGING

### 9.1. PM2 monitoring
```bash
# PM2 statusni ko'rish
pm2 status

# Loglarni real-time ko'rish
pm2 logs salary-backend

# Monit (CPU, Memory)
pm2 monit

# PM2 ni qayta ishga tushirish
pm2 restart salary-backend

# PM2 ni to'xtatish
pm2 stop salary-backend

# PM2 ni o'chirish
pm2 delete salary-backend
```

### 9.2. Nginx monitoring
```bash
# Nginx statusni tekshirish
sudo systemctl status nginx

# Access logni ko'rish
sudo tail -f /var/log/nginx/salary-access.log

# Error logni ko'rish
sudo tail -f /var/log/nginx/salary-error.log

# Nginx ni qayta ishga tushirish
sudo systemctl restart nginx
```

### 9.3. Backend debugging
```bash
# Backend portini tekshirish
sudo netstat -tulpn | grep 3010

# Backend API ni tekshirish
curl -v http://localhost:3010/api/branches

# Backend ni qo'lda ishga tushirish (debugging uchun)
cd /var/www/salary
node server/index.js
```

### 9.4. Disk space tekshirish
```bash
# Disk space
df -h

# Papka hajmini ko'rish
du -sh /var/www/salary

# Node modules hajmi
du -sh /var/www/salary/node_modules
```

## 10. MUAMMOLARNI HAL QILISH

### 10.1. Port band (EADDRINUSE)
```bash
# Portni band qilgan jarayonni topish
sudo lsof -i :3010

# Jarayonni o'ldirish
sudo kill -9 <PID>

# yoki avtomatik
sudo fuser -k 3010/tcp

# PM2 ni qayta ishga tushirish
pm2 restart salary-backend
```

### 10.2. 502 Bad Gateway
```bash
# Backend ishlab turganini tekshirish
pm2 status
curl http://localhost:3010/api/branches

# Nginx error logini ko'rish
sudo tail -n 50 /var/log/nginx/salary-error.log

# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Backend va Nginx ni qayta ishga tushirish
pm2 restart salary-backend
sudo systemctl reload nginx
```

### 10.3. MongoDB ulanish xatosi
```bash
# .env faylini tekshirish
cat /var/www/salary/.env

# MongoDB URI ni test qilish
# MongoDB Compass yoki mongosh bilan ulanib ko'ring

# PM2 loglarni ko'rish
pm2 logs salary-backend --lines 50
```

### 10.4. Frontend 404 xatosi
```bash
# dist papkasini tekshirish
ls -la /var/www/salary/dist/

# Agar dist yo'q bo'lsa, build qilish
cd /var/www/salary
npm run build

# Nginx root yo'lini tekshirish
cat /etc/nginx/sites-enabled/oylik.aliboboqurilish.uz | grep "root"

# Nginx ni qayta yuklash
sudo systemctl reload nginx
```

## 11. BACKUP VA RESTORE

### 11.1. MongoDB backup
```bash
# MongoDB dump (local)
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/salary-management" --out=/backup/mongodb

# MongoDB restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/salary-management" /backup/mongodb
```

### 11.2. Loyiha backup
```bash
# Loyihani arxivlash
cd /var/www
sudo tar -czf salary-backup-$(date +%Y%m%d).tar.gz salary/

# Backup ni boshqa joyga ko'chirish
scp salary-backup-*.tar.gz user@backup-server:/backups/
```

## 12. FOYDALI BUYRUQLAR

```bash
# Sistema resurslari
htop
free -h
df -h

# Nginx
sudo nginx -t                    # Test config
sudo systemctl status nginx      # Status
sudo systemctl reload nginx      # Reload
sudo systemctl restart nginx     # Restart
sudo tail -f /var/log/nginx/error.log  # Error log

# PM2
pm2 list                         # Barcha jarayonlar
pm2 status                       # Status
pm2 logs                         # Barcha loglar
pm2 logs salary-backend          # Bitta jarayon logi
pm2 restart all                  # Barchasini restart
pm2 save                         # Saqlash
pm2 startup                      # Startup script

# Git
git status                       # Status
git pull origin main             # Pull
git log --oneline -10            # Oxirgi 10 commit

# Node.js
node -v                          # Node versiyasi
npm -v                           # npm versiyasi
npm list                         # O'rnatilgan packages
```

## 13. XAVFSIZLIK

### 13.1. SSH sozlamalari
```bash
# SSH konfiguratsiyasini tahrirlash
sudo nano /etc/ssh/sshd_config

# Quyidagilarni o'zgartiring:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# SSH ni qayta ishga tushirish
sudo systemctl restart sshd
```

### 13.2. Fail2ban o'rnatish
```bash
# Fail2ban o'rnatish
sudo apt install -y fail2ban

# Konfiguratsiya
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Fail2ban ni ishga tushirish
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## QISQACHA DEPLOY BUYRUQLARI

```bash
# 1. Serverga ulanish
ssh root@45.92.173.33

# 2. Loyihani clone qilish
cd /var/www
git clone https://github.com/Murodjon-sys/alibobo.git salary
cd salary

# 3. Dependencies o'rnatish
npm install

# 4. .env yaratish
nano .env
# (ma'lumotlarni kiriting)

# 5. Frontend build
npm run build

# 6. PM2 ishga tushirish
pm2 start npm --name "salary-backend" -- start
pm2 save
pm2 startup

# 7. Nginx sozlash
sudo nano /etc/nginx/sites-available/oylik.aliboboqurilish.uz
# (konfiguratsiyani kiriting)
sudo ln -sf /etc/nginx/sites-available/oylik.aliboboqurilish.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL o'rnatish
sudo certbot --nginx -d oylik.aliboboqurilish.uz

# 9. Tekshirish
pm2 status
curl https://oylik.aliboboqurilish.uz/api/branches
```

---

**Muallif:** Kiro AI Assistant  
**Sana:** 2024-12-26  
**Versiya:** 1.0
