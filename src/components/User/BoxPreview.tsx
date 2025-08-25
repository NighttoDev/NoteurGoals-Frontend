import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    Box?: {
      Preview: {
        new (): {
          show: (
            fileId: string,
            accessToken: string,
            options: {
              container: HTMLElement;
              showDownload: boolean;
              collection: string[];
              enableThumbnails: boolean;
            }
          ) => void;
        };
      };
    };
  }
}

type BoxPreviewProps = {
  fileId: string;
  accessToken: string;
  showDownload?: boolean;
};

const BoxPreview: React.FC<BoxPreviewProps> = ({
  fileId,
  accessToken,
  showDownload = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.Box || !window.Box.Preview || !containerRef.current) return;
    const preview = new window.Box.Preview();
    preview.show(fileId, accessToken, {
      container: containerRef.current,
      showDownload,
      collection: [fileId],
      enableThumbnails: true,
    });
    return () => {
      try {
        (preview as unknown as { destroy?: () => void })?.destroy?.();
      } catch {
        // Ignore errors
      }
    };
  }, [fileId, accessToken, showDownload]);

  return <div ref={containerRef} style={{ width: "100%", height: "70vh" }} />;
};

export default BoxPreview;
