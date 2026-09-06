import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getPixKey } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { atualizarPixKey } from "./actions";

export default async function ConfiguracoesFinanceiroPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const pixKey = await getPixKey(supabase);

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" subtitle="Configurações de cobrança" />

      <Card className="max-w-md p-6">
        <form action={atualizarPixKey} className="space-y-4">
          <Field label="Chave Pix da academia" htmlFor="pix_key">
            <input id="pix_key" name="pix_key" defaultValue={pixKey ?? ""} placeholder="CPF, e-mail, telefone ou chave aleatória" className={inputClass} />
          </Field>
          <p className="text-xs text-ink-900/40">
            Essa chave aparece pro aluno/responsável quando ele tem uma mensalidade pendente, junto com o botão
            &ldquo;Já paguei&rdquo;.
          </p>
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </form>
      </Card>
    </div>
  );
}
