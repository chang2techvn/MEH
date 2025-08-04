export interface ThemeSettings {
  mode: "light" | "dark" | "system"
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontSize: "small" | "medium" | "large"
  borderRadius: number
  shadowIntensity: number
  reducedMotion: boolean
}

export interface GeneralSettings {
  platformName: string
  supportEmail: string
  defaultLanguage: string
  timeZone: string
  maintenanceMode: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  challengeReminders: boolean
  feedbackAlerts: boolean
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  passwordExpiry: string
  sessionTimeout: string
  loginAttempts: string
}

export interface ThemeColor {
  name: string
  value: string
}

export interface ThemePreset {
  name: string
  description?: string
  primary: string
  secondary: string
  accent: string
}
