import { cn } from '@/lib/utils';

export function productImageUrl(
  product: { id: string; image_url?: string | null; name?: string },
  size = 600,
): string {
  if (product.image_url) return product.image_url;
  // Fallback determinístico cuando todavía no hay imagen de ML
  const seed = product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || product.id;
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}

interface ProductImageProps {
  product: { id: string; image_url?: string | null; name: string };
  size?: number;
  className?: string;
  aspect?: 'square' | '4/3' | '16/9';
}

export function ProductImage({ product, size = 600, className, aspect = 'square' }: ProductImageProps) {
  const aspectClass =
    aspect === 'square' ? 'aspect-square' : aspect === '4/3' ? 'aspect-[4/3]' : 'aspect-video';
  return (
    <div className={cn('relative w-full overflow-hidden bg-muted', aspectClass, className)}>
      <img
        src={productImageUrl(product, size)}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
