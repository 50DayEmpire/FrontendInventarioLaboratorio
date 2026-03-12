import { ProductsHeader } from "@/components/products-header"
import { ProductGrid } from "@/components/product-grid"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProductsHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Product Catalog
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse our collection of premium tech accessories and gear
          </p>
        </div>
        <ProductGrid />
      </main>
    </div>
  )
}
