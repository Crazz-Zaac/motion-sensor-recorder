# 🚀 Deployment Guide - Motion Sensor Recorder

Complete deployment instructions for both the frontend application and WebSocket streaming server.

## 📱 Frontend Deployment (Vercel)

### Prerequisites
- GitHub/GitLab account
- Vercel account (free tier available)
- Node.js 18+ locally for testing

### Step 1: Prepare Repository
```bash
# Ensure your project is in a Git repository
cd motion-sensor-app
git init
git add .
git commit -m "Initial commit - Motion Sensor Recorder"

# Push to GitHub/GitLab
git remote add origin https://github.com/yourusername/motion-sensor-recorder.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd motion-sensor-app
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: motion-sensor-recorder
# - Directory: ./
# - Override settings? No
```

#### Option B: Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

### Step 3: Configure Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias your-deployment-url.vercel.app yourdomain.com
```

### Step 4: Environment Variables (If needed)
```bash
# Set environment variables
vercel env add VITE_API_URL production
# Enter your API URL when prompted
```

## 🖥️ WebSocket Server Deployment

### Option 1: Railway (Recommended)

#### Prerequisites
- Railway account
- GitHub repository with server code

#### Deployment Steps
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd sensor-streaming-server
railway init

# Deploy
railway up
```

#### Configuration
1. Add environment variables in Railway dashboard:
   - `PORT`: 8080
   - `FLASK_ENV`: production
2. Configure custom domain if needed
3. Monitor logs in Railway dashboard

### Option 2: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Deployment Steps
```bash
# Login to Heroku
heroku login

# Create app
cd sensor-streaming-server
heroku create your-sensor-server

# Add Python buildpack
heroku buildpacks:set heroku/python

# Create Procfile
echo "web: python src/main.py" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Configuration
```bash
# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set PORT=8080

# Scale dynos
heroku ps:scale web=1
```

### Option 3: DigitalOcean Droplet

#### Prerequisites
- DigitalOcean account
- SSH access to droplet

#### Setup Steps
```bash
# Connect to droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Python and dependencies
apt install python3 python3-pip python3-venv nginx -y

# Clone repository
git clone https://github.com/yourusername/sensor-streaming-server.git
cd sensor-streaming-server

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/sensor-server.service
```

#### Service Configuration
```ini
[Unit]
Description=Motion Sensor Streaming Server
After=network.target

[Service]
User=root
WorkingDirectory=/root/sensor-streaming-server
Environment=PATH=/root/sensor-streaming-server/venv/bin
ExecStart=/root/sensor-streaming-server/venv/bin/python src/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Start Service
```bash
# Enable and start service
sudo systemctl enable sensor-server
sudo systemctl start sensor-server
sudo systemctl status sensor-server

# Configure Nginx (optional)
sudo nano /etc/nginx/sites-available/sensor-server
```

## 🔧 Production Configuration

### Frontend Environment Variables
Create `.env.production` in motion-sensor-app:
```env
VITE_WEBSOCKET_URL=wss://your-server-domain.com
VITE_API_URL=https://your-server-domain.com/api
```

### Server Environment Variables
```env
FLASK_ENV=production
PORT=8080
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://your-frontend-domain.com
```

### Security Considerations

#### Frontend
- HTTPS is required for sensor APIs
- Configure CSP headers for security
- Enable CORS only for trusted domains

#### Server
- Use environment variables for secrets
- Configure firewall rules
- Enable SSL/TLS certificates
- Implement rate limiting

## 📊 Monitoring and Logging

### Frontend Monitoring
```javascript
// Add to main.jsx for error tracking
window.addEventListener('error', (event) => {
  console.error('Frontend Error:', event.error);
  // Send to monitoring service
});
```

### Server Monitoring
```python
# Add to main.py for logging
import logging
logging.basicConfig(level=logging.INFO)

# Monitor WebSocket connections
@socketio.on('connect')
def handle_connect():
    logging.info(f'Client connected: {request.sid}')
```

## 🧪 Testing Deployment

### Frontend Testing
```bash
# Test production build locally
cd motion-sensor-app
npm run build
npm run preview

# Test on mobile device
# Use ngrok for HTTPS testing
npx ngrok http 4173
```

### Server Testing
```bash
# Test WebSocket server
cd sensor-streaming-server
source venv/bin/activate
python src/main.py

# Test endpoints
curl http://localhost:8080/api/status
curl http://localhost:8080/api/sensor-data
```

### Integration Testing
1. Deploy both frontend and server
2. Update frontend WebSocket URL to server domain
3. Test connection from deployed frontend
4. Verify data streaming functionality
5. Test on multiple devices and browsers

## 🔄 Continuous Deployment

### GitHub Actions (Frontend)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Auto-deployment (Server)
- Railway: Automatic deployment on Git push
- Heroku: Automatic deployment on Git push
- DigitalOcean: Use GitHub Actions with SSH

## 📱 Mobile App Considerations

### PWA Configuration
The app is PWA-ready. Users can:
1. Visit the deployed URL on mobile
2. Add to home screen for app-like experience
3. Use offline (limited functionality)

### App Store Distribution
For native app distribution:
1. Use Capacitor to wrap the web app
2. Build for iOS/Android
3. Submit to respective app stores

## 🆘 Troubleshooting Deployment

### Common Issues

#### Frontend
- **Build fails**: Check Node.js version compatibility
- **Sensors not working**: Ensure HTTPS is enabled
- **Large bundle size**: Implement code splitting

#### Server
- **Port conflicts**: Change PORT environment variable
- **Memory issues**: Increase server resources
- **CORS errors**: Configure allowed origins

### Debug Commands
```bash
# Check frontend build
npm run build -- --debug

# Check server logs
heroku logs --tail  # Heroku
railway logs        # Railway

# Test WebSocket connection
wscat -c wss://your-server-domain.com
```

## 📈 Scaling Considerations

### Frontend
- Use CDN for static assets
- Implement service worker for caching
- Optimize bundle size with code splitting

### Server
- Use Redis for session storage
- Implement horizontal scaling
- Add load balancer for multiple instances
- Use database for persistent data storage

---

**Next Steps**: After deployment, test thoroughly on multiple devices and browsers to ensure full functionality.

