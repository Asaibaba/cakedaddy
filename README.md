📋 Overview
Cakedaddy is a full-stack bakery ecommerce website with Spring Boot backend, JavaScript frontend, and MongoDB database. This guide provides complete step-by-step deployment instructions.

🎯 Architecture
Backend: Spring Boot REST API (Port 8080)

Frontend: HTML/CSS/JavaScript (Served by Nginx on Port 80)

Database: MongoDB (Port 27017)

Web Server: Nginx (Reverse proxy and static file serving)

📦 Prerequisites
System Requirements
Red Hat Enterprise Linux (RHEL) 8/9

2GB RAM minimum, 4GB recommended

20GB disk space

Root or sudo access

Required Software
Java 17+

Maven 3.6+

MongoDB 5.0+

Nginx

🚀 Complete Deployment Steps
Step 1: System Preparation
1.1 Update System and Install Basic Tools
bash
# Login as root or use sudo
sudo su -

# Update system
yum update -y

# Install EPEL repository
yum install -y epel-release

# Install basic utilities
yum install -y wget curl git vim nano unzip
1.2 Configure Firewall
bash
# Open necessary ports
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload

# Verify firewall rules
firewall-cmd --list-all
Step 2: Install Java 17
2.1 Install OpenJDK
bash
# Install Java 17
yum install -y java-17-openjdk java-17-openjdk-devel

# Verify installation
java -version
javac -version
2.2 Set Java Environment Variables
bash
# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> /etc/profile
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> /etc/profile

# Reload profile
source /etc/profile

# Verify JAVA_HOME
echo $JAVA_HOME
Step 3: Install Maven
bash
# Install Maven
yum install -y maven

# Verify installation
mvn -version
Step 4: Install and Configure MongoDB
4.1 Install MongoDB
bash
# Create MongoDB repository file
cat > /etc/yum.repos.d/mongodb-org-5.0.repo << 'EOF'
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
EOF

# Install MongoDB
yum install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Check status
systemctl status mongod
4.2 Configure MongoDB
bash
# Edit MongoDB configuration
vi /etc/mongod.conf
Update the following sections:

yaml
# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# security
security:
  authorization: enabled

# storage
storage:
  dbPath: /var/lib/mongo
  journal:
    enabled: true
bash
# Restart MongoDB with new configuration
systemctl restart mongod

# Create necessary directories
mkdir -p /var/log/mongodb
chown mongod:mongod /var/log/mongodb
Step 5: Install Nginx
bash
# Install Nginx
yum install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
Step 6: Prepare Application Directory Structure
bash
# Create application directories
mkdir -p /opt/cakedaddy/{backend,frontend,logs,backups}
mkdir -p /var/www/cakedaddy/{backend,frontend}

# Set ownership
chown -R $USER:$USER /opt/cakedaddy
chmod -R 755 /opt/cakedaddy
Step 7: Deploy Backend Application
7.1 Upload Backend Files
Upload your backend files to /opt/cakedaddy/backend/ with this structure:

text
/opt/cakedaddy/backend/
├── pom.xml
└── src/
    └── main/
        ├── java/com/cakedaddy/
        │   ├── CakedaddyApplication.java
        │   ├── config/
        │   ├── controller/
        │   ├── model/
        │   ├── repository/
        │   └── service/
        └── resources/
            └── application.properties
7.2 Verify pom.xml Structure
Ensure your pom.xml includes Spring Boot Maven plugin:

xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.cakedaddy</groupId>
    <artifactId>cakedaddy</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
    </parent>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
7.3 Build Backend Application
bash
cd /opt/cakedaddy/backend

# Build the application
mvn clean package -DskipTests

# Verify JAR was created
ls -la target/cakedaddy-1.0.0.jar
7.4 Create Production Configuration
bash
# Create application.properties for production
cat > /var/www/cakedaddy/backend/application.properties << 'EOF'
# Server Configuration
server.port=8080
spring.application.name=cakedaddy

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/cakedaddy
spring.data.mongodb.auto-index-creation=true

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# CORS Configuration
cors.allowed.origins=http://localhost:3000,http://127.0.0.1:5500,http://localhost:8080

# Logging
logging.level.com.cakedaddy=INFO
logging.file.name=/opt/cakedaddy/logs/application.log
EOF
7.5 Create Systemd Service
bash
# Create systemd service file
cat > /etc/systemd/system/cakedaddy.service << 'EOF'
[Unit]
Description=Cakedaddy Bakery Application
After=network.target mongod.target
Wants=mongod.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=/var/www/cakedaddy/backend
ExecStart=/usr/bin/java -jar cakedaddy-1.0.0.jar
ExecStop=/bin/kill -15 $MAINPID
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
7.6 Deploy Backend
bash
# Copy JAR to deployment location
cp /opt/cakedaddy/backend/target/cakedaddy-1.0.0.jar /var/www/cakedaddy/backend/

# Set permissions
chown -R nginx:nginx /var/www/cakedaddy
chmod -R 755 /var/www/cakedaddy

# Reload systemd and start service
systemctl daemon-reload
systemctl enable cakedaddy
systemctl start cakedaddy

# Check status
systemctl status cakedaddy
Step 8: Initialize MongoDB Database
8.1 Create Database and User
bash
# Connect to MongoDB
mongo
Run these commands in MongoDB shell:

javascript
// Switch to admin database (initially no authentication)
use admin

// Create admin user
db.createUser({
  user: "admin",
  pwd: "mongoadmin123",
  roles: ["root"]
})

// Exit and reconnect with authentication
exit
Now connect with authentication:

bash
mongo -u admin -p mongoadmin123 --authenticationDatabase admin
javascript
// Create application database and user
use cakedaddy

db.createUser({
  user: "cakedaddy",
  pwd: "cakedaddy123",
  roles: [
    {
      role: "readWrite",
      db: "cakedaddy"
    },
    {
      role: "dbAdmin", 
      db: "cakedaddy"
    }
  ]
})
8.2 Insert Initial Data
Continue in MongoDB shell:

javascript
// Insert initial admin user
db.users.insertOne({
  username: "admin",
  email: "admin@cakedaddy.com",
  password: "admin123",
  role: "ADMIN",
  phone: "1234567890",
  address: "123 Admin Street",
  createdAt: new Date()
})

// Insert sample products
db.products.insertMany([
  {
    name: "Chocolate Cake",
    description: "Rich and moist chocolate cake with chocolate frosting",
    price: 29.99,
    category: "Cakes",
    imageUrl: "images/chocolate-cake.jpg",
    stockQuantity: 10,
    ratings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Croissant",
    description: "Buttery, flaky French croissant",
    price: 3.99,
    category: "Pastries",
    imageUrl: "images/croissant.jpg", 
    stockQuantity: 25,
    ratings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Classic cookies with chocolate chips",
    price: 12.99,
    category: "Cookies",
    imageUrl: "images/cookies.jpg",
    stockQuantity: 50,
    ratings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sourdough Bread",
    description: "Artisan sourdough bread",
    price: 8.99,
    category: "Breads",
    imageUrl: "images/sourdough.jpg",
    stockQuantity: 15,
    ratings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Verify data insertion
db.users.find()
db.products.find()

// Exit MongoDB
exit
Step 9: Deploy Frontend Application
9.1 Upload Frontend Files
Upload your frontend files to /opt/cakedaddy/frontend/ with this structure:

text
/opt/cakedaddy/frontend/
├── index.html
├── about.html
├── products.html
├── product-detail.html
├── cart.html
├── checkout.html
├── login.html
├── admin.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── products.js
│   ├── product-detail.js
│   ├── cart.js
│   ├── checkout.js
│   ├── auth.js
│   ├── admin.js
│   └── contact.js
└── images/
    ├── placeholder.jpg
    └── (other images)
9.2 Deploy to Web Directory
bash
# Copy frontend files to web directory
cp -r /opt/cakedaddy/frontend/* /var/www/cakedaddy/frontend/

# Set proper permissions
chown -R nginx:nginx /var/www/cakedaddy
chmod -R 755 /var/www/cakedaddy
9.3 Update Frontend Configuration
bash
# Update API_BASE_URL in all JavaScript files
find /var/www/cakedaddy/frontend/js -name "*.js" -exec sed -i 's|const API_BASE_URL = .*|const API_BASE_URL = "/api";|g' {} \;
Step 10: Configure Nginx
10.1 Create Nginx Configuration
bash
# Create clean nginx configuration
cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Cakedaddy Server Configuration
    server {
        listen       80;
        server_name  _;
        root         /var/www/cakedaddy/frontend;
        index        index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Frontend routes - SPA support
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy to Spring Boot backend
        location /api {
            proxy_pass http://localhost:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With" always;
            
            # Handle preflight requests
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "*";
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With";
                add_header Access-Control-Max-Age 86400;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }
        }

        # Static assets with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Deny access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }
}
EOF
10.2 Start Nginx
bash
# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx
Step 11: Configure SELinux (RHEL Specific)
bash
# Check SELinux status
sestatus

# If SELinux is enforcing, set appropriate contexts
semanage fcontext -a -t httpd_sys_content_t "/var/www/cakedaddy/frontend(/.*)?"
restorecon -Rv /var/www/cakedaddy/

# Allow Nginx to connect to backend
setsebool -P httpd_can_network_connect 1
✅ Verification and Testing
11.1 Service Status Check
bash
# Check all services
systemctl status mongod
systemctl status nginx
systemctl status cakedaddy
11.2 Backend API Test
bash
# Test backend directly
curl http://localhost:8080/api/products

# Expected output: JSON array of products or empty array
11.3 Frontend Test
bash
# Test frontend through Nginx
curl http://localhost/

# Test API through Nginx proxy
curl http://localhost/api/products
11.4 Full Application Test
Access Frontend: Open http://your-server-ip/ in browser

Browse Products: Navigate to Products page

Admin Login: Go to http://your-server-ip/login.html

Email: admin@cakedaddy.com

Password: admin123

Test Admin Features: Add products, manage orders

🛠 Maintenance Procedures
Log Monitoring
bash
# Backend logs
journalctl -u cakedaddy -f

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# MongoDB logs  
tail -f /var/log/mongodb/mongod.log

# Application logs
tail -f /opt/cakedaddy/logs/application.log
Backup Procedure
bash
# Create backup directory
mkdir -p /opt/cakedaddy/backups

# Create backup script
cat > /opt/cakedaddy/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/cakedaddy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Starting backup: $DATE"

# MongoDB backup
mongodump --uri="mongodb://localhost:27017/cakedaddy" --out=$BACKUP_DIR/mongodb_$DATE

# Application backup
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz -C /var/www/cakedaddy/frontend .
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz -C /var/www/cakedaddy/backend .

# Create full backup
tar -czf $BACKUP_DIR/cakedaddy_full_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE frontend_$DATE.tar.gz backend_$DATE.tar.gz

# Cleanup
rm -rf $BACKUP_DIR/mongodb_$DATE
rm -f $BACKUP_DIR/frontend_$DATE.tar.gz
rm -f $BACKUP_DIR/backend_$DATE.tar.gz

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/cakedaddy_full_$DATE.tar.gz"
EOF

# Make executable
chmod +x /opt/cakedaddy/backup.sh

# Schedule daily backup at 2 AM
echo "0 2 * * * /opt/cakedaddy/backup.sh >> /opt/cakedaddy/logs/backup.log 2>&1" | crontab -
Service Management
bash
# Restart all services
systemctl restart mongod nginx cakedaddy

# Stop all services
systemctl stop mongod nginx cakedaddy

# Start all services
systemctl start mongod nginx cakedaddy

# Check service status
systemctl status mongod nginx cakedaddy
🔧 Troubleshooting Guide
Common Issues and Solutions
1. Backend Service Won't Start
bash
# Check logs
journalctl -u cakedaddy -f

# Check if port 8080 is available
netstat -tulpn | grep 8080

# Verify JAR file
ls -la /var/www/cakedaddy/backend/cakedaddy-1.0.0.jar

# Test Java execution
cd /var/www/cakedaddy/backend
java -jar cakedaddy-1.0.0.jar
2. Nginx Configuration Errors
bash
# Test configuration
nginx -t

# Check error log
tail -f /var/log/nginx/error.log

# Check if port 80 is available
netstat -tulpn | grep :80

# Kill any processes using port 80
fuser -k 80/tcp
3. MongoDB Connection Issues
bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Test MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check database and collections
mongo cakedaddy --eval "db.getCollectionNames()"
4. Frontend Not Loading
bash
# Check file permissions
ls -la /var/www/cakedaddy/frontend/

# Check Nginx is serving files
curl -I http://localhost/

# Check JavaScript console errors in browser
# (Open browser developer tools)
5. API Calls Failing
bash
# Test backend directly
curl -v http://localhost:8080/api/products

# Test through Nginx proxy
curl -v http://localhost/api/products

# Check CORS headers
curl -I -X OPTIONS http://localhost/api/products
📞 Support Information
Default Admin Credentials
Email: admin@cakedaddy.com

Password: admin123

Important URLs
Main Site: http://your-server-ip/

Admin Login: http://your-server-ip/login.html

API Base: http://your-server-ip/api/

File Locations
Backend JAR: /var/www/cakedaddy/backend/cakedaddy-1.0.0.jar

Frontend Files: /var/www/cakedaddy/frontend/

Logs: /opt/cakedaddy/logs/

Backups: /opt/cakedaddy/backups/

Service Names
Backend: cakedaddy

Web Server: nginx

Database: mongod
