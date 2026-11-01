import { ModuleHost } from "@/components/renderers/ModuleHost";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ tenant: string; dept: string; module: string }>;
}) {
  const { dept, module: moduleKey } = await params;

  return <ModuleHost deptKey={dept} moduleKey={moduleKey} />;
}
