"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
  ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductService } from "@/services/productService";
import { CategoriaService } from "@/services/categoriaService";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  cantidad: number;
  inStock: boolean;
  createdAt?: string;
}

interface BackendProduct {
  id: number;
  nombre: string;
  descripcion: string;
  rutaImagen: string | null;
  cantidad: number;
  categoriaId: number | null;
  categoria: { id: number; nombre: string } | null;
}

interface Categoria {
  id: number;
  nombre: string;
}

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  cantidad: 0,
  inStock: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingError, setSavingError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  async function loadCategories(): Promise<Categoria[]> {
    try {
      setIsCategoriesLoading(true);
      const data = await CategoriaService.getAll();
      const categoriasList: Categoria[] = Array.isArray(data) ? data : [];
      setCategories(categoriasList);
      return categoriasList;
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategories([]);
      return [];
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function loadProducts(categoriasDisponibles: Categoria[] = categories) {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await ProductService.getAll();
      const normalizedProducts = Array.isArray(data)
        ? data.map((item) =>
            mapBackendProduct(item as BackendProduct, categoriasDisponibles),
          )
        : [];
      setProducts(normalizedProducts);
    } catch (error) {
      setErrorMessage("No se pudieron cargar los productos");
      console.error("Error cargando productos:", error);
    } finally {
      setIsLoading(false);
    }
  }

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

  function mapBackendProduct(
    product: BackendProduct,
    categoriasDisponibles: Categoria[],
  ): Product {
    const categoryName =
      categoriasDisponibles.find((cat) => cat.id === product.categoriaId)
        ?.nombre ||
      product.categoria?.nombre ||
      "Uncategorized";

    return {
      id: String(product.id),
      name: product.nombre,
      description: product.descripcion || "",
      image: getImageUrl(product.rutaImagen),
      category: categoryName,
      cantidad: product.cantidad || 0,
      inStock: product.cantidad > 0,
      createdAt: undefined,
    };
  }

  useEffect(() => {
    let mounted = true;

    async function initializeData() {
      const categoriasIniciales = await loadCategories();
      if (!mounted) return;
      await loadProducts(categoriasIniciales);
    }

    initializeData();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  function openCreate() {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setSelectedImage(null);
    setImagePreview(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      cantidad: product.cantidad,
      inStock: product.inStock,
    });
    setSelectedImage(null);
    setImagePreview(product.image || null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name) return;

    setIsSaving(true);
    setSavingError("");

    try {
      const payload = new FormData();
      payload.append("Nombre", formData.name);
      payload.append("Descripcion", formData.description || "");
      payload.append("Cantidad", String(Number(formData.cantidad) || 0));

      // Si se deja vacio en edicion, enviar cadena vacia para quitar categoria.
      if (!formData.category) {
        if (editingProduct) {
          payload.append("CategoriaId", "");
        }
      } else {
        const selectedCategory = categories.find(
          (cat) => cat.nombre === formData.category,
        );
        if (selectedCategory) {
          payload.append("CategoriaId", String(selectedCategory.id));
        }
      }

      // Agregar imagen si fue seleccionada (es opcional)
      if (selectedImage) {
        payload.append("Imagen", selectedImage);
      }

      if (editingProduct) {
        await ProductService.update(parseInt(editingProduct.id), payload);
      } else {
        await ProductService.create(payload);
      }
      setDialogOpen(false);
      setFormData(emptyProduct);
      setEditingProduct(null);
      setSelectedImage(null);
      setImagePreview(null);
      await loadProducts();
    } catch (error) {
      setSavingError("No se pudo guardar el producto");
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setSavingError("La imagen no debe superar los 5MB");
      return;
    }

    // Validar tipo de archivo
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setSavingError("Solo se permiten imágenes PNG, JPG o WebP");
      return;
    }

    setSavingError("");
    setSelectedImage(file);

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function confirmDelete(product: Product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!productToDelete) return;

    setIsDeleting(true);
    setSavingError("");

    try {
      await ProductService.delete(parseInt(productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (error) {
      setSavingError("No se pudo eliminar el producto");
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateCategory() {
    const trimmedName = newCategoryName.trim();
    const trimmedDescription = newCategoryDescription.trim();

    if (!trimmedName) {
      setCategoryError("El nombre de la categoría es obligatorio");
      return;
    }

    if (!trimmedDescription) {
      setCategoryError("La descripción de la categoría es obligatoria");
      return;
    }

    setIsCategorySaving(true);
    setCategoryError("");

    try {
      await CategoriaService.create({
        nombre: trimmedName,
        descripcion: trimmedDescription,
      });
      await loadCategories();
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      setCategoryError("No se pudo crear la categoría");
      console.error("Error al crear categoría:", error);
    } finally {
      setIsCategorySaving(false);
    }
  }

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Manage your product catalog, add new items, and update inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setCategoryError("");
              setNewCategoryName("");
              setNewCategoryDescription("");
              setCategoryDialogOpen(true);
            }}
            disabled={isCategoriesLoading || isCategorySaving}
          >
            <Plus className="h-4 w-4" />
            New Category
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/products">
              <ExternalLink className="h-4 w-4" />
              View Catalog
            </Link>
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {products.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {inStockCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-semibold text-foreground mt-1.5">
                  {outOfStockCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <X className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground">Product Catalog</CardTitle>
          <CardDescription>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </SelectItem>
                ))}
                <SelectItem value="Uncategorized">Uncategorized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-foreground font-medium">
                    Product
                  </TableHead>
                  <TableHead className="text-foreground font-medium hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="text-foreground font-medium hidden lg:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground font-medium hidden sm:table-cell">
                    Date Added
                  </TableHead>
                  <TableHead className="text-foreground font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-foreground text-sm">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                        className={
                          product.inStock
                            ? "bg-accent/15 text-accent border-accent/20 hover:bg-accent/15"
                            : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10"
                        }
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {isLoading
                        ? "Cargando productos..."
                        : errorMessage ||
                          "No products found matching your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details below."
                : "Fill in the details to add a new product to the catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {savingError && (
              <p className="text-sm text-destructive">{savingError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="product-name" className="text-foreground">
                Product Name
              </Label>
              <Input
                id="product-name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-desc" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="product-desc"
                placeholder="Enter product description"
                rows={3}
                className="resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category" className="text-foreground">
                Category{" "}
                <span className="text-xs text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: val === "__none__" ? "" : val,
                  }))
                }
              >
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-cantidad" className="text-foreground">
                Cantidad en Stock
              </Label>
              <Input
                id="product-cantidad"
                type="number"
                min="0"
                placeholder="0"
                value={formData.cantidad || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cantidad: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-foreground">
                Product Image{" "}
                <span className="text-xs text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <input
                id="image-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary/40 cursor-pointer"
              >
                {imagePreview ? (
                  <div className="relative w-full max-w-xs">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg object-cover max-h-48"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Click para cambiar imagen
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG or WebP up to 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || isSaving}>
              {isSaving
                ? editingProduct
                  ? "Guardando..."
                  : "Creando..."
                : editingProduct
                  ? "Save Changes"
                  : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setCategoryError("");
            setNewCategoryName("");
            setNewCategoryDescription("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Category</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para asignarla a tus productos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {categoryError && (
              <p className="text-sm text-destructive">{categoryError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-category-name" className="text-foreground">
                Category Name
              </Label>
              <Input
                id="new-category-name"
                placeholder="Ej. Reactivos"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isCategorySaving}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="new-category-description"
                className="text-foreground"
              >
                Description
              </Label>
              <Textarea
                id="new-category-description"
                placeholder="Describe la categoría"
                rows={3}
                className="resize-none"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                disabled={isCategorySaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
              disabled={isCategorySaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={
                !newCategoryName.trim() ||
                !newCategoryDescription.trim() ||
                isCategorySaving
              }
            >
              {isCategorySaving ? "Creando..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {savingError && (
            <p className="text-sm text-destructive">{savingError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
