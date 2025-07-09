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
import {
  BookOpen,
  Plus,
  Search,
  Download,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Users,
  Video,
  FileText,
  Link,
} from "lucide-react"

interface EducationalResource {
  id: string
  title: string
  description: string
  type: "article" | "video" | "document" | "link" | "course"
  category: string
  targetAudience: string[]
  content: string
  url?: string
  duration?: string
  author: string
  createdAt: string
  updatedAt: string
  status: "draft" | "published" | "archived"
  views: number
  downloads: number
  tags: string[]
}

interface EducationStats {
  totalResources: number
  publishedResources: number
  totalViews: number
  totalDownloads: number
}

export default function AdminEducationPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [resources, setResources] = useState<EducationalResource[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedAudience, setSelectedAudience] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewResource, setShowNewResource] = useState(false)
  const [selectedResource, setSelectedResource] = useState<EducationalResource | null>(null)
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "article" as EducationalResource["type"],
    category: "",
    targetAudience: [] as string[],
    content: "",
    url: "",
    duration: "",
    tags: [] as string[],
  })

  // Mock resources data
  const mockResources: EducationalResource[] = [
    {
      id: "EDU-001",
      title: "Proper Wound Care Techniques",
      description: "Comprehensive guide on wound assessment, cleaning, and dressing procedures",
      type: "article",
      category: "Clinical Care",
      targetAudience: ["Care Provider", "Reviewer"],
      content: "Detailed content about wound care procedures...",
      author: "Dr. Kwame Mensah",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
      status: "published",
      views: 245,
      downloads: 67,
      tags: ["wound care", "clinical", "procedures"],
    },
    {
      id: "EDU-002",
      title: "Medication Administration Safety",
      description: "Video training on safe medication administration practices",
      type: "video",
      category: "Safety Training",
      targetAudience: ["Care Provider"],
      content: "Video content about medication safety...",
      url: "https://example.com/video/med-safety",
      duration: "25 minutes",
      author: "Pharmacy Team",
      createdAt: "2024-01-08T09:00:00Z",
      updatedAt: "2024-01-08T09:00:00Z",
      status: "published",
      views: 189,
      downloads: 0,
      tags: ["medication", "safety", "training"],
    },
    {
      id: "EDU-003",
      title: "Patient Communication Guidelines",
      description: "Best practices for effective patient communication",
      type: "document",
      category: "Communication",
      targetAudience: ["Care Provider", "Patient"],
      content: "Guidelines for patient communication...",
      author: "Communication Team",
      createdAt: "2024-01-12T11:00:00Z",
      updatedAt: "2024-01-12T11:00:00Z",
      status: "published",
      views: 156,
      downloads: 89,
      tags: ["communication", "patient care", "guidelines"],
    },
    {
      id: "EDU-004",
      title: "Emergency Response Procedures",
      description: "Step-by-step emergency response protocols",
      type: "course",
      category: "Emergency Care",
      targetAudience: ["Care Provider", "Reviewer"],
      content: "Emergency response course content...",
      duration: "2 hours",
      author: "Emergency Team",
      createdAt: "2024-01-05T08:00:00Z",
      updatedAt: "2024-01-14T16:00:00Z",
      status: "draft",
      views: 0,
      downloads: 0,
      tags: ["emergency", "protocols", "training"],
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
      loadResources()
    }
  }, [user, authLoading, router])

  const loadResources = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setResources(mockResources)
    setIsLoading(false)
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    const matchesType = selectedType === "all" || resource.type === selectedType
    const matchesAudience = selectedAudience === "all" || resource.targetAudience.includes(selectedAudience)

    return matchesSearch && matchesCategory && matchesType && matchesAudience
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800"
      case "video":
        return "bg-purple-100 text-purple-800"
      case "document":
        return "bg-green-100 text-green-800"
      case "link":
        return "bg-orange-100 text-orange-800"
      case "course":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "link":
        return <Link className="h-4 w-4" />
      case "course":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleCreateResource = async () => {
    if (!user || !newResource.title || !newResource.description) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const resource: EducationalResource = {
        id: `EDU-${Date.now()}`,
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        category: newResource.category,
        targetAudience: newResource.targetAudience,
        content: newResource.content,
        url: newResource.url,
        duration: newResource.duration,
        author: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
        views: 0,
        downloads: 0,
        tags: newResource.tags,
      }

      setResources((prev) => [resource, ...prev])

      // Log the action
      await AuditLogger.log(user.id, user.email, "education.resource.create", "system", {
        resourceId: resource.id,
        title: resource.title,
        type: resource.type,
        category: resource.category,
      })

      // Reset form
      setNewResource({
        title: "",
        description: "",
        type: "article",
        category: "",
        targetAudience: [],
        content: "",
        url: "",
        duration: "",
        tags: [],
      })
      setShowNewResource(false)
    } catch (error) {
      console.error("Failed to create resource:", error)
    }
  }

  const getStats = (): EducationStats => {
    return {
      totalResources: resources.length,
      publishedResources: resources.filter((r) => r.status === "published").length,
      totalViews: resources.reduce((sum, r) => sum + r.views, 0),
      totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
    }
  }

  const stats = getStats()

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading education center...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access the education center.</AlertDescription>
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
              <h1 className="text-3xl font-bold text-slate-900">Education Center</h1>
              <p className="text-slate-600 mt-2">Manage educational resources and training materials</p>
            </div>
            <Button onClick={() => setShowNewResource(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Resource
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalResources}</p>
                  <p className="text-sm text-slate-600">Total Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.publishedResources}</p>
                  <p className="text-sm text-slate-600">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
                  <p className="text-sm text-slate-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Download className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalDownloads}</p>
                  <p className="text-sm text-slate-600">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resource Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="Clinical Care">Clinical Care</option>
                <option value="Safety Training">Safety Training</option>
                <option value="Communication">Communication</option>
                <option value="Emergency Care">Emergency Care</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="link">Links</option>
                <option value="course">Courses</option>
              </select>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Audiences</option>
                <option value="Patient">Patients</option>
                <option value="Care Provider">Care Providers</option>
                <option value="Reviewer">Reviewers</option>
                <option value="Administrator">Administrators</option>
              </select>
              <Button variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center space-x-2">
                          {getTypeIcon(resource.type)}
                          <span>{resource.title}</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">{resource.description}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(resource.type)}>{resource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{resource.category}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resource.targetAudience.map((audience, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(resource.status)}>{resource.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-slate-400" />
                          <span>{resource.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="h-3 w-3 text-slate-400" />
                          <span>{resource.downloads}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedResource(resource)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Resource Details - {resource.title}</DialogTitle>
                            </DialogHeader>
                            {selectedResource && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Resource Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Title:</strong> {selectedResource.title}
                                      </p>
                                      <p>
                                        <strong>Type:</strong>{" "}
                                        <Badge className={getTypeColor(selectedResource.type)}>
                                          {selectedResource.type}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Category:</strong> {selectedResource.category}
                                      </p>
                                      <p>
                                        <strong>Author:</strong> {selectedResource.author}
                                      </p>
                                      {selectedResource.duration && (
                                        <p>
                                          <strong>Duration:</strong> {selectedResource.duration}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Status & Metrics</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge className={getStatusColor(selectedResource.status)}>
                                          {selectedResource.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Views:</strong> {selectedResource.views}
                                      </p>
                                      <p>
                                        <strong>Downloads:</strong> {selectedResource.downloads}
                                      </p>
                                      <p>
                                        <strong>Created:</strong>{" "}
                                        {new Date(selectedResource.createdAt).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Updated:</strong>{" "}
                                        {new Date(selectedResource.updatedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Target Audience</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedResource.targetAudience.map((audience, index) => (
                                      <Badge key={index} variant="outline">
                                        {audience}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Tags</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedResource.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                  <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-700">{selectedResource.description}</p>
                                  </div>
                                </div>

                                {selectedResource.url && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Resource URL</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <a
                                        href={selectedResource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-teal-600 hover:text-teal-700 underline"
                                      >
                                        {selectedResource.url}
                                      </a>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Content Preview</h3>
                                  <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                      {selectedResource.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* New Resource Dialog */}
        <Dialog open={showNewResource} onOpenChange={setShowNewResource}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Educational Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resource Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) =>
                      setNewResource((prev) => ({ ...prev, type: e.target.value as EducationalResource["type"] }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="link">Link</option>
                    <option value="course">Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <Input
                    value={newResource.category}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Clinical Care, Safety Training"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <Input
                  value={newResource.title}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter resource title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter resource description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Patient", "Care Provider", "Reviewer", "Administrator"].map((audience) => (
                    <label key={audience} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newResource.targetAudience.includes(audience)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewResource((prev) => ({ ...prev, targetAudience: [...prev.targetAudience, audience] }))
                          } else {
                            setNewResource((prev) => ({
                              ...prev,
                              targetAudience: prev.targetAudience.filter((a) => a !== audience),
                            }))
                          }
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-700">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(newResource.type === "video" || newResource.type === "link") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
                  <Input
                    value={newResource.url}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="Enter resource URL..."
                  />
                </div>
              )}

              {(newResource.type === "video" || newResource.type === "course") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                  <Input
                    value={newResource.duration}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 25 minutes, 2 hours"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <Textarea
                  value={newResource.content}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the main content or description..."
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags (comma-separated)</label>
                <Input
                  value={newResource.tags.join(", ")}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    }))
                  }
                  placeholder="e.g., wound care, clinical, procedures"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewResource(false)} className="bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateResource}
                  disabled={!newResource.title || !newResource.description || newResource.targetAudience.length === 0}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
