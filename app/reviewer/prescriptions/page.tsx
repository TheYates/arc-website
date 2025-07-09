"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { Pill, Search, AlertTriangle, Plus, Eye, Edit, Send, CheckCircle, Clock } from "lucide-react"

interface Prescription {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientConditions: string[]
  medicationName: string
  genericName?: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  refills: number
  instructions: string
  indication: string
  contraindications: string[]
  sideEffects: string[]
  interactions: string[]
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "pending" | "approved" | "dispensed" | "completed" | "cancelled"
  prescribedBy: string
  prescribedDate: string
  approvedBy?: string
  approvedDate?: string
  dispensedDate?: string
  startDate: string
  endDate?: string
  notes?: string
  reviewerNotes?: string
  pharmacyNotes?: string
  monitoringRequired: boolean
  monitoringInstructions?: string
  costEstimate?: number
  insuranceCovered: boolean
}

export default function ReviewerPrescriptionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    medicationName: "",
    genericName: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
    refills: "0",
    instructions: "",
    indication: "",
    contraindications: "",
    sideEffects: "",
    interactions: "",
    priority: "medium",
    startDate: "",
    endDate: "",
    notes: "",
    monitoringRequired: false,
    monitoringInstructions: "",
    costEstimate: "",
    insuranceCovered: true,
  })

  // Mock prescriptions data
  const mockPrescriptions: Prescription[] = [
    {
      id: "rx-001",
      patientId: "5",
      patientName: "Akosua Asante",
      patientAge: 68,
      patientConditions: ["Hypertension", "Type 2 Diabetes"],
      medicationName: "Lisinopril",
      genericName: "Lisinopril",
      dosage: "20mg",
      frequency: "Once daily",
      duration: "30 days",
      quantity: 30,
      refills: 5,
      instructions: "Take in the morning with or without food. Monitor blood pressure regularly.",
      indication: "Hypertension management",
      contraindications: ["Pregnancy", "Angioedema history", "Bilateral renal artery stenosis"],
      sideEffects: ["Dry cough", "Dizziness", "Hyperkalemia", "Fatigue"],
      interactions: ["Potassium supplements", "NSAIDs", "Lithium"],
      priority: "high",
      status: "approved",
      prescribedBy: "Dr. Kwame Mensah",
      prescribedDate: "2024-01-15T10:30:00Z",
      approvedBy: "Dr. Sarah Johnson",
      approvedDate: "2024-01-15T11:00:00Z",
      startDate: "2024-01-16",
      endDate: "2024-02-15",
      notes: "Patient's BP has been consistently elevated. Starting with 20mg dose.",
      reviewerNotes: "Appropriate choice for this patient. Monitor for cough.",
      monitoringRequired: true,
      monitoringInstructions: "Check BP weekly, monitor kidney function monthly",
      costEstimate: 25.5,
      insuranceCovered: true,
    },
    {
      id: "rx-002",
      patientId: "5",
      patientName: "Akosua Asante",
      patientAge: 68,
      patientConditions: ["Hypertension", "Type 2 Diabetes"],
      medicationName: "Amlodipine",
      genericName: "Amlodipine besylate",
      dosage: "5mg",
      frequency: "Once daily",
      duration: "30 days",
      quantity: 30,
      refills: 5,
      instructions: "Take at the same time each day. May cause ankle swelling.",
      indication: "Additional blood pressure control",
      contraindications: ["Severe aortic stenosis", "Cardiogenic shock"],
      sideEffects: ["Ankle swelling", "Flushing", "Fatigue", "Dizziness"],
      interactions: ["Simvastatin", "Cyclosporine"],
      priority: "high",
      status: "pending",
      prescribedBy: "Dr. Kwame Mensah",
      prescribedDate: "2024-01-15T10:45:00Z",
      startDate: "2024-01-16",
      endDate: "2024-02-15",
      notes: "Adding to Lisinopril for better BP control",
      monitoringRequired: true,
      monitoringInstructions: "Monitor for peripheral edema, check BP weekly",
      costEstimate: 18.75,
      insuranceCovered: true,
    },
    {
      id: "rx-003",
      patientId: "6",
      patientName: "Kofi Mensah",
      patientAge: 72,
      patientConditions: ["Type 2 Diabetes", "Diabetic Neuropathy"],
      medicationName: "Metformin",
      genericName: "Metformin hydrochloride",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "90 days",
      quantity: 180,
      refills: 3,
      instructions: "Take with meals to reduce stomach upset. Monitor blood sugar levels.",
      indication: "Type 2 diabetes management",
      contraindications: ["Severe kidney disease", "Metabolic acidosis", "Diabetic ketoacidosis"],
      sideEffects: ["Nausea", "Diarrhea", "Metallic taste", "Vitamin B12 deficiency"],
      interactions: ["Alcohol", "Contrast dyes", "Topiramate"],
      priority: "medium",
      status: "dispensed",
      prescribedBy: "Dr. Sarah Johnson",
      prescribedDate: "2024-01-12T14:20:00Z",
      approvedBy: "Dr. Kwame Mensah",
      approvedDate: "2024-01-12T15:00:00Z",
      dispensedDate: "2024-01-13T09:30:00Z",
      startDate: "2024-01-13",
      endDate: "2024-04-13",
      notes: "Patient's HbA1c is 8.2%. Starting standard dose.",
      reviewerNotes: "Good first-line choice. Monitor kidney function.",
      pharmacyNotes: "Patient counseled on taking with food.",
      monitoringRequired: true,
      monitoringInstructions: "Monitor HbA1c every 3 months, kidney function every 6 months",
      costEstimate: 45.0,
      insuranceCovered: true,
    },
    {
      id: "rx-004",
      patientId: "6",
      patientName: "Kofi Mensah",
      patientAge: 72,
      patientConditions: ["Type 2 Diabetes", "Diabetic Neuropathy"],
      medicationName: "Gabapentin",
      genericName: "Gabapentin",
      dosage: "300mg",
      frequency: "Three times daily",
      duration: "30 days",
      quantity: 90,
      refills: 2,
      instructions: "Start with one capsule daily, increase gradually as tolerated. May cause drowsiness.",
      indication: "Diabetic neuropathy pain management",
      contraindications: ["Known hypersensitivity"],
      sideEffects: ["Drowsiness", "Dizziness", "Fatigue", "Weight gain"],
      interactions: ["Morphine", "Hydrocodone", "Alcohol"],
      priority: "medium",
      status: "draft",
      prescribedBy: "Dr. Sarah Johnson",
      prescribedDate: "2024-01-16T09:15:00Z",
      startDate: "2024-01-17",
      endDate: "2024-02-16",
      notes: "Patient reports significant neuropathic pain affecting sleep and daily activities.",
      monitoringRequired: true,
      monitoringInstructions: "Monitor for sedation, assess pain levels weekly",
      costEstimate: 32.25,
      insuranceCovered: true,
    },
  ]

  const patients = [
    { id: "5", name: "Akosua Asante", age: 68, conditions: ["Hypertension", "Type 2 Diabetes"] },
    { id: "6", name: "Kofi Mensah", age: 72, conditions: ["Type 2 Diabetes", "Diabetic Neuropathy"] },
    { id: "7", name: "Abena Osei", age: 45, conditions: ["Post-surgical recovery"] },
    { id: "8", name: "Kwaku Boateng", age: 58, conditions: ["Stroke recovery", "Mobility issues"] },
  ]

  const commonMedications = [
    { name: "Lisinopril", generic: "Lisinopril", indication: "Hypertension" },
    { name: "Amlodipine", generic: "Amlodipine besylate", indication: "Hypertension" },
    { name: "Metformin", generic: "Metformin hydrochloride", indication: "Type 2 Diabetes" },
    { name: "Gabapentin", generic: "Gabapentin", indication: "Neuropathic pain" },
    { name: "Atorvastatin", generic: "Atorvastatin calcium", indication: "High cholesterol" },
    { name: "Omeprazole", generic: "Omeprazole", indication: "GERD" },
    { name: "Ibuprofen", generic: "Ibuprofen", indication: "Pain/inflammation" },
    { name: "Acetaminophen", generic: "Acetaminophen", indication: "Pain/fever" },
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user && user.role !== "reviewer") {
      router.push("/dashboard")
    }
    if (user && user.role === "reviewer") {
      loadPrescriptions()
    }
  }, [user, authLoading, router])

  const loadPrescriptions = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPrescriptions(mockPrescriptions)
    setIsLoading(false)
  }

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.indication.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || rx.status === selectedStatus
    const matchesPatient = selectedPatient === "all" || rx.patientId === selectedPatient
    const matchesPriority = selectedPriority === "all" || rx.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPatient && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "dispensed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
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

  const handleCreatePrescription = async () => {
    if (
      !newPrescription.patientId ||
      !newPrescription.medicationName ||
      !newPrescription.dosage ||
      !newPrescription.frequency ||
      !newPrescription.duration
    ) {
      alert("Please fill in required fields")
      return
    }

    const selectedPatient = patients.find((p) => p.id === newPrescription.patientId)

    const prescription: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: newPrescription.patientId,
      patientName: selectedPatient?.name || "",
      patientAge: selectedPatient?.age || 0,
      patientConditions: selectedPatient?.conditions || [],
      medicationName: newPrescription.medicationName,
      genericName: newPrescription.genericName,
      dosage: newPrescription.dosage,
      frequency: newPrescription.frequency,
      duration: newPrescription.duration,
      quantity: Number.parseInt(newPrescription.quantity),
      refills: Number.parseInt(newPrescription.refills),
      instructions: newPrescription.instructions,
      indication: newPrescription.indication,
      contraindications: newPrescription.contraindications
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      sideEffects: newPrescription.sideEffects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      interactions: newPrescription.interactions
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      priority: newPrescription.priority as any,
      status: "draft",
      prescribedBy: user?.firstName + " " + user?.lastName || "",
      prescribedDate: new Date().toISOString(),
      startDate: newPrescription.startDate,
      endDate: newPrescription.endDate || undefined,
      notes: newPrescription.notes,
      monitoringRequired: newPrescription.monitoringRequired,
      monitoringInstructions: newPrescription.monitoringInstructions || undefined,
      costEstimate: newPrescription.costEstimate ? Number.parseFloat(newPrescription.costEstimate) : undefined,
      insuranceCovered: newPrescription.insuranceCovered,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setPrescriptions((prev) => [prescription, ...prev])
    setIsCreating(false)
    setNewPrescription({
      patientId: "",
      medicationName: "",
      genericName: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
      refills: "0",
      instructions: "",
      indication: "",
      contraindications: "",
      sideEffects: "",
      interactions: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      notes: "",
      monitoringRequired: false,
      monitoringInstructions: "",
      costEstimate: "",
      insuranceCovered: true,
    })
  }

  const handleStatusUpdate = async (rxId: string, newStatus: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              status: newStatus as any,
              approvedBy: newStatus === "approved" ? user?.firstName + " " + user?.lastName : rx.approvedBy,
              approvedDate: newStatus === "approved" ? new Date().toISOString() : rx.approvedDate,
            }
          : rx,
      ),
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "reviewer") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Prescriptions</h1>
            <p className="text-slate-600 mt-2">Create and manage patient prescriptions</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                  <select
                    value={newPrescription.patientId}
                    onChange={(e) => setNewPrescription((prev) => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age}) - {patient.conditions.join(", ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medication Information */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Medication Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name *</label>
                      <Input
                        value={newPrescription.medicationName}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, medicationName: e.target.value }))}
                        placeholder="Enter medication name"
                        list="medications"
                        required
                      />
                      <datalist id="medications">
                        {commonMedications.map((med, index) => (
                          <option key={index} value={med.name} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label>
                      <Input
                        value={newPrescription.genericName}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, genericName: e.target.value }))}
                        placeholder="Enter generic name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
                      <Input
                        value={newPrescription.dosage}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 20mg, 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
                      <select
                        value={newPrescription.frequency}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="Every 12 hours">Every 12 hours</option>
                        <option value="As needed">As needed</option>
                        <option value="Before meals">Before meals</option>
                        <option value="After meals">After meals</option>
                        <option value="At bedtime">At bedtime</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Prescription Details */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Prescription Details</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration *</label>
                      <select
                        value={newPrescription.duration}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="">Select duration</option>
                        <option value="7 days">7 days</option>
                        <option value="14 days">14 days</option>
                        <option value="30 days">30 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="Ongoing">Ongoing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                      <Input
                        type="number"
                        value={newPrescription.quantity}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Number of pills/units"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Refills</label>
                      <select
                        value={newPrescription.refills}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, refills: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="0">0 (No refills)</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clinical Information */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Clinical Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Indication *</label>
                      <Input
                        value={newPrescription.indication}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, indication: e.target.value }))}
                        placeholder="Reason for prescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                      <select
                        value={newPrescription.priority}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient Instructions</label>
                  <Textarea
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription((prev) => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Detailed instructions for the patient..."
                    rows={3}
                  />
                </div>

                {/* Safety Information */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Safety Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contraindications</label>
                      <Textarea
                        value={newPrescription.contraindications}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, contraindications: e.target.value }))}
                        placeholder="List contraindications separated by commas"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Side Effects</label>
                      <Textarea
                        value={newPrescription.sideEffects}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, sideEffects: e.target.value }))}
                        placeholder="List potential side effects separated by commas"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Drug Interactions</label>
                      <Textarea
                        value={newPrescription.interactions}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, interactions: e.target.value }))}
                        placeholder="List drug interactions separated by commas"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Treatment Dates</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={newPrescription.startDate}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                      <Input
                        type="date"
                        value={newPrescription.endDate}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Monitoring */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Monitoring</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="monitoringRequired"
                        checked={newPrescription.monitoringRequired}
                        onChange={(e) =>
                          setNewPrescription((prev) => ({ ...prev, monitoringRequired: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="monitoringRequired" className="text-sm text-slate-700">
                        Monitoring required
                      </label>
                    </div>
                    {newPrescription.monitoringRequired && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Monitoring Instructions</label>
                        <Textarea
                          value={newPrescription.monitoringInstructions}
                          onChange={(e) =>
                            setNewPrescription((prev) => ({ ...prev, monitoringInstructions: e.target.value }))
                          }
                          placeholder="Specify monitoring requirements..."
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost and Insurance */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Cost Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newPrescription.costEstimate}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, costEstimate: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="insuranceCovered"
                        checked={newPrescription.insuranceCovered}
                        onChange={(e) =>
                          setNewPrescription((prev) => ({ ...prev, insuranceCovered: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="insuranceCovered" className="text-sm text-slate-700">
                        Insurance covered
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prescriber Notes</label>
                  <Textarea
                    value={newPrescription.notes}
                    onChange={(e) => setNewPrescription((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for internal use..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleCreatePrescription} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Create Prescription
                  </Button>
                  <Button onClick={() => setIsCreating(false)} variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Pill className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {prescriptions.filter((rx) => rx.status === "draft").length}
                  </p>
                  <p className="text-sm text-slate-600">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {prescriptions.filter((rx) => rx.status === "pending").length}
                  </p>
                  <p className="text-sm text-slate-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {prescriptions.filter((rx) => rx.status === "approved" || rx.status === "dispensed").length}
                  </p>
                  <p className="text-sm text-slate-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {prescriptions.filter((rx) => rx.priority === "urgent").length}
                  </p>
                  <p className="text-sm text-slate-600">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Prescription Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="dispensed">Dispensed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prescribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">#{prescription.id}</div>
                        <div className="text-sm text-slate-600">{prescription.indication}</div>
                        {prescription.monitoringRequired && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">Monitoring Required</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{prescription.patientName}</div>
                        <div className="text-sm text-slate-600">Age: {prescription.patientAge}</div>
                        <div className="text-xs text-slate-500">
                          {prescription.patientConditions.slice(0, 2).join(", ")}
                          {prescription.patientConditions.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{prescription.medicationName}</div>
                        <div className="text-sm text-slate-600">
                          {prescription.dosage} - {prescription.frequency}
                        </div>
                        <div className="text-xs text-slate-500">
                          Duration: {prescription.duration} | Qty: {prescription.quantity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(prescription.priority)}>{prescription.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(prescription.prescribedDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-600">by {prescription.prescribedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPrescription(prescription)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Prescription #{selectedPrescription?.id} - {selectedPrescription?.patientName}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedPrescription && (
                              <div className="space-y-6">
                                {/* Prescription Overview */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Patient Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong> {selectedPrescription.patientName}
                                      </p>
                                      <p>
                                        <strong>Age:</strong> {selectedPrescription.patientAge}
                                      </p>
                                      <p>
                                        <strong>Conditions:</strong>
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedPrescription.patientConditions.map((condition, index) => (
                                          <Badge key={index} className="bg-slate-100 text-slate-800 text-xs">
                                            {condition}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">Prescription Details</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>ID:</strong> {selectedPrescription.id}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge className={getStatusColor(selectedPrescription.status)}>
                                          {selectedPrescription.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Priority:</strong>{" "}
                                        <Badge className={getPriorityColor(selectedPrescription.priority)}>
                                          {selectedPrescription.priority}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Prescribed:</strong>{" "}
                                        {new Date(selectedPrescription.prescribedDate).toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>Prescribed by:</strong> {selectedPrescription.prescribedBy}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Medication Details */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-3">Medication Information</h3>
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-lg font-medium text-slate-900">
                                          {selectedPrescription.medicationName}
                                        </p>
                                        {selectedPrescription.genericName && (
                                          <p className="text-sm text-slate-600">
                                            Generic: {selectedPrescription.genericName}
                                          </p>
                                        )}
                                        <p className="text-sm text-slate-700 mt-2">
                                          <strong>Indication:</strong> {selectedPrescription.indication}
                                        </p>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <p>
                                          <strong>Dosage:</strong> {selectedPrescription.dosage}
                                        </p>
                                        <p>
                                          <strong>Frequency:</strong> {selectedPrescription.frequency}
                                        </p>
                                        <p>
                                          <strong>Duration:</strong> {selectedPrescription.duration}
                                        </p>
                                        <p>
                                          <strong>Quantity:</strong> {selectedPrescription.quantity}
                                        </p>
                                        <p>
                                          <strong>Refills:</strong> {selectedPrescription.refills}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Instructions */}
                                {selectedPrescription.instructions && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Patient Instructions</h3>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">{selectedPrescription.instructions}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Safety Information */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-3">Safety Information</h3>
                                  <div className="grid md:grid-cols-3 gap-4">
                                    {selectedPrescription.contraindications.length > 0 && (
                                      <div>
                                        <h4 className="font-medium text-slate-900 mb-2">Contraindications</h4>
                                        <div className="space-y-1">
                                          {selectedPrescription.contraindications.map((contra, index) => (
                                            <Badge key={index} className="bg-red-100 text-red-800 text-xs block w-fit">
                                              {contra}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {selectedPrescription.sideEffects.length > 0 && (
                                      <div>
                                        <h4 className="font-medium text-slate-900 mb-2">Side Effects</h4>
                                        <div className="space-y-1">
                                          {selectedPrescription.sideEffects.map((effect, index) => (
                                            <Badge
                                              key={index}
                                              className="bg-yellow-100 text-yellow-800 text-xs block w-fit"
                                            >
                                              {effect}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {selectedPrescription.interactions.length > 0 && (
                                      <div>
                                        <h4 className="font-medium text-slate-900 mb-2">Drug Interactions</h4>
                                        <div className="space-y-1">
                                          {selectedPrescription.interactions.map((interaction, index) => (
                                            <Badge
                                              key={index}
                                              className="bg-orange-100 text-orange-800 text-xs block w-fit"
                                            >
                                              {interaction}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Monitoring */}
                                {selectedPrescription.monitoringRequired && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Monitoring Requirements</h3>
                                    <div className="bg-teal-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        {selectedPrescription.monitoringInstructions}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Cost Information */}
                                {selectedPrescription.costEstimate && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Cost Information</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-700">Estimated Cost:</span>
                                        <span className="font-medium text-slate-900">
                                          ${selectedPrescription.costEstimate.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm text-slate-700">Insurance Coverage:</span>
                                        <Badge
                                          className={
                                            selectedPrescription.insuranceCovered
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }
                                        >
                                          {selectedPrescription.insuranceCovered ? "Covered" : "Not Covered"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {selectedPrescription.notes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Prescriber Notes</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">{selectedPrescription.notes}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Reviewer Notes */}
                                {selectedPrescription.reviewerNotes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Reviewer Notes</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">{selectedPrescription.reviewerNotes}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Status Actions */}
                                {selectedPrescription.status === "draft" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() => handleStatusUpdate(selectedPrescription.id, "pending")}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Send className="h-4 w-4 mr-1" />
                                      Submit for Approval
                                    </Button>
                                  </div>
                                )}

                                {selectedPrescription.status === "pending" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() => handleStatusUpdate(selectedPrescription.id, "approved")}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleStatusUpdate(selectedPrescription.id, "cancelled")}
                                      variant="outline"
                                      className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {prescription.status === "draft" && (
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
