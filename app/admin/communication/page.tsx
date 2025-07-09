"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth, hasPermission } from "@/lib/auth"
import { AuditLogger } from "@/lib/audit-log"
import { MessageSquare, Send, Search, Plus, AlertTriangle, Users, Bell, Mail, Eye, Filter } from "lucide-react"

interface Message {
  id: string
  from: string
  fromRole: string
  to: string[]
  toRoles: string[]
  subject: string
  content: string
  type: "announcement" | "alert" | "message" | "notification"
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "sent" | "delivered" | "read"
  createdAt: string
  sentAt?: string
  readBy: string[]
  attachments?: string[]
}

interface CommunicationStats {
  totalMessages: number
  unreadMessages: number
  announcements: number
  alerts: number
}

export default function AdminCommunicationPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState({
    to: [] as string[],
    toRoles: [] as string[],
    subject: "",
    content: "",
    type: "message" as Message["type"],
    priority: "medium" as Message["priority"],
  })

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: "MSG-001",
      from: "System Administrator",
      fromRole: "Super Admin",
      to: ["all"],
      toRoles: ["Patient", "Care Provider", "Reviewer"],
      subject: "System Maintenance Scheduled",
      content:
        "We will be performing scheduled maintenance on Sunday, January 21st from 2:00 AM to 4:00 AM GMT. During this time, the system may be temporarily unavailable.",
      type: "announcement",
      priority: "high",
      status: "sent",
      createdAt: "2024-01-15T10:00:00Z",
      sentAt: "2024-01-15T10:05:00Z",
      readBy: ["user1", "user2", "user3"],
    },
    {
      id: "MSG-002",
      from: "Dr. Kwame Mensah",
      fromRole: "Reviewer",
      to: ["caregiver1", "caregiver2"],
      toRoles: ["Care Provider"],
      subject: "Updated Care Protocols",
      content:
        "Please review the updated care protocols for wound management. New guidelines are now available in the system.",
      type: "message",
      priority: "medium",
      status: "delivered",
      createdAt: "2024-01-14T14:30:00Z",
      sentAt: "2024-01-14T14:35:00Z",
      readBy: ["caregiver1"],
    },
    {
      id: "MSG-003",
      from: "System",
      fromRole: "System",
      to: ["admin1", "admin2"],
      toRoles: ["Administrator"],
      subject: "Critical Patient Alert",
      content: "Patient Akosua Asante (ID: 5) has reported severe symptoms. Immediate attention required.",
      type: "alert",
      priority: "urgent",
      status: "sent",
      createdAt: "2024-01-15T16:45:00Z",
      sentAt: "2024-01-15T16:45:00Z",
      readBy: ["admin1"],
    },
    {
      id: "MSG-004",
      from: "HR Department",
      fromRole: "Administrator",
      to: ["all"],
      toRoles: ["Care Provider"],
      subject: "Monthly Team Meeting",
      content: "Monthly team meeting scheduled for January 25th at 3:00 PM. Please confirm your attendance.",
      type: "notification",
      priority: "low",
      status: "draft",
      createdAt: "2024-01-15T09:00:00Z",
      readBy: [],
    },
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard")
    }
    if (user && hasPermission(user.role, "admin")) {
      loadMessages()
    }
  }, [user, authLoading, router])

  const loadMessages = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMessages(mockMessages)
    setIsLoading(false)
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || message.type === selectedType
    const matchesPriority = selectedPriority === "all" || message.priority === selectedPriority

    return matchesSearch && matchesType && matchesPriority
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-blue-100 text-blue-800"
      case "alert":
        return "bg-red-100 text-red-800"
      case "message":
        return "bg-green-100 text-green-800"
      case "notification":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "read":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const handleSendMessage = async () => {
    if (!user || !newMessage.subject || !newMessage.content) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const message: Message = {
        id: `MSG-${Date.now()}`,
        from: user.name,
        fromRole: user.role,
        to: newMessage.to,
        toRoles: newMessage.toRoles,
        subject: newMessage.subject,
        content: newMessage.content,
        type: newMessage.type,
        priority: newMessage.priority,
        status: "sent",
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        readBy: [],
      }

      setMessages((prev) => [message, ...prev])

      // Log the action
      await AuditLogger.log(user.id, user.email, "communication.message.send", "system", {
        messageId: message.id,
        subject: message.subject,
        type: message.type,
        priority: message.priority,
        recipients: message.to.length + message.toRoles.length,
      })

      // Reset form
      setNewMessage({
        to: [],
        toRoles: [],
        subject: "",
        content: "",
        type: "message",
        priority: "medium",
      })
      setShowNewMessage(false)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const getStats = (): CommunicationStats => {
    return {
      totalMessages: messages.length,
      unreadMessages: messages.filter((m) => m.readBy.length === 0).length,
      announcements: messages.filter((m) => m.type === "announcement").length,
      alerts: messages.filter((m) => m.type === "alert").length,
    }
  }

  const stats = getStats()

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading communication center...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access the communication center.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Communication Center</h1>
              <p className="text-slate-600 mt-2">Manage system-wide communications and announcements</p>
            </div>
            <Button onClick={() => setShowNewMessage(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalMessages}</p>
                  <p className="text-sm text-slate-600">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.unreadMessages}</p>
                  <p className="text-sm text-slate-600">Unread Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.announcements}</p>
                  <p className="text-sm text-slate-600">Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.alerts}</p>
                  <p className="text-sm text-slate-600">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Message Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="announcement">Announcements</option>
                <option value="alert">Alerts</option>
                <option value="message">Messages</option>
                <option value="notification">Notifications</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button variant="outline" className="bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{message.subject}</div>
                        <div className="text-sm text-slate-600 truncate max-w-xs">
                          {message.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{message.from}</div>
                        <div className="text-sm text-slate-600">{message.fromRole}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(message.type)}>{message.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">{new Date(message.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedMessage(message)}
                            className="bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Message Details</DialogTitle>
                          </DialogHeader>
                          {selectedMessage && (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Message Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Subject:</strong> {selectedMessage.subject}
                                    </p>
                                    <p>
                                      <strong>From:</strong> {selectedMessage.from} ({selectedMessage.fromRole})
                                    </p>
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      <Badge className={getTypeColor(selectedMessage.type)}>
                                        {selectedMessage.type}
                                      </Badge>
                                    </p>
                                    <p>
                                      <strong>Priority:</strong>{" "}
                                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                                        {selectedMessage.priority}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Delivery Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Status:</strong>{" "}
                                      <Badge className={getStatusColor(selectedMessage.status)}>
                                        {selectedMessage.status}
                                      </Badge>
                                    </p>
                                    <p>
                                      <strong>Created:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </p>
                                    {selectedMessage.sentAt && (
                                      <p>
                                        <strong>Sent:</strong> {new Date(selectedMessage.sentAt).toLocaleString()}
                                      </p>
                                    )}
                                    <p>
                                      <strong>Read by:</strong> {selectedMessage.readBy.length} recipients
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Recipients</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedMessage.toRoles.map((role, index) => (
                                    <Badge key={index} variant="outline">
                                      {role}
                                    </Badge>
                                  ))}
                                  {selectedMessage.to.map((recipient, index) => (
                                    <Badge key={index} variant="outline">
                                      {recipient}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Message Content</h3>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {selectedMessage.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* New Message Dialog */}
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message Type</label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage((prev) => ({ ...prev, type: e.target.value as Message["type"] }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="message">Message</option>
                    <option value="announcement">Announcement</option>
                    <option value="alert">Alert</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) =>
                      setNewMessage((prev) => ({ ...prev, priority: e.target.value as Message["priority"] }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recipients (Roles)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Patient", "Care Provider", "Reviewer", "Administrator"].map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newMessage.toRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMessage((prev) => ({ ...prev, toRoles: [...prev.toRoles, role] }))
                          } else {
                            setNewMessage((prev) => ({
                              ...prev,
                              toRoles: prev.toRoles.filter((r) => r !== role),
                            }))
                          }
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message Content</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your message..."
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewMessage(false)} className="bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.subject || !newMessage.content || newMessage.toRoles.length === 0}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
