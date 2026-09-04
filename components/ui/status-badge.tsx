import { STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import { Badge } from "./badge";

const TONES = {
  pago: "success",
  pendente: "warning",
  atrasado: "danger",
} as const;

export function StatusMensalidadeBadge({ status }: { status: "pago" | "pendente" | "atrasado" }) {
  return <Badge tone={TONES[status]}>{STATUS_MENSALIDADE_LABELS[status]}</Badge>;
}
