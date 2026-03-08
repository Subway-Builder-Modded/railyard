import { useGalleryImage } from "@/hooks/use-gallery-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImageProps {
  type: "mods" | "maps";
  id: string;
  imagePath?: string;
  className?: string;
}

export function GalleryImage({ type, id, imagePath, className }: GalleryImageProps) {
  const { imageUrl, loading, error } = useGalleryImage(type, id, imagePath);
  const FallbackIcon = type === "mods" ? Package : MapPin;

  if (loading) {
    return <Skeleton className={cn("w-full", className)} />;
  }

  if (!imageUrl || error) {
    return (
      <div className={cn("w-full flex items-center justify-center bg-muted", className)}>
        <FallbackIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img src={imageUrl} alt="" className={cn("w-full object-cover", className)} />
  );
}
