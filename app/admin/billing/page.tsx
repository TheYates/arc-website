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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth, hasPermission } from "@/lib/auth"
import {
  DollarSign,
  Receipt,
  Search,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
} from "lucide-react"

interface Invoice {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  serviceType: string
  amount: number
  currency: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issueDate: string
  dueDate: string
  paidDate?: string
  description: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: string
  status: "completed" | "pending" | "failed"
  date: string
  transactionId: string
}

export default function AdminBillingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("invoices")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: "INV-001",
      patientId: "5",
      patientName: "Akosua Asante",
      patientEmail: "patient@example.com",
      serviceType: "AHENEFIE",
      amount: 6000,
      currency: "GHS",
      status: "paid",
      issueDate: "2024-01-01",
      dueDate: "2024-01-15",
      paidDate: "2024-01-10",
      description: "Live-in home care package - January 2024",
      items: [{ id: "1", description: "Live-in nursing care (30 days)", quantity: 30, unitPrice: 200, total: 6000 }],
    },
    {
      id: "INV-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      patientEmail: "kofi.mensah@example.com",
      serviceType: "ADAMFO PA",
      amount: 2400,
      currency: "GHS",
      status: "overdue",
      issueDate: "2024-01-05",
      dueDate: "2024-01-20",
      description: "Daily home visit package - January 2024",
      items: [{ id: "1", description: "Daily home visits", quantity: 30, unitPrice: 80, total: 2400 }],
    },
    {
      id: "INV-003",
      patientId: "7",
      patientName: "Abena Osei",
      patientEmail: "abena.osei@example.com",
      serviceType: "Fie Ne Fie",
      amount: 4500,
      currency: "GHS",
      status: "sent",
      issueDate: "2024-01-10",
      dueDate: "2024-01-25",
      description: "Stay-in nanny service - January 2024",
      items: [{ id: "1", description: "Stay-in nanny service (30 days)", quantity: 30, unitPrice: 150, total: 4500 }],
    },
    {
      id: "INV-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      patientEmail: "kwaku.boateng@example.com",
      serviceType: "YONKO PA",
      amount: 1200,
      currency: "GHS",
      status: "draft",
      issueDate: "2024-01-15",
      dueDate: "2024-01-30",
      description: "Visit-on-request nanny service - January 2024",
      items: [{ id: "1", description: "On-request nanny visits", quantity: 24, unitPrice: 50, total: 1200 }],
    },
  ]

  const mockPayments: Payment[] = [
    {
      id: "PAY-001",
      invoiceId: "INV-001",
      amount: 6000,
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-10",
      transactionId: "TXN-123456789",
    },
    {
      id: "PAY-002",
      invoiceId: "INV-003",
      amount: 2250,
      method: "Mobile Money",
      status: "pending",
      date: "2024-01-12",
      transactionId: "TXN-987654321",
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
      loadBillingData()
    }
  }, [user, authLoading, router])

  const loadBillingData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setInvoices(mockInvoices)
    setPayments(mockPayments)
    setIsLoading(false)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.serviceType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-slate-100 text-slate-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Receipt className="h-4 w-4 text-slate-500" />
    }
  }

  const calculateTotals = () => {
    const totalRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
    const pendingAmount = invoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.amount, 0)
    const overdueAmount = invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)

    return { totalRevenue, pendingAmount, overdueAmount }
  }

  const { totalRevenue, pendingAmount, overdueAmount } = calculateTotals()

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing data...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access billing information.</AlertDescription>
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
              <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
              <p className="text-slate-600 mt-2">Manage invoices, payments, and financial records</p>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">₵{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">₵{pendingAmount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">₵{overdueAmount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Overdue Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                  <p className="text-sm text-slate-600">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payments"
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Payments
              </button>
            </nav>
          </div>
        </div>

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline" className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{invoice.id}</div>
                            <div className="text-sm text-slate-600">
                              Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{invoice.patientName}</div>
                            <div className="text-sm text-slate-600">{invoice.patientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.serviceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {invoice.currency} {invoice.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)} flex items-center space-x-1 w-fit`}>
                            {getStatusIcon(invoice.status)}
                            <span>{invoice.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`text-sm ${
                              invoice.status === "overdue" ? "text-red-600 font-medium" : "text-slate-600"
                            }`}
                          >
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedInvoice(invoice)}
                                  className="bg-transparent"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
                                </DialogHeader>
                                {selectedInvoice && (
                                  <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Invoice Information</h3>
                                        <div className="space-y-2 text-sm">
                                          <p>
                                            <strong>Invoice ID:</strong> {selectedInvoice.id}
                                          </p>
                                          <p>
                                            <strong>Issue Date:</strong>{" "}
                                            {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                                          </p>
                                          <p>
                                            <strong>Due Date:</strong>{" "}
                                            {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                          </p>
                                          <p>
                                            <strong>Status:</strong>{" "}
                                            <Badge className={getStatusColor(selectedInvoice.status)}>
                                              {selectedInvoice.status}
                                            </Badge>
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Patient Information</h3>
                                        <div className="space-y-2 text-sm">
                                          <p>
                                            <strong>Name:</strong> {selectedInvoice.patientName}
                                          </p>
                                          <p>
                                            <strong>Email:</strong> {selectedInvoice.patientEmail}
                                          </p>
                                          <p>
                                            <strong>Service:</strong> {selectedInvoice.serviceType}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold text-slate-900 mb-2">Invoice Items</h3>
                                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                          <thead className="bg-slate-50">
                                            <tr>
                                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                                                Description
                                              </th>
                                              <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">
                                                Qty
                                              </th>
                                              <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">
                                                Unit Price
                                              </th>
                                              <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">
                                                Total
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {selectedInvoice.items.map((item) => (
                                              <tr key={item.id} className="border-t border-slate-200">
                                                <td className="px-4 py-2 text-sm text-slate-900">{item.description}</td>
                                                <td className="px-4 py-2 text-sm text-slate-600 text-right">
                                                  {item.quantity}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-slate-600 text-right">
                                                  {selectedInvoice.currency} {item.unitPrice}
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">
                                                  {selectedInvoice.currency} {item.total.toLocaleString()}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                          <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="px-4 py-2 text-sm font-medium text-slate-900 text-right"
                                              >
                                                Total Amount:
                                              </td>
                                              <td className="px-4 py-2 text-sm font-bold text-slate-900 text-right">
                                                {selectedInvoice.currency} {selectedInvoice.amount.toLocaleString()}
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" className="bg-transparent">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                      </Button>
                                      {selectedInvoice.status === "draft" && (
                                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                          <Send className="h-4 w-4 mr-2" />
                                          Send Invoice
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {invoice.status === "draft" && (
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Send className="h-4 w-4" />
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
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{payment.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{payment.invoiceId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">₵{payment.amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(payment.status)} flex items-center space-x-1 w-fit`}>
                          {getStatusIcon(payment.status)}
                          <span>{payment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">{new Date(payment.date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-slate-600">{payment.transactionId}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
