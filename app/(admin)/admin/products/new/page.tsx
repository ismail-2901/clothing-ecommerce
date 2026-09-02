export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminProductNewPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Products
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Add product</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>

      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main fields */}
        <div className="grid gap-6">
          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">Product details</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="product-name" className="text-sm font-medium">Name *</label>
                <input
                  id="product-name"
                  type="text"
                  required
                  placeholder="e.g. Black Linen Shirt"
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="product-slug" className="text-sm font-medium">Slug *</label>
                <input
                  id="product-slug"
                  type="text"
                  required
                  placeholder="black-linen-shirt"
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
                <p className="text-xs text-muted-foreground">URL: /products/[slug]</p>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="product-description" className="text-sm font-medium">Description *</label>
                <textarea
                  id="product-description"
                  rows={4}
                  required
                  placeholder="Product description visible to customers."
                  className="w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="product-material" className="text-sm font-medium">Material</label>
                  <input
                    id="product-material"
                    type="text"
                    placeholder="55% linen, 45% cotton"
                    className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="product-care" className="text-sm font-medium">Care instructions</label>
                  <input
                    id="product-care"
                    type="text"
                    placeholder="Machine wash cold, line dry."
                    className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Variants</h2>
              <button type="button" className="text-xs font-semibold underline underline-offset-4">
                + Add variant
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Each variant represents a unique color/size combination with its own SKU and stock.
            </p>
            <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">No variants added yet.</p>
              <button type="button" className="mt-2 text-sm font-semibold underline underline-offset-4">
                Add first variant
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">SEO</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="seo-title" className="text-sm font-medium">SEO title</label>
                <input
                  id="seo-title"
                  type="text"
                  placeholder="Leave blank to use product name"
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="seo-desc" className="text-sm font-medium">SEO description</label>
                <textarea
                  id="seo-desc"
                  rows={2}
                  className="w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                  placeholder="Leave blank to use product description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="grid gap-6 self-start lg:sticky lg:top-8">
          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">Status</h2>
            <div className="mt-4">
              <select
                id="product-status"
                className="h-11 w-full appearance-none rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">Category</h2>
            <div className="mt-4 grid gap-3">
              <select
                id="product-category"
                className="h-11 w-full appearance-none rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              >
                <option value="">Select category</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="essentials">Essentials</option>
              </select>
              <div className="grid gap-1.5">
                <label htmlFor="product-collection" className="text-sm font-medium">Collection</label>
                <input
                  id="product-collection"
                  type="text"
                  placeholder="Current Collection"
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">Images</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add image URLs or configure object storage for production uploads.
            </p>
            <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">Add image URL</p>
              <input
                type="url"
                placeholder="https://..."
                className="mt-2 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 lg:col-span-2">
          <Button type="submit" size="lg">Save product</Button>
          <Button type="button" variant="outline" size="lg">Save as draft</Button>
        </div>
      </form>
    </div>
  );
}
