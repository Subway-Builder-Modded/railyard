import { useRoute, Link } from "wouter";
import { useRegistryStore } from "@/stores/registry-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectInfo } from "@/components/project/ProjectInfo";
import { VersionsTable } from "@/components/project/VersionsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Separator } from "@/components/ui/separator";
import { CircleAlert } from "lucide-react";

export function ProjectPage() {
  const [, params] = useRoute("/project/:type/:id");
  const mods = useRegistryStore((s) => s.mods);
  const maps = useRegistryStore((s) => s.maps);

  const type = params?.type as "mods" | "maps" | undefined;
  const id = params?.id;

  const item =
    type === "mods"
      ? mods.find((m) => m.id === id)
      : type === "maps"
        ? maps.find((m) => m.id === id)
        : undefined;

  if (!item || !type) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Project not found"
        description="The mod or map you're looking for doesn't exist in the registry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/search">Browse</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProjectHero type={type} id={item.id} gallery={item.gallery || []} />

      <ProjectInfo type={type} item={item} />

      <Separator />

      <VersionsTable update={item.update} />
    </div>
  );
}
