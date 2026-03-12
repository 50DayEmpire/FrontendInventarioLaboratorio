"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Boxes,
  ChevronDown,
  ClipboardList,
  Loader2,
  MessageSquareWarning,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductService } from "@/services/productService";
import { SolicitudesService } from "@/services/solicitudesService";

interface ApiSolicitudDetalle {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
}

interface ApiSolicitud {
  id: number;
  fechaSolicitud: string;
  estado: string;
  comentarios?: string | null;
  motivoRechazo?: string | null;
  usuario: string;
  detalles: ApiSolicitudDetalle[];
}

interface ApiProduct {
  id: number;
  rutaImagen: string | null;
}

interface SolicitudDetalle extends ApiSolicitudDetalle {
  imageUrl: string;
}

interface SolicitudCard {
  id: number;
  fechaSolicitud: string;
  estado: string;
  comentarios: string;
  motivoRechazo: string;
  usuario: string;
  totalProductos: number;
  detalles: SolicitudDetalle[];
}

const statusStyles: Record<string, string> = {
  Pendiente: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Aprobado: "bg-accent/15 text-accent border-accent/30",
  Rechazado: "bg-destructive/10 text-destructive border-destructive/30",
};

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' rx='16' fill='%23F1F5F9'/%3E%3Cpath d='M26 52h28a2 2 0 0 0 1.6-3.2l-8.22-10.96a2 2 0 0 0-3.1-.03l-5.48 7.03-3.54-4.15a2 2 0 0 0-3.08.07L24.4 48.8A2 2 0 0 0 26 52Z' fill='%2394A3B8'/%3E%3Ccircle cx='31.5' cy='29.5' r='4.5' fill='%2394A3B8'/%3E%3C/svg%3E";

function getImageUrl(rutaImagen: string | null) {
  if (!rutaImagen) return "";
  if (rutaImagen.startsWith("http://") || rutaImagen.startsWith("https://")) {
    return rutaImagen;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const normalizedPath = rutaImagen.startsWith("/")
    ? rutaImagen
    : `/${rutaImagen}`;
  return `${baseUrl}${normalizedPath}`;
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  const normalized = padding ? `${base64}${"=".repeat(4 - padding)}` : base64;
  return atob(normalized);
}

function getJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const decoded = decodeBase64Url(parts[1]);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getIsAdminFromToken(token: string | null) {
  if (!token) return false;

  const payload = getJwtPayload(token);
  if (!payload) return false;

  const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const fallbackRole = payload.role ?? payload.roles;
  const rawRoles = roleClaim ?? fallbackRole;
  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

  return roles.some((role) => role === "Admin");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudCard[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [denyingCardId, setDenyingCardId] = useState<number | null>(null);
  const [denyMessages, setDenyMessages] = useState<Record<number, string>>({});
  const [processingAction, setProcessingAction] = useState<{
    id: number | null;
    type: "approve" | "deny" | null;
  }>({ id: null, type: null });
  const [actionError, setActionError] = useState("");

  async function loadSolicitudes() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [solicitudesData, productsData] = await Promise.all([
        SolicitudesService.getAll(),
        ProductService.getAll(),
      ]);

      const productImageMap = new Map<number, string>();
      const normalizedProducts = Array.isArray(productsData)
        ? (productsData as ApiProduct[])
        : [];

      normalizedProducts.forEach((product) => {
        productImageMap.set(product.id, getImageUrl(product.rutaImagen));
      });

      const normalizedSolicitudes = Array.isArray(solicitudesData)
        ? (solicitudesData as ApiSolicitud[]).map((solicitud) => ({
            id: solicitud.id,
            fechaSolicitud: solicitud.fechaSolicitud,
            estado: solicitud.estado,
            comentarios: solicitud.comentarios || "",
            motivoRechazo: solicitud.motivoRechazo || "",
            usuario: solicitud.usuario,
            totalProductos: Array.isArray(solicitud.detalles)
              ? solicitud.detalles.reduce(
                  (total, detalle) => total + (detalle.cantidad || 0),
                  0,
                )
              : 0,
            detalles: Array.isArray(solicitud.detalles)
              ? solicitud.detalles.map((detalle) => ({
                  ...detalle,
                  imageUrl:
                    productImageMap.get(detalle.productoId) || placeholderImage,
                }))
              : [],
          }))
        : [];

      setSolicitudes(normalizedSolicitudes);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setErrorMessage("No se pudieron cargar las solicitudes");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsAdmin(getIsAdminFromToken(localStorage.getItem("token")));
    void loadSolicitudes();
  }, []);

  function toggleExpanded(id: number) {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function handleDenyDraftChange(id: number, value: string) {
    setDenyMessages((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  async function handleApprove(id: number) {
    setActionError("");
    setProcessingAction({ id, type: "approve" });

    try {
      await SolicitudesService.AdminApprove(id);
      await loadSolicitudes();
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
      setActionError("No se pudo aprobar la solicitud");
    } finally {
      setProcessingAction({ id: null, type: null });
    }
  }

  async function handleDeny(id: number) {
    const motivo = denyMessages[id]?.trim();
    if (!motivo) {
      setActionError("Debes ingresar un motivo de rechazo");
      return;
    }

    setActionError("");
    setProcessingAction({ id, type: "deny" });

    try {
      await SolicitudesService.AdminDeny(id, motivo);
      setDenyMessages((prev) => ({
        ...prev,
        [id]: "",
      }));
      setDenyingCardId(null);
      await loadSolicitudes();
    } catch (error) {
      console.error("Error rechazando solicitud:", error);
      setActionError("No se pudo rechazar la solicitud");
    } finally {
      setProcessingAction({ id: null, type: null });
    }
  }

  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const query = search.toLowerCase();
    const matchesSearch =
      solicitud.usuario.toLowerCase().includes(query) ||
      solicitud.detalles.some((detalle) =>
        detalle.nombreProducto.toLowerCase().includes(query),
      );
    const matchesStatus =
      statusFilter === "all" || solicitud.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = solicitudes.filter(
    (solicitud) => solicitud.estado === "Pendiente",
  ).length;
  const approvedCount = solicitudes.filter(
    (solicitud) => solicitud.estado === "Aprobado",
  ).length;
  const rejectedCount = solicitudes.filter(
    (solicitud) => solicitud.estado === "Rechazado",
  ).length;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">Cargando solicitudes...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Solicitudes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Revisa el historial de solicitudes y responde las pendientes desde una sola vista.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2 px-3 py-1.5 text-sm font-medium">
          {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
          {isAdmin ? "Modo administrador" : "Vista de usuario"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {solicitudes.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {pendingCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <MessageSquareWarning className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {approvedCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <BadgeCheck className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {rejectedCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Bandeja de solicitudes</CardTitle>
          <CardDescription>
            {filteredSolicitudes.length} solicitud{filteredSolicitudes.length === 1 ? "" : "es"} visible{filteredSolicitudes.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o producto..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}

          <div className="space-y-4">
            {filteredSolicitudes.map((solicitud) => {
              const isPending = solicitud.estado === "Pendiente";
              const isBusy = processingAction.id === solicitud.id;
              const isExpanded = Boolean(expandedCards[solicitud.id]);
              const showDenyForm = denyingCardId === solicitud.id;

              return (
                <Collapsible
                  key={solicitud.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(solicitud.id)}
                >
                  <Card className="overflow-hidden border-border bg-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                              <UserRound className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Solicitante</p>
                              <p className="text-base font-semibold text-foreground">
                                {solicitud.usuario}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={statusStyles[solicitud.estado] || ""}
                            >
                              {solicitud.estado}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <Boxes className="h-4 w-4" />
                              {solicitud.totalProductos} producto{solicitud.totalProductos === 1 ? "" : "s"}
                            </span>
                            <span>{formatDate(solicitud.fechaSolicitud)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          {isAdmin && (
                            <>
                              <Button
                                onClick={() => void handleApprove(solicitud.id)}
                                disabled={!isPending || isBusy}
                                className="gap-2"
                              >
                                {isBusy && processingAction.type === "approve" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <BadgeCheck className="h-4 w-4" />
                                )}
                                Aprobar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setDenyingCardId((current) =>
                                    current === solicitud.id ? null : solicitud.id,
                                  )
                                }
                                disabled={!isPending || isBusy}
                              >
                                Denegar
                              </Button>
                            </>
                          )}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="gap-2 self-start sm:self-center">
                              {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      {showDenyForm && isAdmin && isPending && (
                        <div className="border-t border-border bg-secondary/20 px-5 py-4">
                          <div className="space-y-3">
                            <Label htmlFor={`motivo-${solicitud.id}`}>
                              Motivo de rechazo
                            </Label>
                            <Textarea
                              id={`motivo-${solicitud.id}`}
                              rows={3}
                              placeholder="Explica por qué la solicitud será rechazada"
                              value={denyMessages[solicitud.id] || ""}
                              onChange={(event) =>
                                handleDenyDraftChange(solicitud.id, event.target.value)
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => void handleDeny(solicitud.id)}
                                disabled={isBusy}
                                className="gap-2"
                              >
                                {isBusy && processingAction.type === "deny" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                Guardar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setDenyingCardId(null)}
                                disabled={isBusy}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <CollapsibleContent>
                        <div className="border-t border-border bg-secondary/20 px-5 py-5">
                          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="space-y-3">
                              {solicitud.detalles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No hay productos asociados a esta solicitud.
                                </p>
                              ) : (
                                solicitud.detalles.map((detalle) => (
                                  <div
                                    key={`${solicitud.id}-${detalle.productoId}`}
                                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
                                  >
                                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-secondary">
                                      <img
                                        src={detalle.imageUrl || placeholderImage}
                                        alt={detalle.nombreProducto}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {detalle.nombreProducto}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Cantidad solicitada: {detalle.cantidad}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                              <div>
                                <p className="text-sm font-medium text-foreground">Resumen</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Estado actual: {solicitud.estado}
                                </p>
                              </div>
                              {solicitud.comentarios && (
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Comentarios
                                  </p>
                                  <p className="mt-1 text-sm text-foreground">
                                    {solicitud.comentarios}
                                  </p>
                                </div>
                              )}
                              {solicitud.motivoRechazo && (
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Motivo de rechazo
                                  </p>
                                  <p className="mt-1 text-sm text-foreground">
                                    {solicitud.motivoRechazo}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              );
            })}

            {filteredSolicitudes.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay solicitudes que coincidan con los filtros actuales.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}