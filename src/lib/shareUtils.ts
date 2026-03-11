import { supabase } from "./supabase";

export async function uploadPhotoStrip(blob: Blob): Promise<string> {
  const fileName = `strip_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;

  const { error } = await supabase.storage
    .from("photo-strips")
    .upload(fileName, blob, {
      contentType: "image/png",
      cacheControl: "31536000",
    });

  if (error) throw new Error("上传失败：" + error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("photo-strips").getPublicUrl(fileName);

  return publicUrl;
}
