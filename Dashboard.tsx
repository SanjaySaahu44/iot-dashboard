"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Activity, Thermometer, Zap, Volume2, Settings, Plus, RefreshCw } from "lucide-react"

interface SensorData {
  id: string
  vibration: number
  temperature: number
  torque: number
  current: number
  noise: number
  label: number
}

interface FormData {
  vibration: string
  temperature: string
  torque: string
  current: string
  noise: string
}

const API_ENDPOINT = "https://um1acxhydh.execute-api.eu-north-1.amazonaws.com/prod"

export default function IoTDashboard() {
  const [data, setData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    vibration: "",
    temperature: "",
    torque: "",
    current: "",
    noise: "",
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "fetch" }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const newData = {
        id: `sensor_${Date.now()}`,
        vibration: Number.parseFloat(formData.vibration),
        temperature: Number.parseFloat(formData.temperature),
        torque: Number.parseFloat(formData.torque),
        current: Number.parseFloat(formData.current),
        noise: Number.parseFloat(formData.noise),
        label: 0, // Default to normal
      }

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Add the new data to the local state
      setData((prev) => [newData, ...prev])

      // Reset form
      setFormData({
        vibration: "",
        temperature: "",
        torque: "",
        current: "",
        noise: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit data")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate summary statistics
  const summaryStats = {
    vibration: {
      avg: data.length > 0 ? (data.reduce((sum, item) => sum + item.vibration, 0) / data.length).toFixed(2) : "0",
      anomalies: data.filter((item) => item.label === 1).length,
    },
    temperature: {
      avg: data.length > 0 ? (data.reduce((sum, item) => sum + item.temperature, 0) / data.length).toFixed(2) : "0",
      max: data.length > 0 ? Math.max(...data.map((item) => item.temperature)).toFixed(2) : "0",
    },
    torque: {
      avg: data.length > 0 ? (data.reduce((sum, item) => sum + item.torque, 0) / data.length).toFixed(2) : "0",
      max: data.length > 0 ? Math.max(...data.map((item) => item.torque)).toFixed(2) : "0",
    },
    current: {
      avg: data.length > 0 ? (data.reduce((sum, item) => sum + item.current, 0) / data.length).toFixed(2) : "0",
      max: data.length > 0 ? Math.max(...data.map((item) => item.current)).toFixed(2) : "0",
    },
    noise: {
      avg: data.length > 0 ? (data.reduce((sum, item) => sum + item.noise, 0) / data.length).toFixed(2) : "0",
      max: data.length > 0 ? Math.max(...data.map((item) => item.noise)).toFixed(2) : "0",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">IoT Assembly Line Monitor</h1>
            <p className="text-gray-600">Real-time monitoring of robotic arm sensors</p>
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vibration</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.vibration.avg}</div>
              <p className="text-xs text-muted-foreground">{summaryStats.vibration.anomalies} anomalies detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.temperature.avg}°C</div>
              <p className="text-xs text-muted-foreground">Max: {summaryStats.temperature.max}°C</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Torque</CardTitle>
              <Settings className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.torque.avg}</div>
              <p className="text-xs text-muted-foreground">Max: {summaryStats.torque.max}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.current.avg}A</div>
              <p className="text-xs text-muted-foreground">Max: {summaryStats.current.max}A</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Noise</CardTitle>
              <Volume2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.noise.avg}dB</div>
              <p className="text-xs text-muted-foreground">Max: {summaryStats.noise.max}dB</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sensor Data</CardTitle>
                <CardDescription>Recent sensor readings from robotic arms</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading sensor data...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Vibration</TableHead>
                          <TableHead>Temperature</TableHead>
                          <TableHead>Torque</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Noise</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No sensor data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">{item.id}</TableCell>
                              <TableCell>{item.vibration.toFixed(2)}</TableCell>
                              <TableCell>{item.temperature.toFixed(2)}°C</TableCell>
                              <TableCell>{item.torque.toFixed(2)}</TableCell>
                              <TableCell>{item.current.toFixed(2)}A</TableCell>
                              <TableCell>{item.noise.toFixed(2)}dB</TableCell>
                              <TableCell>
                                <Badge variant={item.label === 1 ? "destructive" : "secondary"}>
                                  {item.label === 1 ? "Anomaly" : "Normal"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Data Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Sensor Data
                </CardTitle>
                <CardDescription>Submit new sensor readings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vibration">Vibration</Label>
                    <Input
                      id="vibration"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.vibration}
                      onChange={(e) => handleInputChange("vibration", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange("temperature", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="torque">Torque</Label>
                    <Input
                      id="torque"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.torque}
                      onChange={(e) => handleInputChange("torque", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current">Current (A)</Label>
                    <Input
                      id="current"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.current}
                      onChange={(e) => handleInputChange("current", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noise">Noise (dB)</Label>
                    <Input
                      id="noise"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.noise}
                      onChange={(e) => handleInputChange("noise", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Data
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
