# 🎯 Motion Sensor Recorder - Enhanced Version

A comprehensive mobile-friendly motion sensor recording application with live data visualization, activity management, sampling rate control, and real-time data streaming capabilities.

## ✨ Features

### 🔧 Enhanced Sensor Support
- **8 Different Sensor Types**: Accelerometer, Gyroscope, Magnetometer, Linear Acceleration, Absolute Orientation, Relative Orientation, Ambient Light, Gravity
- **Dynamic Sensor Selection**: Choose which sensors to record from in real-time
- **Fallback Support**: Automatic fallback to DeviceMotion/DeviceOrientation APIs for older browsers
- **Permission Handling**: Automatic sensor permission requests for iOS devices

### 📊 Live Data Visualization
- **Real-time Charts**: Live sensor data visualization using Recharts
- **Multi-axis Display**: X, Y, Z axis data for motion sensors
- **Chart Legends**: Color-coded legends for easy data interpretation
- **Responsive Charts**: Mobile-optimized chart display

### ⚡ Sampling Rate Control
- **Adjustable Frequency**: 1-100 Hz sampling rate control
- **Real-time Updates**: Change sampling rate during recording
- **Visual Feedback**: Display current frequency and interval
- **Performance Optimization**: Efficient data collection at high frequencies

### 🎯 Activity Management
- **Custom Activities**: Create and name custom activities (Walking, Running, Biking, etc.)
- **Dynamic Switching**: Switch activities during recording without stopping
- **Activity Markers**: Clear activity switch markers in exported data
- **Session Tracking**: Separate data tracking per activity session

### 🎮 Recording Controls
- **Start/Stop Recording**: Simple recording controls with visual feedback
- **Session Management**: Automatic data segmentation by session
- **Real-time Counters**: Live data point counting during recording
- **Status Indicators**: Clear recording status display

### 📡 Data Streaming
- **Real-time Streaming**: Stream sensor data to external servers via WebSocket/SocketIO
- **IP Configuration**: Configurable IP address and port settings
- **Connection Status**: Visual connection status indicators
- **Protocol Support**: SocketIO for reliable real-time communication

### 📁 Data Export
- **Multiple Formats**: CSV and TXT export options
- **Structured Data**: Timestamps, activity information, and sensor readings
- **Session Information**: Duration, activity, and data point counts
- **Easy Download**: One-click data export functionality

### 📱 Mobile Optimization
- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly**: Large touch targets for mobile interaction
- **Progressive Web App**: PWA-ready for mobile installation
- **Cross-platform**: Works on iOS, Android, and desktop browsers

## 🚀 Quick Start

### Frontend Application

1. **Install Dependencies**
   ```bash
   cd motion-sensor-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

### WebSocket Server (Optional)

1. **Setup Server**
   ```bash
   cd sensor-streaming-server
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Start Server**
   ```bash
   python src/main.py
   ```

3. **Access Server Interface**
   - Open http://localhost:8080 for server monitoring
   - WebSocket endpoint: ws://localhost:8080

## 📋 Usage Instructions

### Basic Recording

1. **Select Sensors**: Choose which sensors to record from
2. **Set Sampling Rate**: Adjust the data collection frequency (1-100 Hz)
3. **Choose Activity**: Select or create a custom activity
4. **Start Recording**: Click "Start Recording" to begin data collection
5. **Monitor Live Data**: View real-time sensor readings in the chart
6. **Stop Recording**: Click "Stop Recording" to end the session
7. **Export Data**: Choose format (CSV/TXT) and download your data

### Advanced Features

#### Dynamic Activity Switching
- Start recording with one activity
- Switch to a different activity during recording using the dropdown
- Activity changes are marked in the exported data

#### Data Streaming
- Enter the IP address and port of your WebSocket server
- Click "Connect" to establish streaming connection
- All recorded data will be streamed in real-time during recording
- Monitor connection status with visual indicators

#### Sampling Rate Optimization
- Use lower rates (1-10 Hz) for battery conservation
- Use higher rates (50-100 Hz) for detailed motion analysis
- Adjust based on your specific use case requirements

## 🔧 Technical Details

### Sensor APIs Used
- **Generic Sensor API**: Primary sensor access method
- **DeviceMotionEvent**: Fallback for accelerometer and gyroscope
- **DeviceOrientationEvent**: Fallback for orientation data
- **Permission API**: Sensor permission handling

### Data Format
```json
{
  "timestamp": 1625097600000,
  "activity": "Walking",
  "sensorType": "accelerometer",
  "x": 0.123,
  "y": -0.456,
  "z": 9.789
}
```

### Streaming Protocol
- **Transport**: SocketIO over WebSocket
- **Events**: 
  - `sensor_data`: Real-time sensor data
  - `connection_response`: Connection confirmation
  - `data_received`: Data receipt confirmation

## 🌐 Deployment

### Vercel Deployment (Frontend)

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Automatic deployment on push
   - HTTPS enabled by default for sensor access

### WebSocket Server Deployment

The WebSocket server can be deployed to:
- **Heroku**: Using Python buildpack
- **Railway**: Direct Python deployment
- **DigitalOcean**: VPS with Python environment
- **AWS EC2**: Custom server setup

## 📱 Mobile Considerations

### HTTPS Requirement
- Sensor APIs require HTTPS in production
- Use Vercel, Netlify, or similar for automatic HTTPS
- Local development works with HTTP

### iOS Permissions
- Requires user interaction to request sensor permissions
- Use the "Request Permissions" button before recording
- Some sensors may not be available on all devices

### Android Support
- Most sensors work without additional permissions
- Chrome and Firefox recommended browsers
- Samsung Internet also supported

## 🔍 Troubleshooting

### Sensors Not Working
1. Ensure HTTPS is enabled (production)
2. Click "Request Permissions" button
3. Check browser compatibility
4. Verify device has required sensors

### Streaming Connection Issues
1. Verify WebSocket server is running
2. Check IP address and port configuration
3. Ensure firewall allows connections
4. Test with localhost first

### Performance Issues
1. Reduce sampling rate for better performance
2. Limit number of active sensors
3. Clear browser cache and reload
4. Use modern browser versions

## 📊 Browser Compatibility

| Browser | Accelerometer | Gyroscope | Magnetometer | Other Sensors |
|---------|---------------|-----------|--------------|---------------|
| Chrome 91+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ✅ | ❌ | ⚠️ |
| Safari 14+ | ⚠️ | ⚠️ | ❌ | ❌ |
| Edge 91+ | ✅ | ✅ | ✅ | ✅ |

✅ Full Support | ⚠️ Limited Support | ❌ Not Supported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser compatibility
3. Test with different devices
4. Check console for error messages

---

**Built with**: React, Vite, Tailwind CSS, Shadcn/UI, Recharts, SocketIO, Flask
**Tested on**: Chrome, Firefox, Edge, Safari (iOS/macOS)
**Deployment**: Vercel-ready with automatic HTTPS

