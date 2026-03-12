"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, Send, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductService } from "@/services/productService";
import { SolicitudesService } from "@/services/solicitudesService";

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  rutaImagen: string | null;
  cantidad: number;
  categoriaId: number | null;
  categoria: { id: number; nombre: string } | null;
}

interface CartItem {
  product: Product;
  cantidad: number;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [comentarios, setComentarios] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setErrorMessage("");
        const data = await ProductService.getAll();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage("No se pudieron cargar los productos");
        console.error("Error cargando productos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  function getSelectedQuantity(productId: number) {
    return quantities[productId] ?? 1;
  }

  function setSelectedQuantity(productId: number, value: number, max: number) {
    const nextValue = Math.min(Math.max(1, value), max);
    setQuantities((prev) => ({
      ...prev,
      [productId]: nextValue,
    }));
  }

  function addToCart(product: Product) {
    const requestedQuantity = getSelectedQuantity(product.id);

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (!existingItem) {
        return [
          ...prev,
          {
            product,
            cantidad: Math.min(requestedQuantity, product.cantidad),
          },
        ];
      }

      return prev.map((item) => {
        if (item.product.id !== product.id) return item;

        return {
          ...item,
          cantidad: Math.min(
            item.cantidad + requestedQuantity,
            product.cantidad,
          ),
        };
      });
    });

    setSelectedQuantity(product.id, 1, product.cantidad);
    setSubmitError("");
    setSubmitSuccess("");
  }

  function updateCartItemQuantity(productId: number, value: number) {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;

        return {
          ...item,
          cantidad: Math.min(Math.max(1, value), item.product.cantidad),
        };
      }),
    );
  }

  function removeCartItem(productId: number) {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  }

  async function submitSolicitud() {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload = {
        comentarios: comentarios.trim() || null,
        detalles: cartItems.map((item) => ({
          productoId: item.product.id,
          cantidad: item.cantidad,
        })),
      };

      await SolicitudesService.create(payload);
      setCartItems([]);
      setComentarios("");
      setSubmitSuccess("Solicitud enviada correctamente.");
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      setSubmitError("No se pudo enviar la solicitud. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getImageUrl(rutaImagen: string | null) {
    if (!rutaImagen) return "";
    if (rutaImagen.startsWith("http://") || rutaImagen.startsWith("https://"))
      return rutaImagen;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const normalizedPath = rutaImagen.startsWith("/")
      ? rutaImagen
      : `/${rutaImagen}`;
    return `${baseUrl}${normalizedPath}`;
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando productos...</p>
    );
  }

  if (errorMessage) {
    return <p className="text-sm text-destructive">{errorMessage}</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay productos disponibles.
      </p>
    );
  }

  const cartUnitsCount = cartItems.reduce(
    (acc, item) => acc + item.cantidad,
    0,
  );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          className="relative gap-2"
          onClick={() => {
            setSubmitError("");
            setSubmitSuccess("");
            setCartOpen(true);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Carrito
          {cartUnitsCount > 0 && (
            <Badge
              variant="destructive"
              className="-right-2 -top-2 absolute h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {cartUnitsCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const inStock = product.cantidad > 0;
          const imageUrl = getImageUrl(product.rutaImagen);
          const categoryName = product.categoria?.nombre || "Sin categoria";
          const selectedQuantity = getSelectedQuantity(product.id);
          const cartItem = cartItems.find(
            (item) => item.product.id === product.id,
          );

          return (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden group flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.nombre}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge
                      variant="secondary"
                      className="text-sm font-medium bg-card text-foreground"
                    >
                      Agotado
                    </Badge>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-card/90 backdrop-blur-sm text-foreground text-xs"
                  >
                    {categoryName}
                  </Badge>
                </div>
                {cartItem && (
                  <div className="absolute right-3 top-3">
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      En carrito
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-snug text-pretty">
                    {product.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {product.descripcion}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Badge
                    variant={inStock ? "default" : "secondary"}
                    className={
                      inStock ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    {inStock ? `Stock: ${product.cantidad}` : "No disponible"}
                  </Badge>

                  {inStock && (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedQuantity(
                            product.id,
                            selectedQuantity - 1,
                            product.cantidad,
                          )
                        }
                        disabled={selectedQuantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={product.cantidad}
                        value={selectedQuantity}
                        onChange={(event) =>
                          setSelectedQuantity(
                            product.id,
                            parseInt(event.target.value, 10) || 1,
                            product.cantidad,
                          )
                        }
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedQuantity(
                            product.id,
                            selectedQuantity + 1,
                            product.cantidad,
                          )
                        }
                        disabled={selectedQuantity >= product.cantidad}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="gap-2"
                  disabled={!inStock}
                  onClick={() => addToCart(product)}
                >
                  <Send className="h-4 w-4" />
                  Agregar al carrito
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[85vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito de solicitud
            </DialogTitle>
            <DialogDescription>
              Revisa los productos y envia la solicitud cuando todo este listo.
            </DialogDescription>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              El carrito esta vacio.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const imageUrl = getImageUrl(item.product.rutaImagen);

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-secondary">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.nombre}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            Sin img
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.product.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disponible: {item.product.cantidad}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.product.id,
                              item.cantidad - 1,
                            )
                          }
                          disabled={item.cantidad <= 1 || isSubmitting}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={item.product.cantidad}
                          value={item.cantidad}
                          onChange={(event) =>
                            updateCartItemQuantity(
                              item.product.id,
                              parseInt(event.target.value, 10) || 1,
                            )
                          }
                          disabled={isSubmitting}
                          className="h-8 w-16 text-center"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.product.id,
                              item.cantidad + 1,
                            )
                          }
                          disabled={
                            item.cantidad >= item.product.cantidad ||
                            isSubmitting
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeCartItem(item.product.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Comentarios (opcional)
                </p>
                <Textarea
                  rows={3}
                  value={comentarios}
                  onChange={(event) => setComentarios(event.target.value)}
                  placeholder="Agrega un comentario para tu solicitud"
                  disabled={isSubmitting}
                />
              </div>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              {submitSuccess && (
                <p className="text-sm text-accent">{submitSuccess}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setCartOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={() => void submitSolicitud()}
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
