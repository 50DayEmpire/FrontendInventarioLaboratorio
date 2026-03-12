"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserService } from "@/services/userService";
import { AddUserDialog } from "@/components/add-user-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
}

interface ApiUser {
  id: string;
  userName: string;
  roles: string[];
}

const statusStyles: Record<string, string> = {
  Active: "bg-accent/15 text-accent border-accent/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Pending: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        const apiUsers: ApiUser[] = await UserService.getAll();
        if (!mounted) return;

        const mappedUsers: User[] = (
          Array.isArray(apiUsers) ? apiUsers : []
        ).map((user) => ({
          id: String(user.id),
          name: user.userName,
          email: "",
          role: user.roles?.[0] ?? "Sin rol",
          status: "Active",
          lastActive: "No disponible",
        }));

        setUsers(mappedUsers);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError("No se pudieron cargar los usuarios");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function handleDelete(id: string) {
    setUsers(users.filter((u) => u.id !== id));
  }

  async function handleDeleteUser(id: string) {
    try {
      await UserService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(
        "No se pudo eliminar el usuario. Intenta de nuevo. No se puede eliminar usuarios Admin, elimine su rol primero",
      );
    }
  }

  function handleAddUser(newUser: User) {
    setUsers([newUser, ...users]);
  }

  function handleUpdateUser(updatedUser: User) {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts and access
          </p>
        </div>

        <AddUserDialog onUserAdded={handleAddUser} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              {roleFilter === "all" ? "Todos" : roleFilter}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRoleFilter("all")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRoleFilter("Admin")}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("Editor")}>
              Editor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("User")}>
              User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("Sin rol")}>
              Sin Rol
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">
                Role
              </TableHead>
              <TableHead className="text-muted-foreground hidden sm:table-cell">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">
                Last Active
              </TableHead>
              <TableHead className="text-muted-foreground w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-medium">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={statusStyles[user.status]}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {user.lastActive}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditUserDialog
                        user={user}
                        onUserUpdated={handleUpdateUser}
                        trigger={
                          <DropdownMenuItem
                            className="gap-2"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
