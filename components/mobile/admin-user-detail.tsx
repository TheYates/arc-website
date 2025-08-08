"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User, UserRole } from "@/lib/auth";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Shield,
  Eye,
  UserCheck,
  Crown,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AdminUserDetailMobile({ id }: { id: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const demoUsers: User[] = [
          {
            id: "1",
            email: "admin@alpharescue.com",
            username: "admin",
            firstName: "Admin",
            lastName: "User",
            phone: "+233 XX XXX XXXX",
            address: "Accra, Ghana",
            role: "admin",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
            isActive: true,
          },
          {
            id: "2",
            email: "dr.mensah@alpharescue.com",
            username: "drmensah",
            firstName: "Dr. Kwame",
            lastName: "Mensah",
            phone: "+233 XX XXX XXXX",
            address: "Kumasi, Ghana",
            role: "reviewer",
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false,
            isActive: true,
          },
          {
            id: "3",
            email: "ama.nurse@alpharescue.com",
            username: "nurseama",
            firstName: "Ama",
            lastName: "Asante",
            phone: "+233 XX XXX XXXX",
            address: "Tema, Ghana",
            role: "care_giver",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
            isActive: true,
          },
        ];
        const createdUsersData = localStorage.getItem("auth_users");
        let createdUsers: User[] = [];
        if (createdUsersData) {
          try {
            const userAccounts: { user: User }[] = JSON.parse(createdUsersData);
            createdUsers = userAccounts
              .map((a) => a.user)
              .filter((u) => u.role !== "patient");
          } catch {}
        }
        const found =
          [...demoUsers, ...createdUsers].find((u) => u.id === id) || null;
        setUser(found);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const roleBadge = (role: UserRole) => {
    const map: Record<
      UserRole,
      { cls: string; icon: ReactNode; label: string }
    > = {
      super_admin: {
        cls: "bg-purple-100 text-purple-800",
        icon: <Crown className="h-3 w-3 mr-1" />,
        label: "Super Admin",
      },
      admin: {
        cls: "bg-red-100 text-red-800",
        icon: <Shield className="h-3 w-3 mr-1" />,
        label: "Admin",
      },
      reviewer: {
        cls: "bg-blue-100 text-blue-800",
        icon: <Eye className="h-3 w-3 mr-1" />,
        label: "Reviewer",
      },
      care_giver: {
        cls: "bg-green-100 text-green-800",
        icon: <UserCheck className="h-3 w-3 mr-1" />,
        label: "Care Giver",
      },
      patient: {
        cls: "bg-gray-100 text-gray-800",
        icon: <Users className="h-3 w-3 mr-1" />,
        label: "Patient",
      },
    };
    const r = map[role];
    return (
      <Badge className={r.cls}>
        {r.icon}
        {r.label}
      </Badge>
    );
  };

  const statusBadge = (u: User) => {
    if (!u.isEmailVerified)
      return (
        <Badge variant="destructive" className="flex items-center">
          <XCircle className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      );
    if (!u.profileComplete)
      return (
        <Badge className="bg-amber-100 text-amber-800 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      );
    return (
      <Badge className="bg-green-100 text-green-800 flex items-center">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (!user)
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 font-medium">User not found</div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">User Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage user information
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/users")}
        className="px-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="font-semibold">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-muted-foreground">@{user.username}</div>
          <div className="flex items-center gap-2 mt-2">
            {roleBadge(user.role)}
            {statusBadge(user)}
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {user.email}
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              {user.phone}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {user.address}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-medium">Account Status</div>
          <div className="flex items-center justify-between text-sm">
            <span>Email Verification</span>
            {user.isEmailVerified ? (
              <Badge className="bg-green-100 text-green-800 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Profile Complete</span>
            {user.profileComplete ? (
              <Badge className="bg-green-100 text-green-800 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-medium">Activity</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Created:{" "}
              {user.createdAt ? formatDate(new Date(user.createdAt)) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Last Login:{" "}
              {user.lastLogin ? formatDate(new Date(user.lastLogin)) : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
