"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getJobPositions,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  getJobCategories,
  createJobCategory,
  deleteJobCategory,
  getCareerApplications,
} from "@/lib/api/careers";
import { JobPosition, JobStatus, CareerApplication } from "@/lib/types/careers";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Briefcase,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Clock,
  Tag,
  Settings,
} from "lucide-react";
import { AdminCareersMobile } from "@/components/mobile/admin-careers";

export default function JobManagementPage() {
  // State for jobs
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applicationsActiveTab, setApplicationsActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  // State for dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // State for form data
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    category: "",
    status: "draft",
    publicationDate: "",
    expirationDate: "",
    applicationDeadline: "",
    numberOfPositions: 1,
    remoteWorkOptions: "",
    benefits: "",
  });

  // State for categories
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const router = useRouter();

  // Viewport detection to prevent desktop Dialog from rendering on mobile
  const [isMdUp, setIsMdUp] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support both event and initial list
      // @ts-ignore
      setIsMdUp(e.matches !== undefined ? e.matches : mql.matches);
    };
    handler(mql as unknown as MediaQueryList);
    mql.addEventListener?.(
      "change",
      handler as (e: MediaQueryListEvent) => void
    );
    return () =>
      mql.removeEventListener?.(
        "change",
        handler as (e: MediaQueryListEvent) => void
      );
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobsData, categoriesData, applicationsData] = await Promise.all([
          getJobPositions(),
          getJobCategories(),
          getCareerApplications(),
        ]);
        setJobs(jobsData);
        setCategories(categoriesData);
        setApplications(applicationsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatJobDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDate(date);
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: any) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-800">Interview</Badge>
        );
      case "hired":
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    // Filter by status if not "all"
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    // Filter by tab
    if (
      (applicationsActiveTab === "healthcare" &&
        (!app.positionTitle ||
          (!app.positionTitle.toLowerCase().includes("nurse") &&
            !app.positionTitle.toLowerCase().includes("care")))) ||
      (applicationsActiveTab === "childcare" &&
        (!app.positionTitle ||
          (!app.positionTitle.toLowerCase().includes("nanny") &&
            !app.positionTitle.toLowerCase().includes("child")))) ||
      (applicationsActiveTab === "event" &&
        (!app.positionTitle ||
          !app.positionTitle.toLowerCase().includes("event"))) ||
      (applicationsActiveTab === "general" &&
        app.positionId &&
        app.positionTitle)
    ) {
      return false;
    }

    // Search term filtering
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        app.firstName.toLowerCase().includes(searchTermLower) ||
        app.lastName.toLowerCase().includes(searchTermLower) ||
        app.email.toLowerCase().includes(searchTermLower) ||
        (app.positionTitle &&
          app.positionTitle.toLowerCase().includes(searchTermLower)) ||
        (app.skills &&
          app.skills.some((skill) =>
            skill.toLowerCase().includes(searchTermLower)
          )) ||
        (app.education && app.education.toLowerCase().includes(searchTermLower))
      );
    }

    return true;
  });

  // Sort by submission date (most recent first)
  const sortedApplications = [...filteredApplications].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const filteredJobs = jobs.filter((job) => {
    // Filter by status if not "all"
    if (categoryFilter !== "all" && job.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  const handleCreateJob = async () => {
    if (!formData.title || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const jobData = {
        ...formData,
        requirements:
          typeof formData.requirements === "string"
            ? formData.requirements.split("\n").filter((r: string) => r.trim())
            : formData.requirements,
        benefits:
          typeof formData.benefits === "string"
            ? formData.benefits.split("\n").filter((b: string) => b.trim())
            : formData.benefits,
      };

      const newJob = await createJobPosition(jobData);
      setJobs([...jobs, newJob]);
      setShowCreateDialog(false);
      setFormData({
        title: "",
        type: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        category: "",
        status: "draft",
        publicationDate: "",
        expirationDate: "",
        applicationDeadline: "",
        numberOfPositions: 1,
        remoteWorkOptions: "",
        benefits: "",
      });
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("Failed to create job position");
    }
  };

  const handleEditJob = (job: JobPosition) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      type: job.type,
      location: job.location,
      description: job.description,
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements,
      salary: job.salary,
      category: job.category,
      status: job.status,
      publicationDate: job.publicationDate || "",
      expirationDate: job.expirationDate || "",
      applicationDeadline: job.applicationDeadline || "",
      numberOfPositions: job.numberOfPositions || 1,
      remoteWorkOptions: job.remoteWorkOptions || "",
      benefits: Array.isArray(job.benefits)
        ? job.benefits.join("\n")
        : job.benefits || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob || !formData.title || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const jobData = {
        ...formData,
        requirements:
          typeof formData.requirements === "string"
            ? formData.requirements.split("\n").filter((r: string) => r.trim())
            : formData.requirements,
        benefits:
          typeof formData.benefits === "string"
            ? formData.benefits.split("\n").filter((b: string) => b.trim())
            : formData.benefits,
      };

      const updatedJob = await updateJobPosition(editingJob.id, jobData);
      if (updatedJob) {
        setJobs(
          jobs.map((job) => (job.id === editingJob.id ? updatedJob : job))
        );
      }
      setShowEditDialog(false);
      setEditingJob(null);
      setFormData({
        title: "",
        type: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        category: "",
        status: "draft",
        publicationDate: "",
        expirationDate: "",
        applicationDeadline: "",
        numberOfPositions: 1,
        remoteWorkOptions: "",
        benefits: "",
      });
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job position");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJobPosition(id);
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job position");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      await createJobCategory(newCategory.trim());
      const updatedCategories = await getJobCategories();
      setCategories(updatedCategories);
      setNewCategory("");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      await deleteJobCategory(category);
      const updatedCategories = await getJobCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminCareersMobile
          title="Job Management"
          subtitle="Manage job positions and review applications"
          onOpenCreate={() => setShowCreateDialog(true)}
          onOpenCategories={() => setShowCategoryDialog(true)}
          onEdit={(job) => {
            setEditingJob(job);
            setFormData({
              title: job.title,
              type: job.type,
              location: job.location,
              description: job.description,
              requirements: Array.isArray(job.requirements)
                ? job.requirements.join("\n")
                : job.requirements,
              salary: job.salary,
              category: job.category,
              status: job.status,
              publicationDate: job.publicationDate || "",
              expirationDate: job.expirationDate || "",
              applicationDeadline: job.applicationDeadline || "",
              numberOfPositions: job.numberOfPositions || 1,
              remoteWorkOptions: job.remoteWorkOptions || "",
              benefits: Array.isArray(job.benefits)
                ? job.benefits.join("\n")
                : job.benefits || "",
            });
            setShowEditDialog(true);
          }}
        />
        {/* Mobile Create Job Sheet */}
        {!isMdUp && (
          <Sheet open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <SheetContent side="bottom" className="p-4">
              <SheetHeader>
                <SheetTitle>Create New Job Position</SheetTitle>
                <SheetDescription>
                  Job will be created as draft - you can publish it later
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 py-4">
                <div>
                  <Label htmlFor="m-title">Job Title *</Label>
                  <Input
                    id="m-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Senior Nurse Practitioner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="m-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="m-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="m-type">Employment Type</Label>
                    <Input
                      id="m-type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      placeholder="e.g., Full-time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="m-location">Location</Label>
                    <Input
                      id="m-location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Accra or Remote"
                    />
                  </div>
                  <div>
                    <Label htmlFor="m-salary">Salary Range</Label>
                    <Input
                      id="m-salary"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      placeholder="e.g., $80,000 - $120,000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="m-description">Job Description</Label>
                  <Textarea
                    id="m-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Brief description of the role..."
                  />
                </div>
                <div>
                  <Label htmlFor="m-reqs">Requirements (one per line)</Label>
                  <Textarea
                    id="m-reqs"
                    value={
                      Array.isArray(formData.requirements)
                        ? formData.requirements.join("\n")
                        : formData.requirements
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    rows={3}
                    placeholder={"e.g., Bachelor's degree\n2+ years experience"}
                  />
                </div>
                <div>
                  <Label htmlFor="m-benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="m-benefits"
                    value={
                      Array.isArray(formData.benefits)
                        ? formData.benefits.join("\n")
                        : formData.benefits
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    rows={3}
                    placeholder={"e.g., Health insurance\nPaid vacation"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-[env(safe-area-inset-bottom)]">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateJob}>Create Draft</Button>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Mobile Edit Job Sheet */}
        {!isMdUp && (
          <Sheet open={showEditDialog} onOpenChange={setShowEditDialog}>
            <SheetContent side="bottom" className="p-4">
              <SheetHeader>
                <SheetTitle>Edit Job Position</SheetTitle>
                <SheetDescription>Update job position details</SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="me-title">Job Title *</Label>
                    <Input
                      id="me-title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="me-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="me-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="me-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="me-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="me-type">Employment Type</Label>
                    <Input
                      id="me-type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="me-location">Location</Label>
                    <Input
                      id="me-location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="me-salary">Salary Range</Label>
                    <Input
                      id="me-salary"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="me-description">Job Description</Label>
                  <Textarea
                    id="me-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="me-reqs">Requirements (one per line)</Label>
                  <Textarea
                    id="me-reqs"
                    value={
                      Array.isArray(formData.requirements)
                        ? formData.requirements.join("\n")
                        : formData.requirements
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="me-benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="me-benefits"
                    value={
                      Array.isArray(formData.benefits)
                        ? formData.benefits.join("\n")
                        : formData.benefits
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-[env(safe-area-inset-bottom)]">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateJob}>Update Job</Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Manage job positions and review applications
          </p>
        </div>
        <div className="flex gap-3">
          {/* Desktop dialog only when md+ to avoid portal bleed on mobile */}
          <div className="hidden md:block">
            {isMdUp && (
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Draft
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Job Position</DialogTitle>
                    <DialogDescription>
                      Job will be created as draft - you can publish it later
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Job Title - Full width */}
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Senior Nurse Practitioner"
                      />
                    </div>

                    {/* Category and Employment Type - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="type">Employment Type</Label>
                        <Input
                          id="type"
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                          placeholder="e.g., Full-time, Part-time, Contract"
                        />
                      </div>
                    </div>

                    {/* Location and Salary - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          placeholder="e.g., New York, NY or Remote"
                        />
                      </div>

                      <div>
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          value={formData.salary}
                          onChange={(e) =>
                            setFormData({ ...formData, salary: e.target.value })
                          }
                          placeholder="e.g., $80,000 - $120,000"
                        />
                      </div>
                    </div>

                    {/* Job Description - Full width */}
                    <div>
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Brief description of the role..."
                      />
                    </div>

                    {/* Requirements and Benefits - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="requirements">
                          Requirements (one per line)
                        </Label>
                        <Textarea
                          id="requirements"
                          value={
                            Array.isArray(formData.requirements)
                              ? formData.requirements.join("\n")
                              : formData.requirements
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requirements: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="e.g., Bachelor's degree&#10;2+ years experience"
                        />
                      </div>

                      <div>
                        <Label htmlFor="benefits">
                          Benefits (one per line)
                        </Label>
                        <Textarea
                          id="benefits"
                          value={
                            Array.isArray(formData.benefits)
                              ? formData.benefits.join("\n")
                              : formData.benefits
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              benefits: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="e.g., Health insurance&#10;Paid vacation"
                        />
                      </div>
                    </div>

                    {/* Additional Options - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="positions">Number of Positions</Label>
                        <Input
                          id="positions"
                          type="number"
                          min="1"
                          value={formData.numberOfPositions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              numberOfPositions: parseInt(e.target.value) || 1,
                            })
                          }
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="remote">Remote Work Options</Label>
                        <Input
                          id="remote"
                          value={formData.remoteWorkOptions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              remoteWorkOptions: e.target.value,
                            })
                          }
                          placeholder="e.g., Hybrid, Fully Remote, On-site only"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateJob}>Create Draft</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Desktop Categories Dialog; on mobile we use a sheet below */}
          <Dialog
            open={showCategoryDialog && isMdUp}
            onOpenChange={setShowCategoryDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Manage Job Categories</DialogTitle>
                <DialogDescription>
                  Add or remove job categories
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleCreateCategory}>Add</Button>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{category}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category}"? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Mobile Categories Sheet */}
          <Sheet
            open={showCategoryDialog && !isMdUp}
            onOpenChange={setShowCategoryDialog}
          >
            <SheetContent side="bottom" className="p-4">
              <SheetHeader>
                <SheetTitle>Manage Job Categories</SheetTitle>
                <SheetDescription>
                  Add or remove job categories
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3 py-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleCreateCategory}>Add</Button>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{category}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category}"? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pb-[env(safe-area-inset-bottom)]" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* KPI Stats (Desktop) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter((j) => j.status === "published").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Positions accepting applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              All-time applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter((a) => a.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter((a) => a.status === "hired").length}
            </div>
            <p className="text-xs text-muted-foreground">Marked as hired</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="hidden md:block space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger className="w-full" value="jobs">
            Job Positions
          </TabsTrigger>
          <TabsTrigger className="w-full" value="applications">
            Applications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="m-0" />
        <TabsContent value="applications" className="m-0" />

        {/* Job Positions Tab */}
        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle>Job Positions</CardTitle>
                <div className="flex gap-3">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">
                    No job positions found
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="relative">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {job.type}
                              </span>
                              <span className="flex items-center">
                                <span className="h-4 w-4 mr-1">📍</span>
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <span className="h-4 w-4 mr-1">💰</span>
                                {job.salary}
                              </span>
                              <Badge variant="outline">
                                <Tag className="h-3 w-3 mr-1" />
                                {job.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(job.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditJob(job)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Job Position
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{job.title}
                                    "? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteJob(job.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="text-sm">
                            <div className="font-medium">Requirements:</div>
                            <ul className="text-muted-foreground list-disc list-inside space-y-1">
                              {(Array.isArray(job.requirements)
                                ? job.requirements
                                : [job.requirements]
                              ).map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">
                              Positions Available:
                            </div>
                            <div className="text-muted-foreground">
                              {job.numberOfPositions || 1}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">Description:</div>
                            <div className="text-muted-foreground line-clamp-3">
                              {job.description}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">Created:</div>
                            <div className="text-muted-foreground">
                              {formatJobDate(job.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4 space-y-4">
          <Tabs
            defaultValue="all"
            value={applicationsActiveTab}
            onValueChange={setApplicationsActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              <TabsTrigger value="childcare">Childcare</TabsTrigger>
              <TabsTrigger value="event">Event Medical</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Job Applications</CardTitle>
                    <CardDescription>
                      Review job applications for specific positions and general
                      applications from candidates
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        className="pl-9 w-full sm:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-10">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <div className="text-muted-foreground">
                      No applications found
                    </div>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedApplications.map((application) => (
                          <TableRow
                            key={application.id}
                            role="link"
                            tabIndex={0}
                            className="cursor-pointer hover:bg-accent/50"
                            onClick={() =>
                              router.push(`/admin/careers/${application.id}`)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(`/admin/careers/${application.id}`);
                              }
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {application.firstName}{" "}
                                    {application.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {application.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {application.positionTitle ||
                                    "General Application"}
                                </div>
                                {application.education && (
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    <span className="truncate max-w-[200px]">
                                      {application.education}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>
                                  {formatJobDate(application.submittedAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getApplicationStatusBadge(application.status)}
                            </TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/careers/${application.id}`
                                  )
                                }
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>

          {/* Removed Application Statistics section for a cleaner view */}
        </TabsContent>
      </Tabs>

      {/* Edit Job Dialog */}
      {isMdUp && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Position</DialogTitle>
              <DialogDescription>Update job position details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Job Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-type">Employment Type</Label>
                  <Input
                    id="edit-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-salary">Salary Range</Label>
                  <Input
                    id="edit-salary"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Job Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-requirements">
                    Requirements (one per line)
                  </Label>
                  <Textarea
                    id="edit-requirements"
                    value={
                      Array.isArray(formData.requirements)
                        ? formData.requirements.join("\n")
                        : formData.requirements
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="edit-benefits"
                    value={
                      Array.isArray(formData.benefits)
                        ? formData.benefits.join("\n")
                        : formData.benefits
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        benefits: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-positions">Number of Positions</Label>
                  <Input
                    id="edit-positions"
                    type="number"
                    min="1"
                    value={formData.numberOfPositions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfPositions: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-publication">Publication Date</Label>
                  <Input
                    id="edit-publication"
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicationDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-deadline">Application Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationDeadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-remote">Remote Work Options</Label>
                <Input
                  id="edit-remote"
                  value={formData.remoteWorkOptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remoteWorkOptions: e.target.value,
                    })
                  }
                  placeholder="e.g., Hybrid, Fully Remote, On-site only"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingJob(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateJob}>Update Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
