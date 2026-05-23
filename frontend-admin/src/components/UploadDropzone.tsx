import { useCallback, useState } from "react";

interface UploadDropzoneProps {
  endpoint: string;
  accept?: string;
  multiple?: boolean;
  fields?: Record<string, string>;
  onUploaded?: () => void;
}

export default function UploadDropzone({
  endpoint,
  accept,
  multiple = false,
  fields,
  onUploaded,
}: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    (file: File) =>
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
        xhr.withCredentials = true;
        xhr.responseType = "json";

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }
          reject(new Error("Upload failed"));
        };

        xhr.onerror = () => reject(new Error("Network error"));

        const form = new FormData();
        form.append("file", file);
        if (fields) {
          Object.entries(fields).forEach(([key, value]) => form.append(key, value));
        }
        xhr.send(form);
      }),
    [endpoint, fields]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        for (const file of Array.from(files)) {
          await uploadFile(file);
        }
        onUploaded?.();
      } catch (err) {
        setError((err as Error).message || "Upload failed");
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [uploadFile, onUploaded]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <label className="block text-sm text-mist/70 mb-3">Subir archivos</label>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="w-full text-sm text-mist/80"
      />
      {isUploading && (
        <div className="mt-3 text-xs text-mist/70">Subiendo... {progress}%</div>
      )}
      {error && <div className="mt-3 text-xs text-ember">{error}</div>}
    </div>
  );
}
