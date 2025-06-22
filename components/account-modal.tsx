"use client"

import type React from "react"

import { useState } from "react"
import { X, Camera, Eye, EyeOff, Globe, Bell, FileText, Shield, User } from "lucide-react"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const [profileImage, setProfileImage] = useState("")

  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "preferences", label: "Preferences", icon: <Globe size={16} /> },
    { id: "legal", label: "Legal", icon: <FileText size={16} /> },
  ]

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    console.log("Saving account settings:", { formData, language, notifications, profileImage })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-cyan-500 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-white">JD</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-1 bg-cyan-600 rounded-full cursor-pointer hover:bg-cyan-500 transition-colors">
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Profile Picture</h3>
                  <p className="text-sm text-gray-400">Upload a new profile picture</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>

                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Interface Language</label>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <label
                      key={lang.code}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        language === lang.code
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                          : "border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={language === lang.code}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-xl mr-3">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-center">
                  <Bell className="text-cyan-400 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Receive notifications about clone detection</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="space-y-4">
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-400 mb-3">Review our terms of service and user agreement.</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                  View Terms of Service →
                </button>
              </div>

              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-400 mb-3">Learn how we collect, use, and protect your data.</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">View Privacy Policy →</button>
              </div>

              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Data Export</h3>
                <p className="text-sm text-gray-400 mb-3">Download a copy of your account data and settings.</p>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Request Data Export →</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
