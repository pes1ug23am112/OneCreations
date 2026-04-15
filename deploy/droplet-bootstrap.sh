#!/usr/bin/env bash
# Run once on a fresh Ubuntu 24.04 LTS droplet, as root.
#   scp deploy/droplet-bootstrap.sh root@<droplet-ip>:/root/
#   ssh root@<droplet-ip> bash /root/droplet-bootstrap.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get upgrade -y
apt-get install -y \
  curl git ufw nginx certbot python3-certbot-nginx \
  build-essential ca-certificates

# Node 20 LTS via NodeSource
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# PM2 + logrotate
npm install -g pm2
pm2 install pm2-logrotate || true
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true

# Deploy user with the root SSH key trusted
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
fi
mkdir -p /home/deploy/.ssh /home/deploy/logs
if [[ -f /root/.ssh/authorized_keys ]]; then
  cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
fi
chown -R deploy:deploy /home/deploy/.ssh /home/deploy/logs
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys || true

# PM2 system service for the deploy user so pm2 resurrects on reboot.
env PATH="$PATH" pm2 startup systemd -u deploy --hp /home/deploy

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo
echo "Bootstrap complete."
echo "Next:"
echo "  1. ssh deploy@<ip> and: git clone <repo> /home/deploy/oneCreations"
echo "  2. Create /home/deploy/oneCreations/api/.env from .env.example"
echo "  3. Copy deploy/nginx/api.onecreations.in.conf → /etc/nginx/sites-available/ and enable"
echo "  4. certbot --nginx -d api.onecreations.in"
echo "  5. cd /home/deploy/oneCreations && bash deploy/deploy.sh"
