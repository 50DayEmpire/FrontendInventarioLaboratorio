"use client"

import { useState } from "react"
import { Shield, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Permission {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  color: string
  permissions: Permission[]
}

const initialRoles: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to all system features and settings",
    userCount: 2,
    color: "bg-primary/15 text-primary border-primary/30",
    permissions: [
      { id: "user_create", name: "Create Users", description: "Add new user accounts", enabled: true },
      { id: "user_edit", name: "Edit Users", description: "Modify existing user accounts", enabled: true },
      { id: "user_delete", name: "Delete Users", description: "Remove user accounts from the system", enabled: true },
      { id: "role_manage", name: "Manage Roles", description: "Create and edit roles and permissions", enabled: true },
      { id: "product_create", name: "Create Products", description: "Add new products to the catalog", enabled: true },
      { id: "product_edit", name: "Edit Products", description: "Modify existing product details", enabled: true },
      { id: "product_delete", name: "Delete Products", description: "Remove products from the catalog", enabled: true },
      { id: "analytics_view", name: "View Analytics", description: "Access system analytics and reports", enabled: true },
      { id: "settings_manage", name: "Manage Settings", description: "Modify system-wide settings", enabled: true },
    ],
  },
  {
    id: "editor",
    name: "Editor",
    description: "Create and edit content, manage products",
    userCount: 3,
    color: "bg-accent/15 text-accent border-accent/30",
    permissions: [
      { id: "user_create", name: "Create Users", description: "Add new user accounts", enabled: false },
      { id: "user_edit", name: "Edit Users", description: "Modify existing user accounts", enabled: false },
      { id: "user_delete", name: "Delete Users", description: "Remove user accounts from the system", enabled: false },
      { id: "role_manage", name: "Manage Roles", description: "Create and edit roles and permissions", enabled: false },
      { id: "product_create", name: "Create Products", description: "Add new products to the catalog", enabled: true },
      { id: "product_edit", name: "Edit Products", description: "Modify existing product details", enabled: true },
      { id: "product_delete", name: "Delete Products", description: "Remove products from the catalog", enabled: false },
      { id: "analytics_view", name: "View Analytics", description: "Access system analytics and reports", enabled: true },
      { id: "settings_manage", name: "Manage Settings", description: "Modify system-wide settings", enabled: false },
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to products and basic analytics",
    userCount: 3,
    color: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    permissions: [
      { id: "user_create", name: "Create Users", description: "Add new user accounts", enabled: false },
      { id: "user_edit", name: "Edit Users", description: "Modify existing user accounts", enabled: false },
      { id: "user_delete", name: "Delete Users", description: "Remove user accounts from the system", enabled: false },
      { id: "role_manage", name: "Manage Roles", description: "Create and edit roles and permissions", enabled: false },
      { id: "product_create", name: "Create Products", description: "Add new products to the catalog", enabled: false },
      { id: "product_edit", name: "Edit Products", description: "Modify existing product details", enabled: false },
      { id: "product_delete", name: "Delete Products", description: "Remove products from the catalog", enabled: false },
      { id: "analytics_view", name: "View Analytics", description: "Access system analytics and reports", enabled: true },
      { id: "settings_manage", name: "Manage Settings", description: "Modify system-wide settings", enabled: false },
    ],
  },
]

export default function PermissionsPage() {
  const [roles, setRoles] = useState(initialRoles)
  const [expandedRole, setExpandedRole] = useState<string | null>("admin")

  function togglePermission(roleId: string, permissionId: string) {
    setRoles(
      roles.map((role) => {
        if (role.id !== roleId) return role
        return {
          ...role,
          permissions: role.permissions.map((p) =>
            p.id === permissionId ? { ...p, enabled: !p.enabled } : p
          ),
        }
      })
    )
  }

  function getEnabledCount(role: Role) {
    return role.permissions.filter((p) => p.enabled).length
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage roles and their access levels
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Shield className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.userCount} users</p>
                  </div>
                </div>
                <Badge variant="outline" className={role.color}>
                  {getEnabledCount(role)}/{role.permissions.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Details */}
      <div className="space-y-4">
        {roles.map((role) => {
          const isExpanded = expandedRole === role.id
          return (
            <Card key={role.id} className="bg-card border-border overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                aria-expanded={isExpanded}
              >
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors">
                  <div>
                    <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                      {role.name}
                      <Badge variant="outline" className={cn("text-xs", role.color)}>
                        {role.userCount} users
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {role.description}
                    </CardDescription>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </CardHeader>
              </button>
              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_1fr_80px] items-center px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Permission
                      </p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">
                        Description
                      </p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                        Access
                      </p>
                    </div>
                    {role.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_1fr_80px] items-center rounded-lg px-3 py-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {permission.enabled ? (
                            <Check className="h-4 w-4 text-accent shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          )}
                          <Label
                            htmlFor={`${role.id}-${permission.id}`}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {permission.description}
                        </p>
                        <div className="flex justify-end">
                          <Switch
                            id={`${role.id}-${permission.id}`}
                            checked={permission.enabled}
                            onCheckedChange={() => togglePermission(role.id, permission.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button size="sm">Save Changes</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
