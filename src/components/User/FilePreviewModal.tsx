import React, { useEffect, useRef, useState } from "react";
import {
  isImageFile,
  isPdfFile,
  isTextFile,
  downloadFile,
  isWordFile,
  isExcelFile,
  isPowerPointFile,
  isOfficeFile,
  isDocxFile,
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
  const [officePreviewUrl, setOfficePreviewUrl] = useState<string | null>(null);
  const [useOfficeOnline, setUseOfficeOnline] = useState<boolean>(false);
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
        let mod: {
          default?: {
            renderAsync: (b: Blob, el: HTMLElement) => Promise<void>;
          };
          renderAsync?: (b: Blob, el: HTMLElement) => Promise<void>;
        } | null = null;
        
        try {
          // Dynamic import with proper error handling
          const importResult = await (new Function('return import("https://esm.sh/docx-preview@0.3.1")')());
          mod = importResult as typeof mod;
        } catch (importError) {
          console.warn("[Preview] Failed to import docx-preview", importError);
          mod = null;
        }
        if (mod) {
          docxModuleRef.current = {
            renderAsync: (mod as any).renderAsync || (mod as any).default?.renderAsync,
          };
        }
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

  // Helper function to create Office Online preview URL
  const createOfficeOnlineUrl = (fileUrl: string) => {
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
  };

  // Helper function to get public file URL for Office Online
  const getPublicFileUrl = (fileId: number) => {
    // This should be your public file URL that Office Online can access
    const baseUrl = (import.meta as ImportMeta).env.VITE_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/api/files/${fileId}/preview`;
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
      setOfficePreviewUrl(null);
      setUseOfficeOnline(false);
      
      try {
        console.log("[Preview] Start", {
          fileId: file.file_id,
          fileName: file.file_name,
          fileType: file.file_type,
        });

        // Check if this is an Office file that can use Office Online
        // Only use Office Online for production environments
        const isProduction = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1') &&
                           !window.location.hostname.includes('dev');
                           
        if (isOfficeFile(file.file_type, file.file_name) && isProduction) {
          try {
            // Try Office Online for production environments
            const publicUrl = getPublicFileUrl(file.file_id);
            const officeUrl = createOfficeOnlineUrl(publicUrl);
            setOfficePreviewUrl(officeUrl);
            setUseOfficeOnline(true);
            console.log("[Preview] Using Office Online for", file.file_name);
            return; // Early return for Office Online
          } catch (officeError) {
            console.warn("[Preview] Office Online failed, falling back to local preview", officeError);
            // Continue to local preview logic
          }
        }

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

        if (isDocxFile(file.file_type, file.file_name)) {
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

    // Office Online preview
    if (useOfficeOnline && officePreviewUrl) {
      return (
        <div className="office-preview">
          <iframe
            src={officePreviewUrl}
            title={file.file_name}
            style={{ 
              width: "100%", 
              height: "70vh", 
              border: "none",
              borderRadius: "4px"
            }}
            onError={() => {
              console.error("[Preview] Office Online iframe failed to load");
              setError("Office Online preview failed. Please download the file to view it.");
              setUseOfficeOnline(false);
            }}
          />
          <div style={{ 
            fontSize: 12, 
            color: "#666", 
            textAlign: "center", 
            marginTop: 8, 
            padding: "8px" 
          }}>
            Powered by Microsoft Office Online
            {!useOfficeOnline && (
              <button 
                onClick={() => {
                  setUseOfficeOnline(false);
                  setOfficePreviewUrl(null);
                  // Trigger reload with local preview
                  window.location.reload();
                }} 
                style={{ 
                  marginLeft: 8, 
                  fontSize: 10,
                  padding: "2px 6px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  background: "white",
                  cursor: "pointer"
                }}
              >
                Try local preview
              </button>
            )}
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
            {isOfficeFile(file.file_type, file.file_name) && !useOfficeOnline && (() => {
              const isProduction = !window.location.hostname.includes('localhost') && 
                                 !window.location.hostname.includes('127.0.0.1') &&
                                 !window.location.hostname.includes('dev');
              return isProduction;
            })() && (
              <button 
                onClick={() => {
                  setUseOfficeOnline(true);
                  setError(null);
                  const publicUrl = getPublicFileUrl(file.file_id);
                  const officeUrl = createOfficeOnlineUrl(publicUrl);
                  setOfficePreviewUrl(officeUrl);
                }} 
                className="download-btn"
                style={{ marginRight: 8 }}
              >
                Try Office Online
              </button>
            )}
            <button onClick={onDownload} className="download-btn">
              Download
            </button>
          </div>
        </div>
      );
    }

    if (isDocxFile(file.file_type, file.file_name)) {
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

    // Check if this is an Office file that could be previewed
    if (isOfficeFile(file.file_type, file.file_name)) {
      const isProduction = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1') &&
                           !window.location.hostname.includes('dev');
      
      return (
        <div className="no-preview">
          <div className="no-preview-content">
            <h3>{isWordFile(file.file_type, file.file_name) ? "Word Document" : 
                  isExcelFile(file.file_type, file.file_name) ? "Excel Spreadsheet" :
                  isPowerPointFile(file.file_type, file.file_name) ? "PowerPoint Presentation" :
                  "Office Document"}</h3>
            <p>This {file.file_name.split('.').pop()?.toUpperCase()} file cannot be previewed locally.</p>
            
            {!isProduction && (
              <div style={{ 
                background: "#fff3cd", 
                border: "1px solid #ffeaa7", 
                padding: "8px 12px", 
                borderRadius: "4px", 
                margin: "8px 0",
                fontSize: "14px"
              }}>
                💡 <strong>Development Mode:</strong> Office Online doesn't work with localhost. In production, this file can be previewed online.
              </div>
            )}
            
            {isProduction && (
              <button 
                onClick={() => {
                  setUseOfficeOnline(true);
                  setError(null);
                  const publicUrl = getPublicFileUrl(file.file_id);
                  const officeUrl = createOfficeOnlineUrl(publicUrl);
                  setOfficePreviewUrl(officeUrl);
                }} 
                className="download-btn"
                style={{ marginRight: 8 }}
              >
                📄 Preview with Office Online
              </button>
            )}
            
            <button onClick={onDownload} className="download-btn">
              📥 Download to view
            </button>
          </div>
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
