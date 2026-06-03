#!/bin/bash
# EC2 User-Data bootstrap for TaskManager backend
# Tested on Amazon Linux 2023 (t3.micro — Free Tier eligible)
set -euo pipefail

# ── 1. System updates & Java 17 ───────────────────────────────────────────────
dnf update -y -q
dnf install -y java-17-amazon-corretto-headless

# ── 2. App directory & user ───────────────────────────────────────────────────
useradd -r -s /sbin/nologin taskmanager || true
mkdir -p /opt/taskmanager
chown taskmanager:taskmanager /opt/taskmanager

# ── 3. Systemd unit ───────────────────────────────────────────────────────────
# All secrets are injected as EnvironmentFile — fill /etc/taskmanager.env manually
# or via AWS Systems Manager Parameter Store (see infra/README.md)
cat > /etc/systemd/system/taskmanager.service << 'EOF'
[Unit]
Description=TaskManager Spring Boot App
After=network.target

[Service]
User=taskmanager
WorkingDirectory=/opt/taskmanager
EnvironmentFile=/etc/taskmanager.env
ExecStart=/usr/bin/java \
  -Xmx400m -Xms200m \
  -Dspring.profiles.active=prod \
  -jar /opt/taskmanager/app.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# ── 4. Env file placeholder (CI/CD will not overwrite this file) ──────────────
if [ ! -f /etc/taskmanager.env ]; then
  cat > /etc/taskmanager.env << 'EOF'
# Fill these in after provisioning — never commit this file
DB_URL=jdbc:mysql://<rds-endpoint>:3306/task_manager
DB_USERNAME=taskmanager
DB_PASSWORD=CHANGE_ME
JWT_SECRET=CHANGE_ME_MIN_32_CHARS
CORS_ALLOWED_ORIGIN=https://<cloudfront-domain>
COOKIE_SECURE=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=CHANGE_ME
MAIL_PASSWORD=CHANGE_ME
ADMIN_EMAIL=CHANGE_ME
EOF
  chmod 600 /etc/taskmanager.env
  chown root:root /etc/taskmanager.env
fi

# ── 5. Enable service (starts after first JAR deploy) ─────────────────────────
systemctl daemon-reload
systemctl enable taskmanager
