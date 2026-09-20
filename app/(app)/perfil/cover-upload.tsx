"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Cover } from "@/components/cover";
import { updateCoverUrl } from "./actions";

export function CoverUpload({ userId, coverUrl }: { userId: string; coverUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(coverUrl);
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
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem precisa ter até 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/cover.${ext}`;

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
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    const result = await updateCoverUrl(bustedUrl);
    if (result.error) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setPreview(bustedUrl);
    setUploading(false);
  }

  return (
    <div className="group relative h-32 w-full overflow-hidden rounded-t-lg sm:h-40">
      <Cover coverUrl={preview} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Trocar capa do perfil"
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur transition hover:bg-black/70 disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && (
        <p className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">{error}</p>
      )}
    </div>
  );
}
