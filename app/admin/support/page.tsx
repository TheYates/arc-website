"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LifeBuoy,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Book,
  Video,
  Download,
} from "lucide-react";

export default function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const supportTickets = [
    {
      id: "TICK-001",
      title: "Database connection issues",
      status: "open",
      priority: "high",
      created: "2024-01-15",
      lastUpdate: "2024-01-16",
    },
    {
      id: "TICK-002", 
      title: "User authentication problems",
      status: "in-progress",
      priority: "medium",
      created: "2024-01-14",
      lastUpdate: "2024-01-15",
    },
    {
      id: "TICK-003",
      title: "Performance optimization request",
      status: "resolved",
      priority: "low",
      created: "2024-01-10",
      lastUpdate: "2024-01-12",
    },
  ];

  const faqItems = [
    {
      question: "How do I reset a user's password?",
      answer: "Navigate to Admin > Users, find the user, and click 'Reset Password'. The user will receive an email with instructions.",
    },
    {
      question: "How do I approve patient applications?",
      answer: "Go to Admin > Applications, review the application details, and click 'Approve' or 'Reject' with appropriate notes.",
    },
    {
      question: "How do I manage caregiver schedules?",
      answer: "Use the Admin > Schedules section to view, create, and modify caregiver schedules and assignments.",
    },
    {
      question: "How do I generate reports?",
      answer: "Reports can be generated from the Admin > Reports section. Select the report type and date range.",
    },
  ];

  const resources = [
    {
      title: "Admin User Guide",
      description: "Complete guide for using the admin panel",
      type: "documentation",
      icon: Book,
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      type: "documentation", 
      icon: FileText,
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      type: "video",
      icon: Video,
    },
    {
      title: "System Requirements",
      description: "Technical requirements and setup guide",
      type: "download",
      icon: Download,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "resolved":
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">
            Get help, submit tickets, and access resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call Support
          </Button>
          <Button>
            <MessageCircle className="h-4 w-4 mr-2" />
            Live Chat
          </Button>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Phone className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">24/7 Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">admin@arc.com</p>
              <p className="text-xs text-muted-foreground">Response within 2 hours</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageCircle className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Instant messaging</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        {/* Support Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <h4 className="font-medium">{ticket.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {ticket.created}</span>
                        <span>Updated: {ticket.lastUpdate}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems
                  .filter(item =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{item.question}</h4>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <resource.icon className="h-8 w-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Resource
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Support */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={6}
                />
              </div>
              <Button className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Support Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
