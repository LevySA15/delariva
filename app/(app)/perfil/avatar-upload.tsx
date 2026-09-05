"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { updateAvatarUrl } from "./actions";

export function AvatarUpload({
  userId,
  fullName,
  avatarUrl,
}: {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("A imagem precisa ter até 3MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    // evita cache do navegador na mesma URL após trocar a foto
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    const result = await updateAvatarUrl(bustedUrl);
    if (result.error) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setPreview(bustedUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar fullName={fullName} avatarUrl={preview} size="lg" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Trocar foto de perfil"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-950">Foto de perfil</p>
        <p className="text-xs text-ink-900/50">JPG ou PNG, até 3MB.</p>
        {error && <p className="mt-1 text-xs text-brand-700">{error}</p>}
      </div>
    </div>
  );
}
