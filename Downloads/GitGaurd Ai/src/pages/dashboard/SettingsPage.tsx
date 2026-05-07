import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Zap, Thermometer, FileCode, Clock, Save, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStore } from '@/store/dashboardStore'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SettingsPage() {
  const {
    settings,
    isLoadingSettings,
    error,
    fetchSettings,
    updateSettings,
    clearError,
  } = useDashboardStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSave = async () => {
    await updateSettings(settings)
    toast.success('Settings saved successfully')
  }

  const handleThresholdChange = (value: string) => {
    updateSettings({ severityThreshold: value })
  }

  const handleToggle = (key: 'autoComments' | 'autoFixes', value: boolean) => {
    updateSettings({ [key]: value })
  }

  const handleNumberChange = (
    key: 'llmTemperature' | 'maxDiffSize' | 'reviewDelay',
    value: number
  ) => {
    updateSettings({ [key]: value })
  }

  if (isLoadingSettings && !settings.severityThreshold) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your GitGuard AI preferences</p>
        </div>
        <button
          onClick={() => {
            fetchSettings()
            toast.success('Settings refreshed')
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          disabled={isLoadingSettings}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingSettings ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Severity Threshold */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Severity Threshold</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum severity level to report issues
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleThresholdChange(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.severityThreshold === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Auto Comments */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Auto Comments</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically post review comments on pull requests
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoComments', !settings.autoComments)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoComments ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoComments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Auto Fixes */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Auto Fixes</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply fixes for detected issues
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoFixes', !settings.autoFixes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoFixes ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoFixes ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* LLM Temperature */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <CardTitle>LLM Temperature</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Controls randomness in AI responses (0.0 - 2.0)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.llmTemperature}
                onChange={(e) => handleNumberChange('llmTemperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Precise (0.0)</span>
                <span className="font-medium text-foreground">{settings.llmTemperature}</span>
                <span>Creative (2.0)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Max Diff Size */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle>Max Diff Size</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum number of lines to analyze per pull request
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={settings.maxDiffSize}
                onChange={(e) => handleNumberChange('maxDiffSize', parseInt(e.target.value))}
                className="w-32 px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-sm text-muted-foreground">lines</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Delay */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              <CardTitle>Review Delay</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Delay before starting review (seconds) - useful for CI completion
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="300"
                step="10"
                value={settings.reviewDelay}
                onChange={(e) => handleNumberChange('reviewDelay', parseInt(e.target.value))}
                className="w-32 px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </motion.div>
    </motion.div>
  )
}
