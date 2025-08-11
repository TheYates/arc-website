"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminUsersMobile({
  loader,
  title = "User Management",
  subtitle = "Manage platform users and their roles",
  onCreate,
}: {
  loader?: () => Promise<User[]>;
  title?: string;
  subtitle?: string;
  onCreate?: () => void;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = loader ? await loader() : [];
        setUsers(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [loader]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      const roleOk = role === "all" || u.role === role;
      const textOk = [u.firstName, u.lastName, u.email, u.username]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term));
      return roleOk && textOk;
    });
  }, [users, q]);

  const roleBadge = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
      reviewer: "bg-blue-100 text-blue-800",
      caregiver: "bg-green-100 text-green-800",
      patient: "bg-gray-100 text-gray-800",
    };
    return <Badge className={map[role]}>{role.replace("_", " ")}</Badge>;
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {onCreate && (
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={onCreate}
            aria-label="Create user"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="reviewer">Reviewer</SelectItem>
            <SelectItem value="caregiver">Care Giver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          No users
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card
              key={u.id}
              className="active:scale-[0.99] transition-transform"
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {roleBadge(u.role)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
