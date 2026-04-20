import { WorkflowCanvas } from "@/ui/workflow-builder/workflow-canvas";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkflowCanvas workflowId={id} />;
}
