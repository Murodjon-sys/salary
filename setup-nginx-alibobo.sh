#!/bin/bash

# Nginx setup script for Alibobo

set -e

echo "🔧 Setting up Nginx for Alibobo..."

# 1. Copy nginx configuration
echo "📋 Copying Nginx configuration..."
cp nginx-alibobo.conf /etc/nginx/sites-available/alibobo

# 2. Create symbolic link
echo "🔗 Creating symbolic link..."
ln -sf /etc/nginx/sites-available/alibobo /etc/nginx/sites-enabled/alibobo

# 3. Test nginx configuration
echo "✅ Testing Nginx configuration..."
nginx -t

# 4. Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# 5. Get SSL certificate
echo "🔒 Setting up SSL certificate..."
echo "Please enter your domain name (e.g., alibobo.uz):"
read DOMAIN

certbot --nginx -d $DOMAIN -d www.$DOMAIN

# 6. Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ Nginx successfully configured!"
echo "Your site should now be accessible at: https://$DOMAIN"
echo ""
echo "To check Nginx status: systemctl status nginx"
echo "To view logs: tail -f /var/log/nginx/alibobo_error.log"
