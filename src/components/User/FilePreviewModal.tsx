import React, { useEffect, useRef, useState } from "react";
import {
  isImageFile,
  isPdfFile,
  isTextFile,
  downloadFile,
} from "../../services/filesService";

interface FilePreviewModalProps {
  file: {
    file_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    box_file_id?: string;
  };
  onClose: () => void;
  onDownload: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
}) => {
  // Local preview state (works without Box)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<{
    status?: number;
    contentType?: string;
    blobType?: string;
    blobSize?: number;
  } | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const docxScriptLoadingRef = useRef<Promise<void> | null>(null);
  const docxModuleRef = useRef<{
    renderAsync?: (b: Blob, el: HTMLElement) => Promise<void>;
  } | null>(null);

  const ensureDocxPreviewLoaded = async (): Promise<void> => {
    const w = window as unknown as Record<string, unknown>;
    const exists =
      (w as unknown as { docx?: unknown }).docx ||
      (w as unknown as { docxPreview?: unknown }).docxPreview ||
      (w as unknown as { docx_preview?: unknown }).docx_preview ||
      (w as unknown as { DocxPreview?: unknown }).DocxPreview ||
      (w as unknown as { DOCXPreview?: unknown }).DOCXPreview;
    if (exists) return;

    // Fallback 1: try ESM dynamic import
    if (!docxModuleRef.current) {
      try {
        console.log("[Preview] Attempt dynamic import of docx-preview (ESM)");
        const mod = (await import(
          /* @vite-ignore */ "https://esm.sh/docx-preview@0.3.1"
        )) as unknown as {
          default?: {
            renderAsync: (b: Blob, el: HTMLElement) => Promise<void>;
          };
          renderAsync?: (b: Blob, el: HTMLElement) => Promise<void>;
        };
        docxModuleRef.current = {
          renderAsync: mod.renderAsync || mod.default?.renderAsync,
        };
      } catch (e) {
        console.warn("[Preview] ESM import failed, will try script tag", e);
      }
    }
    if (docxModuleRef.current?.renderAsync) return;

    if (!docxScriptLoadingRef.current) {
      docxScriptLoadingRef.current = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(
          'script[data-docx-preview="true"]'
        ) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("Failed to load docx-preview script"))
          );
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://unpkg.com/docx-preview@0.3.1/dist/docx-preview.min.js";
        script.async = true;
        script.defer = true;
        script.setAttribute("data-docx-preview", "true");
        script.onload = () => {
          console.log("[Preview] docx-preview script loaded");
          resolve();
        };
        script.onerror = () =>
          reject(new Error("Failed to load docx-preview script"));
        document.body.appendChild(script);
      });
    }
    await docxScriptLoadingRef.current;
  };

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    async function load() {
      setLoading(true);
      setError(null);
      setDebug(null);
      setPreviewUrl(null);
      setTextContent(null);
      try {
        console.log("[Preview] Start", {
          fileId: file.file_id,
          fileName: file.file_name,
          fileType: file.file_type,
        });
        const response = await downloadFile(file.file_id);
        const status: number | undefined = (
          response as unknown as { status?: number }
        ).status;
        const headers: Record<string, string> = ((
          response as unknown as { headers?: Record<string, string> }
        ).headers ?? {}) as Record<string, string>;
        const headerContentType =
          headers["content-type"] || headers["Content-Type"];
        const blob: Blob = response.data as Blob;
        console.log("[Preview] Response", {
          status,
          headers,
          blobType: blob?.type,
          blobSize: blob?.size,
        });
        setDebug({
          status,
          contentType: headerContentType,
          blobType: blob?.type,
          blobSize: blob?.size,
        });

        if (file.file_name.toLowerCase().endsWith(".docx")) {
          // Render .docx with docx-preview (CDN)
          try {
            await ensureDocxPreviewLoaded();
            const w = window as unknown as Record<string, unknown>;
            const candidate =
              (w as unknown as { docx?: unknown }).docx ||
              (w as unknown as { docxPreview?: unknown }).docxPreview ||
              (w as unknown as { docx_preview?: unknown }).docx_preview ||
              (w as unknown as { DocxPreview?: unknown }).DocxPreview ||
              (w as unknown as { DOCXPreview?: unknown }).DOCXPreview;
            const renderAsync =
              (
                candidate as unknown as {
                  renderAsync?: (b: Blob, el: HTMLElement) => Promise<void>;
                }
              )?.renderAsync ||
              (
                (candidate as unknown as { default?: unknown })
                  ?.default as unknown as {
                  renderAsync?: (b: Blob, el: HTMLElement) => Promise<void>;
                }
              )?.renderAsync ||
              (
                candidate as unknown as {
                  default?: {
                    renderAsync: (b: Blob, el: HTMLElement) => Promise<void>;
                  };
                }
              )?.default?.renderAsync ||
              docxModuleRef.current?.renderAsync;
            if (renderAsync && docxContainerRef.current) {
              await renderAsync(blob, docxContainerRef.current);
            } else {
              console.warn("[Preview] docx-preview not available on window", {
                candidateKeys: Object.keys(w),
              });
              setError("DOCX preview library not loaded");
            }
          } catch (err) {
            console.error("[Preview] DOCX render error", err);
            setError("Failed to render DOCX");
          }
        } else if (isTextFile(file.file_type)) {
          const reader = new FileReader();
          reader.onload = () => {
            if (!cancelled) setTextContent(reader.result as string);
          };
          reader.onerror = () => {
            console.error("[Preview] FileReader error while reading text file");
            if (!cancelled) setError("Failed to read text content");
          };
          reader.readAsText(blob);
        } else if (isImageFile(file.file_type) || isPdfFile(file.file_type)) {
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) setPreviewUrl(objectUrl);
        }
      } catch (e: unknown) {
        const ax = e as {
          response?: { status?: number; headers?: Record<string, string> };
        };
        const message =
          e instanceof Error ? e.message : "Failed to load preview";
        const status: number | undefined = ax?.response?.status;
        const headers: Record<string, string> = (ax?.response?.headers ??
          {}) as Record<string, string>;
        const headerContentType =
          headers?.["content-type"] || headers?.["Content-Type"];
        console.error("[Preview] Error", {
          message,
          status,
          headers,
          error: e,
        });
        setDebug({ status, contentType: headerContentType });
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.file_id, file.file_type, file.file_name]);

  // Box token logic removed for local preview focus

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="no-preview">
          <div className="no-preview-content">
            <p>Loading preview...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="no-preview">
          <div className="no-preview-content">
            <h3>Preview failed</h3>
            <p>{error}</p>
            {debug && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                {debug.status !== undefined && (
                  <div>HTTP status: {debug.status}</div>
                )}
                {debug.contentType && (
                  <div>Response content-type: {debug.contentType}</div>
                )}
                {debug.blobType && <div>Blob type: {debug.blobType}</div>}
                {typeof debug.blobSize === "number" && (
                  <div>Blob size: {debug.blobSize} bytes</div>
                )}
              </div>
            )}
            <button onClick={onDownload} className="download-btn">
              Download
            </button>
          </div>
        </div>
      );
    }

    if (file.file_name.toLowerCase().endsWith(".docx")) {
      return (
        <div
          ref={docxContainerRef}
          style={{ width: "100%", maxHeight: "70vh", overflow: "auto" }}
        />
      );
    }

    if (isImageFile(file.file_type) && previewUrl) {
      return (
        <div className="image-preview">
          <img
            src={previewUrl}
            alt={file.file_name}
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
          />
        </div>
      );
    }

    if (isPdfFile(file.file_type) && previewUrl) {
      return (
        <div className="pdf-preview">
          <iframe
            src={previewUrl}
            title={file.file_name}
            style={{ width: "100%", height: "70vh", border: "none" }}
          />
        </div>
      );
    }

    if (isTextFile(file.file_type) && textContent !== null) {
      return (
        <div
          className="text-preview"
          style={{
            width: "100%",
            maxHeight: "70vh",
            overflow: "auto",
            border: "1px solid #ddd",
            padding: 12,
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {textContent}
          </pre>
        </div>
      );
    }

    return (
      <div className="no-preview">
        <div className="no-preview-content">
          <h3>Preview not available</h3>
          <p>This file type cannot be previewed in the browser.</p>
          <button onClick={onDownload} className="download-btn">
            Download to view
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content file-preview-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{file.file_name}</h2>
          <div className="modal-actions">
            <button onClick={onDownload} className="download-btn">
              Download
            </button>
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">{renderPreview()}</div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
