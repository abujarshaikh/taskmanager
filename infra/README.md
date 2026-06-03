# AWS Infrastructure Setup Guide

Stack: RDS (MySQL 8) → EC2 t3.micro (Spring Boot) → S3 + CloudFront (React)

All services below stay within the AWS Free Tier for 12 months.

---

## 0. Prerequisites

- AWS account with billing alerts enabled (recommended)
- AWS CLI v2 installed and configured (`aws configure`)
- Your GitHub repo with the project pushed to `main`

---

## 1. VPC & Security Groups

You can use the **default VPC**. Create two security groups:

### SG: `taskmanager-rds`
| Type       | Protocol | Port | Source                    |
|------------|----------|------|---------------------------|
| MySQL/Aurora | TCP    | 3306 | SG `taskmanager-ec2` only |

### SG: `taskmanager-ec2`
| Type  | Protocol | Port | Source        |
|-------|----------|------|---------------|
| SSH   | TCP      | 22   | Your IP /32   |
| HTTP  | TCP      | 8080 | 0.0.0.0/0     |

> Keep port 8080 open only while testing. Once CloudFront is in front, lock it
> to the CloudFront managed prefix list or remove public access entirely and
> use CloudFront → origin pointing to the EC2 private IP / ALB.

---

## 2. RDS — MySQL 8 (Free Tier)

1. Open RDS → **Create database**
2. Engine: **MySQL 8.0**
3. Template: **Free tier** (db.t3.micro, 20 GB gp2)
4. DB instance identifier: `taskmanager`
5. Master username: `taskmanager`
6. Master password: (strong password — save it)
7. Connectivity:
   - VPC: default
   - Public access: **No**
   - VPC security group: `taskmanager-rds`
8. Additional config → Initial database name: `task_manager`
9. Disable automated backups if you want to stay within Free Tier storage limits.
10. Create. Note the **Endpoint** (looks like `taskmanager.xxxx.us-east-1.rds.amazonaws.com`).

First-deploy schema creation:

```
# On first deploy only — SSH into EC2 and edit /etc/taskmanager.env:
spring.jpa.hibernate.ddl-auto=update
# After tables are created, set it back to:
spring.jpa.hibernate.ddl-auto=validate
# application-prod.properties already defaults to 'validate'
```

---

## 3. EC2 — Amazon Linux 2023 (Free Tier)

1. Open EC2 → **Launch instance**
2. Name: `taskmanager-backend`
3. AMI: **Amazon Linux 2023** (free tier eligible)
4. Instance type: **t3.micro** (or t2.micro if your region doesn't have t3 free tier)
5. Key pair: create or select an existing one — download the `.pem` file
6. Network settings:
   - VPC: default
   - Security group: `taskmanager-ec2`
7. Advanced → **User data**: paste the entire contents of `infra/userdata.sh`
8. Launch.

### After launch

SSH in and fill the secrets file:

```bash
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>
sudo nano /etc/taskmanager.env
# Fill in all CHANGE_ME values using your RDS endpoint, etc.
sudo chmod 600 /etc/taskmanager.env
```

The service won't start yet — it needs the JAR. The first GitHub Actions push will deploy it.

---

## 4. IAM User for GitHub Actions (deploy only)

1. IAM → Users → **Create user**: `github-actions-taskmanager`
2. Attach policies:
   - `AmazonS3FullAccess` (or a scoped inline policy — see below)
   - `CloudFrontFullAccess` (or scoped)
3. Create **access key** (type: CLI) → save `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`

Minimal inline S3+CloudFront policy (recommended over full access):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::<YOUR_BUCKET_NAME>",
        "arn:aws:s3:::<YOUR_BUCKET_NAME>/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

---

## 5. S3 Bucket for React Frontend

```bash
# Replace <BUCKET_NAME> with something globally unique, e.g. taskmanager-frontend-prod
aws s3 mb s3://<BUCKET_NAME> --region us-east-1

# Block ALL public access (CloudFront OAC will be the only reader)
aws s3api put-public-access-block \
  --bucket <BUCKET_NAME> \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

Do NOT enable static website hosting — CloudFront OAC works directly with the REST API.

---

## 6. CloudFront Distribution

1. Open CloudFront → **Create distribution**
2. Origin domain: select your S3 bucket from the dropdown
3. Origin access: **Origin access control (OAC)** → Create new OAC (defaults are fine)
4. Copy the bucket policy shown after creation → paste it into S3 → Permissions → Bucket policy
   (Or use `infra/cloudfront-s3-policy.json` after filling in the placeholders)
5. Viewer protocol policy: **Redirect HTTP to HTTPS**
6. Allowed HTTP methods: **GET, HEAD** (static site)
7. Default root object: `index.html`
8. **Error pages** (critical for React Router SPA routing):
   - 403 → `/index.html` → 200
   - 404 → `/index.html` → 200
9. Price class: **Use only North America and Europe** (cheapest, still free-tier friendly)
10. Create. Note the **Distribution domain name** (`xxxx.cloudfront.net`).

---

## 7. GitHub Actions Secrets

In your GitHub repo → Settings → Secrets and variables → Actions, add:

| Secret name                  | Value                                              |
|------------------------------|----------------------------------------------------|
| `EC2_HOST`                   | EC2 public IP or DNS                               |
| `EC2_USER`                   | `ec2-user`                                         |
| `EC2_SSH_KEY`                | Contents of your `.pem` file (the whole thing)     |
| `AWS_ACCESS_KEY_ID`          | From step 4                                        |
| `AWS_SECRET_ACCESS_KEY`      | From step 4                                        |
| `AWS_REGION`                 | e.g. `us-east-1`                                   |
| `S3_BUCKET_NAME`             | Your bucket name from step 5                       |
| `CLOUDFRONT_DISTRIBUTION_ID` | From step 6                                        |
| `VITE_API_BASE_URL`          | `https://<EC2_PUBLIC_IP>:8080/api` (or via ALB)    |
| `VITE_ADMIN_EMAIL`           | Admin contact email shown in the UI                |
| `VITE_ADMIN_PHONE`           | Admin contact phone shown in the UI                |

---

## 8. First Deployment

```bash
# Trigger both workflows by pushing to main
git add .
git commit -m "chore: add AWS deployment config"
git push origin main
```

Watch the Actions tab. Backend workflow will:
1. Build the JAR with Maven
2. SCP it to `/opt/taskmanager/app.jar` on EC2
3. Run `sudo systemctl restart taskmanager`

Frontend workflow will:
1. `npm ci` + `vite build` with production env vars
2. `aws s3 sync dist/ s3://<bucket> --delete`
3. Invalidate the CloudFront distribution

---

## 9. Verify

```bash
# Backend health
curl http://<EC2_PUBLIC_IP>:8080/api/auth/me
# Expected: 401 (service running, auth required)

# Check service logs on EC2
ssh -i key.pem ec2-user@<EC2_IP> "sudo journalctl -u taskmanager -n 50 --no-pager"

# Frontend
open https://<CLOUDFRONT_DOMAIN>
```

---

## 10. Cookie / CORS Configuration

Because the React app is on `https://<cloudfront>.cloudfront.net` and the backend
is on `http://<ec2-ip>:8080`, you need cross-origin cookies.

In `/etc/taskmanager.env` on EC2 set:

```
CORS_ALLOWED_ORIGIN=https://<your-cloudfront-domain>.cloudfront.net
COOKIE_SECURE=true
```

The `AuthController.buildCookie()` already handles `sameSite("None")` when
`cookie.secure=true`, so no code changes are needed.

Restart after changing the env file:

```bash
sudo systemctl restart taskmanager
```

---

## 11. Free Tier Limits Summary

| Service       | Free Tier allowance                  | This project's usage          |
|---------------|--------------------------------------|-------------------------------|
| EC2 t3.micro  | 750 hrs/mo for 12 months             | 1 instance ≈ 744 hrs/mo ✓    |
| RDS db.t3.micro | 750 hrs/mo + 20 GB storage         | 1 instance ✓                  |
| S3            | 5 GB + 20k GET + 2k PUT/mo           | Static assets ✓               |
| CloudFront    | 1 TB transfer + 10M requests/mo      | More than enough ✓            |
| Data transfer | 100 GB out/mo (EC2)                  | Typical usage ✓               |

> After 12 months EC2 and RDS leave the free tier. Consider Reserved Instances
> or moving to a smaller managed option at that point.
