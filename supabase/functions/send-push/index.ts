// Recebe { notificacao_id, user_ids, titulo, corpo } de um trigger Postgres
// (via pg_net) ou de qualquer outro chamador que conheça o segredo interno,
// busca os push_tokens dos destinatários e envia via FCM HTTP v1.
//
// Autenticação: não usa o JWT do Supabase (verify_jwt=false) porque quem
// chama essa função é o próprio Postgres (pg_net não tem sessão de usuário).
// Em vez disso, exige o header x-internal-secret batendo com o segredo
// guardado no Vault — só o banco (triggers/cron) e este projeto conhecem
// esse valor.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getSecret(name: string): Promise<string | null> {
  const { data, error } = await admin.rpc("get_secret", { secret_name: name });
  if (error) return null;
  return data;
}

type FirebaseServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

async function getFcmAccessToken(sa: FirebaseServiceAccount): Promise<string> {
  const key = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter access token do Google: ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req: Request) => {
  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = await getSecret("internal_push_secret");

  if (!expectedSecret || internalSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const { user_ids, titulo, corpo } = await req.json();
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return new Response(JSON.stringify({ error: "user_ids vazio" }), { status: 400 });
  }

  const saJson = await getSecret("firebase_service_account");
  if (!saJson) {
    return new Response(JSON.stringify({ error: "firebase_service_account não configurado" }), { status: 501 });
  }
  const sa: FirebaseServiceAccount = JSON.parse(saJson);

  const { data: tokens } = await admin.from("push_tokens").select("id, user_id, token").in("user_id", user_ids);

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const accessToken = await getFcmAccessToken(sa);
  const invalidTokenIds: string[] = [];
  let sent = 0;

  await Promise.all(
    tokens.map(async (row) => {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: row.token,
              notification: { title: titulo, body: corpo },
            },
          }),
        },
      );

      if (res.ok) {
        sent += 1;
        return;
      }

      const errBody = await res.json().catch(() => null);
      const status = errBody?.error?.status;
      if (status === "UNREGISTERED" || status === "NOT_FOUND" || status === "INVALID_ARGUMENT") {
        invalidTokenIds.push(row.id);
      }
    }),
  );

  if (invalidTokenIds.length > 0) {
    await admin.from("push_tokens").delete().in("id", invalidTokenIds);
  }

  return new Response(JSON.stringify({ sent, removed_tokens: invalidTokenIds.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
