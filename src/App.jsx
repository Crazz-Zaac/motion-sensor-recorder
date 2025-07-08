import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Play, Square, Download, Plus, Activity, Smartphone, BarChart3, Wifi } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

function App() {
  // State management
  const [isRecording, setIsRecording] = useState(false)
  const [currentActivity, setCurrentActivity] = useState('')
  const [activities, setActivities] = useState(['Walking', 'Running', 'Biking', 'Standing', 'Sitting'])
  const [newActivityName, setNewActivityName] = useState('')
  const [selectedSensors, setSelectedSensors] = useState({
    accelerometer: true,
    gyroscope: true,
    magnetometer: false,
    linearAcceleration: false,
    absoluteOrientation: false,
    relativeOrientation: false,
    ambientLight: false,
    gravity: false
  })
  const [exportFormat, setExportFormat] = useState('csv')
  const [recordedData, setRecordedData] = useState([])
  const [sessionData, setSessionData] = useState([])
  const [liveData, setLiveData] = useState([])
  const [samplingRate, setSamplingRate] = useState([50]) // Hz
  const [streamingEnabled, setStreamingEnabled] = useState(false)
  const [streamingIP, setStreamingIP] = useState('localhost')
  const [streamingPort, setStreamingPort] = useState('8080')
  
  const [sensorSupport, setSensorSupport] = useState({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    linearAcceleration: false,
    absoluteOrientation: false,
    relativeOrientation: false,
    ambientLight: false,
    gravity: false
  })

  const [sensorInstances, setSensorInstances] = useState({})
  const intervalRef = useRef(null)
  const sessionStartTime = useRef(null)
  const wsRef = useRef(null)

  // Check sensor support
  useEffect(() => {
    checkSensorSupport()
    return () => {
      // Cleanup sensors on unmount
      Object.values(sensorInstances).forEach(sensor => {
        if (sensor && sensor.stop) {
          sensor.stop()
        }
      })
    }
  }, [])

  const checkSensorSupport = async () => {
    const support = {
      accelerometer: 'Accelerometer' in window,
      gyroscope: 'Gyroscope' in window,
      magnetometer: 'Magnetometer' in window,
      linearAcceleration: 'LinearAccelerationSensor' in window,
      absoluteOrientation: 'AbsoluteOrientationSensor' in window,
      relativeOrientation: 'RelativeOrientationSensor' in window,
      ambientLight: 'AmbientLightSensor' in window,
      gravity: 'GravitySensor' in window
    }

    // Fallback to DeviceMotion/DeviceOrientation for older browsers
    if (!support.accelerometer) {
      support.accelerometer = 'DeviceMotionEvent' in window
    }
    if (!support.gyroscope) {
      support.gyroscope = 'DeviceOrientationEvent' in window
    }

    setSensorSupport(support)
  }

  const requestPermissions = async () => {
    // Request permissions for iOS devices
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission()
        console.log('DeviceMotion permission:', permission)
      } catch (error) {
        console.log('Permission request failed:', error)
      }
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        console.log('DeviceOrientation permission:', permission)
      } catch (error) {
        console.log('Permission request failed:', error)
      }
    }
  }

  const initializeSensors = async () => {
    const instances = {}
    const frequency = samplingRate[0]

    try {
      // Initialize Generic Sensor API sensors
      if (selectedSensors.accelerometer && sensorSupport.accelerometer && 'Accelerometer' in window) {
        instances.accelerometer = new Accelerometer({ frequency })
        instances.accelerometer.addEventListener('reading', () => {
          updateLiveData('accelerometer', {
            x: instances.accelerometer.x || 0,
            y: instances.accelerometer.y || 0,
            z: instances.accelerometer.z || 0
          })
        })
        instances.accelerometer.start()
      }

      if (selectedSensors.gyroscope && sensorSupport.gyroscope && 'Gyroscope' in window) {
        instances.gyroscope = new Gyroscope({ frequency })
        instances.gyroscope.addEventListener('reading', () => {
          updateLiveData('gyroscope', {
            x: instances.gyroscope.x || 0,
            y: instances.gyroscope.y || 0,
            z: instances.gyroscope.z || 0
          })
        })
        instances.gyroscope.start()
      }

      if (selectedSensors.magnetometer && sensorSupport.magnetometer && 'Magnetometer' in window) {
        instances.magnetometer = new Magnetometer({ frequency })
        instances.magnetometer.addEventListener('reading', () => {
          updateLiveData('magnetometer', {
            x: instances.magnetometer.x || 0,
            y: instances.magnetometer.y || 0,
            z: instances.magnetometer.z || 0
          })
        })
        instances.magnetometer.start()
      }

      if (selectedSensors.linearAcceleration && sensorSupport.linearAcceleration && 'LinearAccelerationSensor' in window) {
        instances.linearAcceleration = new LinearAccelerationSensor({ frequency })
        instances.linearAcceleration.addEventListener('reading', () => {
          updateLiveData('linearAcceleration', {
            x: instances.linearAcceleration.x || 0,
            y: instances.linearAcceleration.y || 0,
            z: instances.linearAcceleration.z || 0
          })
        })
        instances.linearAcceleration.start()
      }

      if (selectedSensors.absoluteOrientation && sensorSupport.absoluteOrientation && 'AbsoluteOrientationSensor' in window) {
        instances.absoluteOrientation = new AbsoluteOrientationSensor({ frequency })
        instances.absoluteOrientation.addEventListener('reading', () => {
          updateLiveData('absoluteOrientation', {
            quaternion: instances.absoluteOrientation.quaternion || [0, 0, 0, 1]
          })
        })
        instances.absoluteOrientation.start()
      }

      if (selectedSensors.relativeOrientation && sensorSupport.relativeOrientation && 'RelativeOrientationSensor' in window) {
        instances.relativeOrientation = new RelativeOrientationSensor({ frequency })
        instances.relativeOrientation.addEventListener('reading', () => {
          updateLiveData('relativeOrientation', {
            quaternion: instances.relativeOrientation.quaternion || [0, 0, 0, 1]
          })
        })
        instances.relativeOrientation.start()
      }

      if (selectedSensors.ambientLight && sensorSupport.ambientLight && 'AmbientLightSensor' in window) {
        instances.ambientLight = new AmbientLightSensor({ frequency })
        instances.ambientLight.addEventListener('reading', () => {
          updateLiveData('ambientLight', {
            illuminance: instances.ambientLight.illuminance || 0
          })
        })
        instances.ambientLight.start()
      }

      if (selectedSensors.gravity && sensorSupport.gravity && 'GravitySensor' in window) {
        instances.gravity = new GravitySensor({ frequency })
        instances.gravity.addEventListener('reading', () => {
          updateLiveData('gravity', {
            x: instances.gravity.x || 0,
            y: instances.gravity.y || 0,
            z: instances.gravity.z || 0
          })
        })
        instances.gravity.start()
      }

    } catch (error) {
      console.log('Error initializing sensors:', error)
      // Fallback to DeviceMotion/DeviceOrientation
      initializeFallbackSensors()
    }

    setSensorInstances(instances)
  }

  const initializeFallbackSensors = () => {
    // Fallback for older browsers using DeviceMotion/DeviceOrientation
    if (selectedSensors.accelerometer) {
      window.addEventListener('devicemotion', handleDeviceMotion)
    }
    if (selectedSensors.gyroscope) {
      window.addEventListener('deviceorientation', handleDeviceOrientation)
    }
  }

  const handleDeviceMotion = (event) => {
    if (event.acceleration) {
      updateLiveData('accelerometer', {
        x: event.acceleration.x || 0,
        y: event.acceleration.y || 0,
        z: event.acceleration.z || 0
      })
    }
    if (event.accelerationIncludingGravity) {
      updateLiveData('accelerometerWithGravity', {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0
      })
    }
    if (event.rotationRate) {
      updateLiveData('gyroscope', {
        x: event.rotationRate.alpha || 0,
        y: event.rotationRate.beta || 0,
        z: event.rotationRate.gamma || 0
      })
    }
  }

  const handleDeviceOrientation = (event) => {
    updateLiveData('orientation', {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    })
  }

  const updateLiveData = (sensorType, data) => {
    const timestamp = Date.now()
    const dataPoint = {
      timestamp,
      activity: currentActivity,
      sensorType,
      ...data
    }

    // Update live data for charts (keep last 100 points)
    setLiveData(prev => {
      const newData = [...prev, dataPoint].slice(-100)
      return newData
    })

    // Add to session data if recording
    if (isRecording) {
      setSessionData(prev => [...prev, dataPoint])
      
      // Stream data if enabled
      if (streamingEnabled && wsRef.current && wsRef.current.connected) {
        wsRef.current.emit('sensor_data', dataPoint)
      }
    }
  }

  const addActivity = () => {
    if (newActivityName.trim() && !activities.includes(newActivityName.trim())) {
      setActivities([...activities, newActivityName.trim()])
      setNewActivityName('')
    }
  }

  const handleSensorChange = (sensor, checked) => {
    setSelectedSensors(prev => ({
      ...prev,
      [sensor]: checked
    }))
  }

  const startRecording = async () => {
    if (!currentActivity) {
      alert('Please select an activity before starting recording')
      return
    }

    await requestPermissions()
    await initializeSensors()

    setIsRecording(true)
    sessionStartTime.current = Date.now()
    setSessionData([])
    setLiveData([])
  }

  const stopRecording = () => {
    setIsRecording(false)
    
    // Stop all sensors
    Object.values(sensorInstances).forEach(sensor => {
      if (sensor && sensor.stop) {
        sensor.stop()
      }
    })

    // Remove fallback event listeners
    window.removeEventListener('devicemotion', handleDeviceMotion)
    window.removeEventListener('deviceorientation', handleDeviceOrientation)

    // Save session data to recorded data
    if (sessionData.length > 0) {
      const sessionInfo = {
        id: Date.now(),
        activity: currentActivity,
        startTime: sessionStartTime.current,
        endTime: Date.now(),
        data: [...sessionData],
        samplingRate: samplingRate[0]
      }
      setRecordedData(prev => [...prev, sessionInfo])
      setSessionData([])
    }

    setSensorInstances({})
  }

  const switchActivity = (newActivity) => {
    if (isRecording && newActivity !== currentActivity) {
      // Add a marker for activity switch
      const switchMarker = {
        timestamp: Date.now(),
        activity: newActivity,
        activitySwitch: true,
        previousActivity: currentActivity
      }
      setSessionData(prev => [...prev, switchMarker])
    }
    setCurrentActivity(newActivity)
  }

  const connectWebSocket = () => {
    try {
      const serverUrl = `http://${streamingIP}:${streamingPort}`
      wsRef.current = window.io(serverUrl)
      
      wsRef.current.on('connect', () => {
        console.log('SocketIO connected')
        setStreamingEnabled(true)
      })
      
      wsRef.current.on('disconnect', () => {
        console.log('SocketIO disconnected')
        setStreamingEnabled(false)
      })
      
      wsRef.current.on('connection_response', (data) => {
        console.log('Connection response:', data)
      })
      
      wsRef.current.on('data_received', (data) => {
        console.log('Data received confirmation:', data)
      })
      
      wsRef.current.on('connect_error', (error) => {
        console.log('SocketIO connection error:', error)
        setStreamingEnabled(false)
      })
    } catch (error) {
      console.log('Failed to connect SocketIO:', error)
      setStreamingEnabled(false)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }
    setStreamingEnabled(false)
  }

  const exportData = () => {
    if (recordedData.length === 0) {
      alert('No data to export')
      return
    }

    let content = ''
    let filename = `motion_sensor_data.${exportFormat}`

    if (exportFormat === 'csv') {
      content = generateCSV()
    } else if (exportFormat === 'txt') {
      content = generateTXT()
    } else if (exportFormat === 'json') {
      content = generateJSON()
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateCSV = () => {
    let csv = 'Timestamp,Activity,SensorType,X,Y,Z,Alpha,Beta,Gamma,Quaternion,Illuminance,Session_ID,Sampling_Rate\n'
    
    recordedData.forEach(session => {
      session.data.forEach(dataPoint => {
        if (dataPoint.activitySwitch) {
          csv += `${new Date(dataPoint.timestamp).toISOString()},${dataPoint.activity},ACTIVITY_SWITCH,,,,,,,,,${session.id},${session.samplingRate}\n`
        } else {
          const row = [
            new Date(dataPoint.timestamp).toISOString(),
            dataPoint.activity,
            dataPoint.sensorType,
            dataPoint.x || '',
            dataPoint.y || '',
            dataPoint.z || '',
            dataPoint.alpha || '',
            dataPoint.beta || '',
            dataPoint.gamma || '',
            dataPoint.quaternion ? JSON.stringify(dataPoint.quaternion) : '',
            dataPoint.illuminance || '',
            session.id,
            session.samplingRate
          ]
          csv += row.join(',') + '\n'
        }
      })
    })
    
    return csv
  }

  const generateTXT = () => {
    let txt = 'Motion Sensor Recording Data\n'
    txt += '================================\n\n'
    
    recordedData.forEach(session => {
      txt += `Session ID: ${session.id}\n`
      txt += `Activity: ${session.activity}\n`
      txt += `Start Time: ${new Date(session.startTime).toISOString()}\n`
      txt += `End Time: ${new Date(session.endTime).toISOString()}\n`
      txt += `Duration: ${((session.endTime - session.startTime) / 1000).toFixed(2)} seconds\n`
      txt += `Sampling Rate: ${session.samplingRate} Hz\n`
      txt += `Data Points: ${session.data.length}\n\n`
      
      session.data.forEach(dataPoint => {
        if (dataPoint.activitySwitch) {
          txt += `[${new Date(dataPoint.timestamp).toISOString()}] ACTIVITY SWITCH: ${dataPoint.previousActivity} -> ${dataPoint.activity}\n`
        } else {
          txt += `[${new Date(dataPoint.timestamp).toISOString()}] ${dataPoint.sensorType}: ${JSON.stringify(dataPoint)}\n`
        }
      })
      txt += '\n---\n\n'
    })
    
    return txt
  }

  const generateJSON = () => {
    return JSON.stringify(recordedData, null, 2)
  }

  // Prepare chart data
  const chartData = liveData.slice(-50).map((point, index) => ({
    time: index,
    x: point.x || 0,
    y: point.y || 0,
    z: point.z || 0,
    alpha: point.alpha || 0,
    beta: point.beta || 0,
    gamma: point.gamma || 0
  }))

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Motion Sensor Recorder</h1>
          </div>
          <p className="text-muted-foreground">Record and analyze device motion data with live visualization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Sensor Support Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sensor Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(sensorSupport).map(([sensor, supported]) => (
                    <div key={sensor} className="flex items-center justify-between">
                      <span className="capitalize">{sensor.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant={supported ? "default" : "secondary"}>
                        {supported ? "Supported" : "Not Supported"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={requestPermissions} className="w-full">
                    Request Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sensor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Sensors</CardTitle>
                <CardDescription>Choose which sensors to record from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedSensors).map(([sensor, checked]) => (
                    <div key={sensor} className="flex items-center space-x-2">
                      <Checkbox
                        id={sensor}
                        checked={checked}
                        onCheckedChange={(checked) => handleSensorChange(sensor, checked)}
                        disabled={!sensorSupport[sensor]}
                      />
                      <Label htmlFor={sensor} className="text-sm">
                        {sensor.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sampling Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sampling Rate</CardTitle>
                <CardDescription>Set the data collection frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Frequency: {samplingRate[0]} Hz</Label>
                    <Badge variant="outline">{(1000/samplingRate[0]).toFixed(1)}ms interval</Badge>
                  </div>
                  <Slider
                    value={samplingRate}
                    onValueChange={setSamplingRate}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Management</CardTitle>
                <CardDescription>Create and select activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add new activity */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter activity name"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                    />
                    <Button onClick={addActivity} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Activity selection */}
                  <div>
                    <Label>Current Activity</Label>
                    <Select value={currentActivity} onValueChange={switchActivity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map((activity) => (
                          <SelectItem key={activity} value={activity}>
                            {activity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Current activity display */}
                  {currentActivity && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Current: {currentActivity}</span>
                      {isRecording && (
                        <Badge variant="destructive" className="animate-pulse">
                          Recording
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recording Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={startRecording}
                    disabled={isRecording || !currentActivity}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                  <Button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                </div>
                
                {isRecording && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Recording {currentActivity}... ({sessionData.length} data points)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Data Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Live Sensor Data
                </CardTitle>
                <CardDescription>Real-time sensor readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="x" stroke="#8884d8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="z" stroke="#ffc658" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Data Streaming */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Data Streaming
                </CardTitle>
                <CardDescription>Stream data to external server via WebSocket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>IP Address</Label>
                      <Input
                        value={streamingIP}
                        onChange={(e) => setStreamingIP(e.target.value)}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div>
                      <Label>Port</Label>
                      <Input
                        value={streamingPort}
                        onChange={(e) => setStreamingPort(e.target.value)}
                        placeholder="8080"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={connectWebSocket}
                      disabled={streamingEnabled}
                      className="flex-1"
                    >
                      Connect
                    </Button>
                    <Button
                      onClick={disconnectWebSocket}
                      disabled={!streamingEnabled}
                      variant="outline"
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${streamingEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {streamingEnabled ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Export</CardTitle>
                <CardDescription>Export recorded data in your preferred format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="txt">TXT</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={exportData} className="w-full" disabled={recordedData.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data ({recordedData.length} sessions)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Summary */}
            {recordedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recorded Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recordedData.slice(-3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{session.activity}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.startTime).toLocaleTimeString()} - {session.data.length} points @ {session.samplingRate}Hz
                          </p>
                        </div>
                        <Badge variant="outline">
                          {((session.endTime - session.startTime) / 1000).toFixed(1)}s
                        </Badge>
                      </div>
                    ))}
                    {recordedData.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ...and {recordedData.length - 3} more sessions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

