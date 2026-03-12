"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserPermission {
  permissionId: string;
  granted: boolean;
  source: "role" | "custom";
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
  joinedDate: string;
  customPermissions: UserPermission[];
}

const usersData: Record<string, UserData> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 min ago",
    joinedDate: "Jan 15, 2025",
    customPermissions: [],
  },
  "2": {
    id: "2",
    name: "James Miller",
    email: "james.m@company.com",
    role: "Editor",
    status: "Active",
    lastActive: "15 min ago",
    joinedDate: "Mar 3, 2025",
    customPermissions: [
      { permissionId: "product_delete", granted: true, source: "custom" },
    ],
  },
};

const statusStyles: Record<string, string> = {
  Active: "bg-accent/15 text-accent border-accent/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Pending: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

export default function UserPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  // const userData = usersData[userId]
  const userData = usersData[1]; // For testing, always load the first user

  const [role, setRole] = useState(userData?.role ?? "Viewer");
  const [name, setName] = useState(userData?.name ?? "");
  const [email, setEmail] = useState(userData?.email ?? "");
  const [saved, setSaved] = useState(false);

  if (!userData) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-sm">User not found.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  const handleRoleChange = (value: string) => {};

  const handleSave = () => {
    // Here you would typically send the updated user data to your backend API
    console.log("Saving user data:", { name, email, role });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // Reset saved state after 2 seconds
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {userData.name}
              </h1>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" onClick={handleSave}>
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* User Info + Role Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Profile Card */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">User Details</CardTitle>
            <CardDescription>
              Profile information and role assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
