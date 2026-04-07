# Docker Setup Guide for MedConnect

## Dockerfile for Backend

Create `Medconnect-backend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
```

## Docker Compose Configuration

Create `docker-compose.yml` in project root:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:6
    container_name: medconnect-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: adminpass
      MONGO_INITDB_DATABASE: medconnect
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - medconnect-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017 -u admin -p adminpass --authenticationDatabase admin
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./Medconnect-backend
      dockerfile: Dockerfile
    container_name: medconnect-api
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      MONGO_URI: mongodb://admin:adminpass@mongodb:27017/medconnect?authSource=admin
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret_key}
      TOKEN_EXPIRES_IN: 7d
    depends_on:
      mongodb:
        condition: service_healthy
    volumes:
      - ./Medconnect-backend/uploads:/app/uploads
    networks:
      - medconnect-network
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})",
        ]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

  frontend:
    build:
      context: ./Medconnect-User-main
      dockerfile: Dockerfile.user
    container_name: medconnect-user-app
    ports:
      - "5173:3000"
    environment:
      VITE_API_URL: http://backend:4000
    depends_on:
      - backend
    networks:
      - medconnect-network

  doctor-dashboard:
    build:
      context: ./Medconnect-Doctors-main
      dockerfile: Dockerfile.doctor
    container_name: medconnect-doctor-app
    ports:
      - "5174:3000"
    environment:
      VITE_API_URL: http://backend:4000
    depends_on:
      - backend
    networks:
      - medconnect-network

volumes:
  mongodb_data:
  mongodb_config:

networks:
  medconnect-network:
    driver: bridge
```

## Frontend Dockerfile (User App)

Create `Medconnect-User-main/Dockerfile.user`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run production build
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Docker Setup Instructions

### 1. Build and Start Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
```

### 2. Initialize Database

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p adminpass

# Run in mongosh:
use medconnect
db.createCollection("users")
```

### 3. Access Applications

- **Backend API**: `http://localhost:4000`
- **User Frontend**: `http://localhost:5173`
- **Doctor Dashboard**: `http://localhost:5174`
- **MongoDB**: `localhost:27017`

### 4. Stop Services

```bash
docker-compose down

# Remove volumes (delete data)
docker-compose down -v
```

## Environment Variables for Docker

Create `.env` for docker-compose:

```
JWT_SECRET=your_secure_jwt_secret_key
MONGO_USERNAME=admin
MONGO_PASSWORD=adminpass
```

---

## Kubernetes Deployment (Advanced)

### Backend Pod

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medconnect-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medconnect-backend
  template:
    metadata:
      labels:
        app: medconnect-backend
    spec:
      containers:
        - name: backend
          image: medconnect-backend:latest
          ports:
            - containerPort: 4000
          env:
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: medconnect-secrets
                  key: mongo-uri
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: medconnect-secrets
                  key: jwt-secret
          livenessProbe:
            httpGet:
              path: /
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: medconnect-backend-service
spec:
  selector:
    app: medconnect-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic medconnect-secrets \
  --from-literal=mongo-uri='mongodb://...' \
  --from-literal=jwt-secret='your_secret'

# Deploy
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Check status
kubectl get deployments
kubectl get services
kubectl get pods

# View logs
kubectl logs deployment/medconnect-backend
```

---

## Health Checks

### Docker Health Check

```bash
curl -s http://localhost:4000/
```

### Kubernetes Probe Check

```bash
kubectl describe pod <pod-name>
```

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify connection
docker-compose exec mongodb mongosh -u admin -p adminpass --eval "db.connectionStatus()"
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml or:
docker-compose down
```

### Permission Denied for Uploads

```bash
# Fix permissions
docker-compose exec backend chmod 755 uploads
```

---

**Last Updated**: March 2024
