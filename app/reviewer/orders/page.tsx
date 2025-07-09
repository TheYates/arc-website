"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import {
  ShoppingCart,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
} from "lucide-react";

interface PatientOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientConditions: string[];
  orderType:
    | "medical_supplies"
    | "equipment"
    | "medication"
    | "laboratory"
    | "imaging"
    | "therapy";
  orderDate: string;
  requestedBy: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "ordered"
    | "delivered"
    | "completed";
  totalCost: number;
  approvalThreshold: number;
  requiresApproval: boolean;
  items: OrderItem[];
  justification: string;
  medicalNecessity: string;
  reviewerNotes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  deliveryDate?: string;
  vendor?: string;
  insuranceCovered: boolean;
  patientResponsibility: number;
}

interface OrderItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  urgencyFlag: boolean;
  medicalCode?: string;
  prescriptionRequired: boolean;
}

export default function ReviewerOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<PatientOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PatientOrder | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock orders data
  const mockOrders: PatientOrder[] = [
    {
      id: "ORD-001",
      patientId: "5",
      patientName: "Akosua Asante",
      patientAge: 68,
      patientConditions: ["Hypertension", "Type 2 Diabetes"],
      orderType: "medical_supplies",
      orderDate: "2024-01-16T09:30:00Z",
      requestedBy: "Ama Osei",
      priority: "high",
      status: "pending",
      totalCost: 245.75,
      approvalThreshold: 200.0,
      requiresApproval: true,
      items: [
        {
          id: "item-001",
          name: "Blood Pressure Monitor",
          description:
            "Digital automatic blood pressure monitor with large display",
          category: "Monitoring Equipment",
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99,
          specifications: "Arm cuff size: Large (32-42cm), Memory: 60 readings",
          urgencyFlag: true,
          medicalCode: "A4663",
          prescriptionRequired: false,
        },
        {
          id: "item-002",
          name: "Blood Glucose Test Strips",
          description:
            "Glucose test strips compatible with OneTouch Ultra meter",
          category: "Diabetic Supplies",
          quantity: 100,
          unitPrice: 1.25,
          totalPrice: 125.0,
          specifications: "Expiry: 18 months, No coding required",
          urgencyFlag: false,
          medicalCode: "A4253",
          prescriptionRequired: true,
        },
        {
          id: "item-003",
          name: "Lancets",
          description: "Ultra-thin lancets for blood glucose testing",
          category: "Diabetic Supplies",
          quantity: 100,
          unitPrice: 0.31,
          totalPrice: 30.76,
          specifications: "30G, sterile, single-use",
          urgencyFlag: false,
          medicalCode: "A4259",
          prescriptionRequired: false,
        },
      ],
      justification:
        "Patient requires home monitoring equipment due to recent BP spikes and diabetes management needs. Current equipment is malfunctioning and patient cannot afford replacement.",
      medicalNecessity:
        "Essential for daily monitoring of hypertension and diabetes. Patient has had 3 ER visits in past month due to uncontrolled BP. Home monitoring will prevent future emergencies.",
      insuranceCovered: true,
      patientResponsibility: 49.15,
      vendor: "MedSupply Ghana Ltd",
    },
    {
      id: "ORD-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      patientAge: 72,
      patientConditions: ["Type 2 Diabetes", "Diabetic Neuropathy"],
      orderType: "equipment",
      orderDate: "2024-01-15T14:20:00Z",
      requestedBy: "Dr. Sarah Johnson",
      priority: "medium",
      status: "approved",
      totalCost: 450.0,
      approvalThreshold: 300.0,
      requiresApproval: true,
      items: [
        {
          id: "item-004",
          name: "Wheelchair - Standard",
          description: "Standard manual wheelchair with removable footrests",
          category: "Mobility Equipment",
          quantity: 1,
          unitPrice: 350.0,
          totalPrice: 350.0,
          specifications:
            "Weight capacity: 250lbs, Seat width: 18 inches, Foldable",
          urgencyFlag: false,
          medicalCode: "E1130",
          prescriptionRequired: true,
        },
        {
          id: "item-005",
          name: "Wheelchair Cushion",
          description: "Pressure relief cushion for wheelchair",
          category: "Mobility Accessories",
          quantity: 1,
          unitPrice: 100.0,
          totalPrice: 100.0,
          specifications: "Gel-foam hybrid, 18x16 inches, washable cover",
          urgencyFlag: false,
          medicalCode: "E2601",
          prescriptionRequired: false,
        },
      ],
      justification:
        "Patient has developed severe diabetic neuropathy affecting mobility. Walking has become painful and unsafe. Wheelchair needed for safe transportation and daily activities.",
      medicalNecessity:
        "Patient cannot walk more than 10 feet without severe pain. Risk of falls is high. Wheelchair is medically necessary for safe mobility and independence.",
      approvedBy: "Dr. Kwame Mensah",
      approvedDate: "2024-01-15T16:00:00Z",
      reviewerNotes:
        "Approved based on documented mobility limitations and fall risk assessment.",
      insuranceCovered: true,
      patientResponsibility: 90.0,
      vendor: "Ghana Medical Equipment Co.",
    },
    {
      id: "ORD-003",
      patientId: "7",
      patientName: "Abena Osei",
      patientAge: 45,
      patientConditions: ["Post-surgical recovery"],
      orderType: "medical_supplies",
      orderDate: "2024-01-14T11:15:00Z",
      requestedBy: "Ama Osei",
      priority: "urgent",
      status: "ordered",
      totalCost: 125.5,
      approvalThreshold: 150.0,
      requiresApproval: false,
      items: [
        {
          id: "item-006",
          name: "Wound Dressing Kit",
          description: "Complete wound care kit with sterile dressings",
          category: "Wound Care",
          quantity: 2,
          unitPrice: 35.75,
          totalPrice: 71.5,
          specifications: "Includes gauze, tape, antiseptic, gloves",
          urgencyFlag: true,
          medicalCode: "A6402",
          prescriptionRequired: false,
        },
        {
          id: "item-007",
          name: "Compression Bandages",
          description: "Elastic compression bandages for post-surgical support",
          category: "Wound Care",
          quantity: 6,
          unitPrice: 9.0,
          totalPrice: 54.0,
          specifications: "4-inch width, latex-free, self-adhesive",
          urgencyFlag: true,
          medicalCode: "A6448",
          prescriptionRequired: false,
        },
      ],
      justification:
        "Post-surgical wound care supplies needed for daily dressing changes. Current supplies running low and wound requires specialized care.",
      medicalNecessity:
        "Essential for proper wound healing and infection prevention. Surgical site requires daily monitoring and dressing changes.",
      approvedBy: "Dr. Kwame Mensah",
      approvedDate: "2024-01-14T12:00:00Z",
      reviewerNotes:
        "Approved for immediate processing due to urgent wound care needs.",
      insuranceCovered: true,
      patientResponsibility: 25.1,
      vendor: "MedSupply Ghana Ltd",
    },
    {
      id: "ORD-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      patientAge: 58,
      patientConditions: ["Stroke recovery", "Mobility issues"],
      orderType: "therapy",
      orderDate: "2024-01-13T16:45:00Z",
      requestedBy: "Dr. Sarah Johnson",
      priority: "medium",
      status: "rejected",
      totalCost: 800.0,
      approvalThreshold: 500.0,
      requiresApproval: true,
      items: [
        {
          id: "item-008",
          name: "Physical Therapy Sessions",
          description: "Specialized neurological rehabilitation therapy",
          category: "Therapy Services",
          quantity: 10,
          unitPrice: 80.0,
          totalPrice: 800.0,
          specifications: "1-hour sessions, certified neurological therapist",
          urgencyFlag: false,
          medicalCode: "97110",
          prescriptionRequired: true,
        },
      ],
      justification:
        "Patient requires specialized neurological rehabilitation following stroke. Standard therapy has plateaued and specialized intervention needed.",
      medicalNecessity:
        "Patient has reached plateau with current therapy. Specialized neurological rehabilitation may improve functional outcomes.",
      approvedBy: "Dr. Kwame Mensah",
      approvedDate: "2024-01-13T18:30:00Z",
      reviewerNotes:
        "Rejected - insufficient documentation of medical necessity. Standard therapy should continue for 4 more weeks before considering specialized intervention.",
      rejectionReason:
        "Insufficient medical documentation to support need for specialized therapy at this time. Continue with current therapy plan.",
      insuranceCovered: false,
      patientResponsibility: 800.0,
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "reviewer") {
      router.push("/dashboard");
    }
    if (user && user.role === "reviewer") {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setOrders(mockOrders);
    setIsLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesType =
      selectedType === "all" || order.orderType === selectedType;
    const matchesPriority =
      selectedPriority === "all" || order.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "ordered":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medical_supplies":
        return "bg-blue-100 text-blue-800";
      case "equipment":
        return "bg-purple-100 text-purple-800";
      case "medication":
        return "bg-green-100 text-green-800";
      case "laboratory":
        return "bg-yellow-100 text-yellow-800";
      case "imaging":
        return "bg-orange-100 text-orange-800";
      case "therapy":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleOrderReview = async (
    orderId: string,
    action: "approve" | "reject"
  ) => {
    if (action === "reject" && !reviewNotes.trim()) {
      alert("Please provide rejection reason");
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: action === "approve" ? "approved" : "rejected",
              approvedBy: user?.firstName + " " + user?.lastName,
              approvedDate: new Date().toISOString(),
              reviewerNotes: reviewNotes || order.reviewerNotes,
              rejectionReason: action === "reject" ? reviewNotes : undefined,
            }
          : order
      )
    );

    setSelectedOrder(null);
    setReviewNotes("");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-88" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-200 p-4">
                <div className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-slate-200 p-4">
                  <div className="grid grid-cols-7 gap-4">
                    {[...Array(7)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "reviewer") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Orders</h1>
          <p className="text-slate-600 mt-2">
            Review and approve patient care orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {orders.filter((o) => o.status === "pending").length}
                  </p>
                  <p className="text-sm text-slate-600">Pending Review</p>
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
                    {orders.filter((o) => o.status === "approved").length}
                  </p>
                  <p className="text-sm text-slate-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    $
                    {orders
                      .filter((o) => o.status === "pending")
                      .reduce((sum, o) => sum + o.totalCost, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600">Pending Value</p>
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
                    {
                      orders.filter(
                        (o) => o.priority === "urgent" && o.status === "pending"
                      ).length
                    }
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
              <ShoppingCart className="h-5 w-5" />
              <span>Order Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search orders, patients, or items..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="all">All Status</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Types</option>
                <option value="medical_supplies">Medical Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="medication">Medication</option>
                <option value="laboratory">Laboratory</option>
                <option value="imaging">Imaging</option>
                <option value="therapy">Therapy</option>
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

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={order.priority === "urgent" ? "bg-red-50" : ""}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {order.id}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          by {order.requestedBy}
                        </div>
                        {order.requiresApproval && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs mt-1">
                            Requires Approval
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {order.patientName}
                        </div>
                        <div className="text-sm text-slate-600">
                          Age: {order.patientAge}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.patientConditions.slice(0, 2).join(", ")}
                          {order.patientConditions.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(order.orderType)}>
                        {order.orderType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          ${order.totalCost.toFixed(2)}
                        </div>
                        {order.requiresApproval &&
                          order.totalCost > order.approvalThreshold && (
                            <div className="text-xs text-red-600">
                              Above threshold
                            </div>
                          )}
                        <div className="text-xs text-slate-500">
                          Patient: ${order.patientResponsibility.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Order Review - {selectedOrder?.id}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Overview */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">
                                      Patient Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {selectedOrder.patientName}
                                      </p>
                                      <p>
                                        <strong>Age:</strong>{" "}
                                        {selectedOrder.patientAge}
                                      </p>
                                      <p>
                                        <strong>Conditions:</strong>
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedOrder.patientConditions.map(
                                          (condition, index) => (
                                            <Badge
                                              key={index}
                                              className="bg-slate-100 text-slate-800 text-xs"
                                            >
                                              {condition}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">
                                      Order Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Order ID:</strong>{" "}
                                        {selectedOrder.id}
                                      </p>
                                      <p>
                                        <strong>Type:</strong>{" "}
                                        <Badge
                                          className={getTypeColor(
                                            selectedOrder.orderType
                                          )}
                                        >
                                          {selectedOrder.orderType.replace(
                                            "_",
                                            " "
                                          )}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Priority:</strong>{" "}
                                        <Badge
                                          className={getPriorityColor(
                                            selectedOrder.priority
                                          )}
                                        >
                                          {selectedOrder.priority}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge
                                          className={getStatusColor(
                                            selectedOrder.status
                                          )}
                                        >
                                          {selectedOrder.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Requested:</strong>{" "}
                                        {new Date(
                                          selectedOrder.orderDate
                                        ).toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>Requested by:</strong>{" "}
                                        {selectedOrder.requestedBy}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Cost Analysis */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-3">
                                    Cost Analysis
                                  </h3>
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <p className="font-medium text-slate-900">
                                          Total Cost
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                          ${selectedOrder.totalCost.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">
                                          Patient Responsibility
                                        </p>
                                        <p className="text-lg font-semibold text-slate-900">
                                          $
                                          {selectedOrder.patientResponsibility.toFixed(
                                            2
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">
                                          Insurance Coverage
                                        </p>
                                        <Badge
                                          className={
                                            selectedOrder.insuranceCovered
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }
                                        >
                                          {selectedOrder.insuranceCovered
                                            ? "Covered"
                                            : "Not Covered"}
                                        </Badge>
                                      </div>
                                    </div>
                                    {selectedOrder.requiresApproval && (
                                      <div className="mt-3 pt-3 border-t border-blue-200">
                                        <p className="text-sm text-slate-700">
                                          <strong>Approval Required:</strong>{" "}
                                          Cost exceeds threshold of $
                                          {selectedOrder.approvalThreshold.toFixed(
                                            2
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-3">
                                    Order Items
                                  </h3>
                                  <div className="space-y-4">
                                    {selectedOrder.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="border border-slate-200 rounded-lg p-4"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex-1">
                                            <h4 className="font-medium text-slate-900">
                                              {item.name}
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                              {item.description}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                              <Badge className="bg-slate-100 text-slate-800 text-xs">
                                                {item.category}
                                              </Badge>
                                              {item.urgencyFlag && (
                                                <Badge className="bg-red-100 text-red-800 text-xs">
                                                  Urgent
                                                </Badge>
                                              )}
                                              {item.prescriptionRequired && (
                                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                  Rx Required
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium text-slate-900">
                                              ${item.totalPrice.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                              {item.quantity} × $
                                              {item.unitPrice.toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                        {item.specifications && (
                                          <div className="text-sm text-slate-600 mt-2">
                                            <strong>Specifications:</strong>{" "}
                                            {item.specifications}
                                          </div>
                                        )}
                                        {item.medicalCode && (
                                          <div className="text-sm text-slate-600 mt-1">
                                            <strong>Medical Code:</strong>{" "}
                                            {item.medicalCode}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Medical Justification */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-3">
                                    Medical Justification
                                  </h3>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-slate-900 mb-2">
                                        Justification
                                      </h4>
                                      <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-sm text-slate-700">
                                          {selectedOrder.justification}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-slate-900 mb-2">
                                        Medical Necessity
                                      </h4>
                                      <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-slate-700">
                                          {selectedOrder.medicalNecessity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Vendor Information */}
                                {selectedOrder.vendor && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Vendor Information
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        <strong>Vendor:</strong>{" "}
                                        {selectedOrder.vendor}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Previous Review Notes */}
                                {selectedOrder.reviewerNotes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Previous Review Notes
                                    </h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        {selectedOrder.reviewerNotes}
                                      </p>
                                      {selectedOrder.approvedBy && (
                                        <p className="text-xs text-slate-500 mt-2">
                                          by {selectedOrder.approvedBy} on{" "}
                                          {new Date(
                                            selectedOrder.approvedDate!
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Rejection Reason */}
                                {selectedOrder.rejectionReason && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Rejection Reason
                                    </h3>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        {selectedOrder.rejectionReason}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Review Actions */}
                                {selectedOrder.status === "pending" && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Review Notes
                                      </label>
                                      <Textarea
                                        placeholder="Enter your review notes..."
                                        value={reviewNotes}
                                        onChange={(e) =>
                                          setReviewNotes(e.target.value)
                                        }
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                      <Button
                                        onClick={() =>
                                          handleOrderReview(
                                            selectedOrder.id,
                                            "approve"
                                          )
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve Order
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleOrderReview(
                                            selectedOrder.id,
                                            "reject"
                                          )
                                        }
                                        variant="outline"
                                        className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                      >
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Reject Order
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
  );
}
