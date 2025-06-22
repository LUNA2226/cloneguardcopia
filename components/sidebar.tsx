"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  AlertCircle,
  Globe,
  Shield,
  Settings,
  CreditCard,
  Bell,
  LogOut,
  BookOpen,
  Users,
  X,
} from "lucide-react"
import { AccountModal } from "./account-modal"

interface SidebarProps {
  activeScreen: string
  setActiveScreen: (screen: string) => void
}

export function Sidebar({ activeScreen, setActiveScreen }: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [notifications] = useState([
    {
      id: 1,
      title: "Nova tentativa de clone detectada",
      description: "Site: minhapagina.com.br",
      time: "2 min atrás",
      unread: true,
    },
    {
      id: 2,
      title: "Proteção ativada com sucesso",
      description: "Domain: ofertaespecial.com",
      time: "1 hora atrás",
      unread: true,
    },
    {
      id: 3,
      title: "Atualização de segurança",
      description: "Novas features disponíveis",
      time: "2 horas atrás",
      unread: false,
    },
  ])

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "realtime",
      label: "Alerts",
      icon: <AlertCircle size={20} />,
    },
    {
      id: "domains",
      label: "Protected Sites",
      icon: <Globe size={20} />,
    },
    {
      id: "clones",
      label: "Clone Sites",
      icon: <Shield size={20} />,
    },
    {
      id: "tutorials",
      label: "Tutorials",
      icon: <BookOpen size={20} />,
    },
    {
      id: "partners",
      label: "Partners",
      icon: <Users size={20} />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
    },
    {
      id: "subscription",
      label: "My Plans",
      icon: <CreditCard size={20} />,
    },
  ]

  return (
    <div className="w-64 bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <Shield className="text-cyan-400 mr-2" size={24} />
          <h1 className="text-xl font-bold text-cyan-400">CloneGuard</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Anti-cloning Protection</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveScreen(item.id)}
                className={`flex items-center w-full px-4 py-3 text-sm ${
                  activeScreen === item.id
                    ? "bg-gray-700 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-700">
        {/* Domain Usage Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Domain Usage</span>
            <span className="text-xs font-medium text-cyan-400">3/5</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: "60%" }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Premium Plan</p>
        </div>

        {/* Profile Section */}
        <div className="flex items-center mb-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-400" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping"></span>
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium">Notificações</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                        notification.unread ? "bg-gray-750/50" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        {notification.unread && <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-2"></div>}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-200">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-700">
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 w-full text-center">
                    Ver todas notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAccountModal(true)}
            className="ml-auto flex items-center space-x-3 hover:opacity-80"
          >
            <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center">
              <span className="font-semibold">JD</span>
            </div>
          </button>
        </div>

        <button className="flex items-center text-gray-400 hover:text-white text-sm">
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
      {showAccountModal && <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />}
    </div>
  )
}
