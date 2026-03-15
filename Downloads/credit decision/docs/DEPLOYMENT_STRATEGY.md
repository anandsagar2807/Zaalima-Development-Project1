# Deployment Strategy: Vercel + AWS Multi-Cloud

## Overview
Hybrid deployment strategy leveraging Vercel for frontend optimization and AWS for scalable backend services.

## 1. Architecture Components Deployment

### Frontend Layer (Vercel)
```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Next.js Frontend (Auto-scaling on Edge Network)     │  │
│  │ • Static assets via CDN                              │  │
│  │ • API Routes for light backend                       │  │
│  │ • Automatic CI/CD from GitHub                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Edge Locations: Mumbai, Singapore, Tokyo, Frankfurt       │
│  Auto-scaling: Based on concurrent users                  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Layer (AWS)
```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Application Load Balancer                            │  │
│  │ • Health checks                                      │  │
│  │ • SSL termination                                    │  │
│  │ • Auto-scaling triggers                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────┼──────────────────────┐           │
│  │ Auto Scaling Group   │                      │           │
│  │ min: 2, max: 10      │                      │           │
│  └──────────────────────┼──────────────────────┘           │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐             │
│    │                    │                    │             │
│  ┌─▼─────┐         ┌─────▼────┐        ┌─────▼────┐      │
│  │ EC2   │         │  EC2     │        │  EC2     │      │
│  │ Node  │         │  Node    │        │  Python  │      │
│  │ API   │         │  API     │        │  ML      │      │
│  └───────┘         └──────────┘        └──────────┘      │
│      │                 │                     │            │
│      └─────────────────┼─────────────────────┘            │
│                        │                                   │
└────────────────────────┼───────────────────────────────────┘
                         │
┌────────────────────────┼───────────────────────────────────┐
│  ┌─────────────────────▼─────────────────────┐           │
│  │  Database Layer                           │           │
│  │  ┌──────────────────┐  ┌──────────────┐  │           │
│  │  │ RDS PostgreSQL   │  │ DocumentDB   │  │           │
│  │  │ Multi-AZ         │  │ (MongoDB)    │  │           │
│  │  │ Read Replicas    │  │              │  │           │
│  │  └──────────────────┘  └──────────────┘  │           │
│  └───────────────────────────────────────────┘           │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage & Cache                                     │  │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────┐  │  │
│  │  │ S3 Buckets│  │ ElastiCache│  │ EFS (File       │  │  │
│  │  │ Documents │  │ Redis      │  │ Storage)       │  │  │
│  │  └───────────┘  └───────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Vercel Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    }
  ],
  "functions": {
    "src/pages/api/**/*.ts": {
      "memory": 256,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1",
      "headers": {
        "Content-Security-Policy": "default-src 'self'",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff"
      }
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.credit-engine.fintech.com",
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "regions": ["bom1", "sin1", "hnd1", "fra1"],
  "framework": "nextjs"
}
```

### Environment Variables (Vercel)
```
NEXT_PUBLIC_API_URL=https://api.credit-engine.fintech.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=sentry_dsn_here
DATABASE_URL=postgresql://...
REDIS_URL=redis://elasticache-endpoint:6379
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
JWT_SECRET=production_secret_key
```

## 3. AWS Infrastructure as Code (Terraform)

### main.tf
```hcl
# Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "credit-engine-vpc"
    Environment = "production"
  }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "credit-engine-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "credit-engine-private-${count.index + 1}"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "credit-engine-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true
}

# Auto Scaling Group
resource "aws_autoscaling_group" "api" {
  name_prefix          = "credit-engine-api-"
  max_size            = 10
  min_size            = 2
  desired_capacity    = 3
  health_check_type   = "ELB"
  launch_configuration = aws_launch_configuration.api.name
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.api.arn]

  tag {
    key                 = "Name"
    value               = "credit-engine-api"
    propagate_at_launch = true
  }

  # Scaling Policies
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale-up-policy"
  scaling_adjustment     = 2
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.api.name
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier             = "credit-engine-postgres"
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = "db.r6g.xlarge"
  allocated_storage     = 500
  max_allocated_storage = 1000
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  multi_az               = true
  publicly_accessible   = false
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  username = var.db_username
  password = var.db_password
  database_name = "credit_engine"

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  monitoring_interval    = 60
  monitoring_role_arn    = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled = true

  deletion_protection    = true

  tags = {
    Name = "credit-engine-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "credit-engine-redis"
  description                  = "Redis cluster for caching and sessions"
  node_type                    = "cache.r6g.large"
  port                         = 6379
  parameter_group_name         = "default.redis7"

  num_cache_clusters           = 3
  automatic_failover_enabled   = true
  multi_az_enabled            = true
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = var.redis_auth_token

  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = [aws_security_group.redis.id]

  maintenance_window          = "sun:03:00-sun:04:00"
  snapshot_retention_limit    = 30
  snapshot_window            = "02:00-03:00"

  tags = {
    Name = "credit-engine-redis"
  }
}

# S3 Bucket for Documents
resource "aws_s3_bucket" "documents" {
  bucket = "credit-engine-documents-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name        = "Credit Engine Documents"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "archive_old_documents"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }

    expiration {
      days = 2555  # 7 years
    }
  }
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "credit-engine-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api" {
  name        = "credit-engine-api-sg"
  description = "Security group for API instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "api_cpu" {
  alarm_name          = "api-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/EC2"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description   = "This metric monitors EC2 CPU utilization"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.api.name
  }

  alarm_actions = [aws_autoscaling_policy.scale_up.arn]
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "api-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api-origin"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }
}
```

## 4. Docker Configuration

### Dockerfile.frontend
```dockerfile
# Multi-stage build for Next.js frontend
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Dockerfile.backend
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER nodejs

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

### docker-compose.prod.yml
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.credit-engine.fintech.com
    depends_on:
      - api
  
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/credit_engine
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  ml-service:
    build:
      context: ./ml-services
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - MODEL_PATH=/app/models
    volumes:
      - ./models:/app/models
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: credit_engine
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

## 5. CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./frontend

  deploy-backend:
    needs: build-frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID}}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY}}
          aws-region: ap-south-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry}}
          ECR_REPOSITORY: credit-engine-api
          IMAGE_TAG: ${{ github.sha}}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster credit-engine-cluster \
            --service api-service \
            --force-new-deployment

  run-migrations:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - name: Run DB migrations
        run: |
          aws ssm send-command \
            --instance-ids ${{ secrets.INSTANCE_ID}} \
            --document-name "AWS-RunShellScript" \
            --parameters 'commands=["cd /opt/credit-engine && npm run migrate"]'
```

## 6. Monitoring & Observability

### CloudWatch Dashboard
```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "credit-engine-api"],
          [".", ".", ".", "."]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "ap-south-1",
        "title": "API CPU Utilization"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "credit-engine-postgres"],
          [".", "ReadLatency", ".", "."],
          [".", "WriteLatency", ".", "."]
        ]
      }
    }
  ]
}
```

### Application Performance Monitoring
```typescript
// New Relic / DataDog integration
export const monitoringConfig = {
  appName: 'Credit Decisioning Engine',
  licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    enabled: true
  },
  distributedTracing: {
    enabled: true
  },
  transactionTracer: {
    recordSql: 'obfuscated',
    explainEnabled: true,
    explainThreshold: 500
  },
  errorCollector: {
    enabled: true,
    captureEvents: true
  }
};
```

## 7. Backup & Disaster Recovery

### RDS Automated Backups
```sql
-- Automated backups with point-in-time recovery
-- Retention: 35 days
-- Backup window: 03:00-04:00 UTC
-- Maintenance window: Sunday 04:00-05:00 UTC

-- Cross-region replication for disaster recovery
CREATE_REPLICA_IN_REGION = 'ap-southeast-1'
```

### S3 Cross-Region Replication
```json
{
  "Role": "arn:aws:iam::account:role/replication-role",
  "Rules": [
    {
      "ID": "DocumentReplication",
      "Status": "Enabled",
      "Prefix": "documents/",
      "Destination": {
        "Bucket": "arn:aws:s3:::credit-engine-documents-dr",
        "StorageClass": "STANDARD"
      }
    }
  ]
}
```

## 8. Security Configuration

### WAF Rules
```json
{
  "Name": "CreditEngineWAF",
  "MetricName": "CreditEngineWAF",
  "DefaultAction": {
    "Type": "BLOCK"
  },
  "Rules": [
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 0,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": {
        "None": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "AWSManagedRulesCommonRuleSet"
      }
    },
    {
      "Name": "RateLimitAPI",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 1000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": {
        "Block": {}
      }
    }
  ]
}
```

This comprehensive deployment strategy ensures high availability, scalability, and security for the credit decisioning engine.