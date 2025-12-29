# AWS Deployment Checklist ✅

## সমস্যা যা ঠিক করা হয়েছে:

### ✅ 1. Dockerfile Fixed

- ❌ আগে: `start:dev` ব্যবহার করা হচ্ছিল
- ✅ এখন: `start:prod` ব্যবহার হচ্ছে + production build চলছে
- ✅ `RUN npm run build` যোগ করা হয়েছে

### ✅ 2. Config Syntax Error Fixed

- ❌ আগে: `path.join((process.cwd(), '.env'))` - extra parenthesis
- ✅ এখন: `path.join(process.cwd(), '.env')` - সঠিক syntax

### ✅ 3. ESLint Configuration Fixed

- ✅ পুরনো `.eslintrc.json` মুছে ফেলা হয়েছে
- ✅ পুরনো `.eslintignore` মুছে ফেলা হয়েছে
- ✅ নতুন `eslint.config.mjs` properly configured
- ✅ TypeScript-ESLint এর সাথে compatible
- ✅ Linting successfully কাজ করছে

### ✅ 4. Package.json Fixed

- ✅ Deprecated `--ignore-path` flag সরানো হয়েছে

### ✅ 5. Build Verification

- ✅ TypeScript compilation successful
- ✅ `dist` folder তৈরি হয়েছে

### ✅ 6. Docker Optimization

- ✅ `.dockerignore` file তৈরি করা হয়েছে
- ✅ Unnecessary files Docker image থেকে বাদ যাবে

## AWS Deployment এর আগে করণীয়:

### Environment Variables

নিচের সব environment variables AWS তে configure করতে হবে:

```env
NODE_ENV=production
PORT=5000
IP=0.0.0.0
database_url=<your-mongodb-url>
BCRYPT_SALT_ROUNDS=<number>
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRES_IN=<time>
JWT_REFRESH_EXPIRES_IN=<time>
NODEMAILER_HOST_EMAIL=<email>
NODEMAILER_HOST_PASS=<password>
server_url=<your-server-url>
SOCKET_PORT=<port>
STRIPE_SECRET=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
OPENAI_API_KEY=<api-key>
region=<aws-region>
accessKeyId=<aws-access-key>
secretAccessKey=<aws-secret-key>
AWS_BUCKET_NAME=<bucket-name>
```

### AWS Deployment Options:

#### Option 1: AWS ECS with ECR

```bash
# 1. Build Docker image
docker build -t guishapp-backend .

# 2. Test locally
docker run -p 5000:5000 --env-file .env guishapp-backend

# 3. Tag and push to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker tag guishapp-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/guishapp-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/guishapp-backend:latest
```

#### Option 2: AWS Elastic Beanstalk

```bash
# 1. Initialize EB
eb init -p docker guishapp-backend

# 2. Create environment
eb create guishapp-prod

# 3. Deploy
eb deploy
```

#### Option 3: AWS App Runner

- AWS Console থেকে App Runner service তৈরি করুন
- ECR repository connect করুন
- Environment variables configure করুন

### Security Checklist:

- ✅ `.env` file `.gitignore` এ আছে
- ⚠️ AWS এ environment variables securely set করুন
- ⚠️ Database connection string secure রাখুন
- ⚠️ AWS Security Groups properly configure করুন
- ⚠️ HTTPS enable করুন

## প্রজেক্ট এখন Deployment Ready! 🚀
