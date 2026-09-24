import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, Layers, ZoomIn, ZoomOut, RotateCw, Move, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface MugCanvasPreviewProps {
  artworkUrl: string | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  viewMode: 'mockup' | 'flat';
  onViewModeChange: (mode: 'mockup' | 'flat') => void;
  onSnapshotReady?: (dataUrl: string) => void;
}

export const MugCanvasPreview: React.FC<MugCanvasPreviewProps> = ({
  artworkUrl,
  offsetX,
  offsetY,
  scale,
  rotation,
  viewMode,
  onViewModeChange,
  onSnapshotReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mockupImageRef = useRef<HTMLImageElement | null>(null);
  const artworkImageRef = useRef<HTMLImageElement | null>(null);
  const [isMockupLoaded, setIsMockupLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  // Load the base photographic mockup
  useEffect(() => {
    const img = new Image();
    img.src = '/images/mug_mockup.png';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      mockupImageRef.current = img;
      setIsMockupLoaded(true);
    };
    img.onerror = () => {
      console.warn('Falha ao carregar mockup fotográfico');
    };
  }, []);

  // Load artwork when artworkUrl changes
  useEffect(() => {
    if (!artworkUrl) {
      artworkImageRef.current = null;
      setIsArtworkLoaded(false);
      return;
    }

    const img = new Image();
    img.src = artworkUrl;
    img.onload = () => {
      artworkImageRef.current = img;
      setIsArtworkLoaded(true);
    };
    img.onerror = () => {
      console.warn('Falha ao carregar arte do cliente');
      setIsArtworkLoaded(false);
    };
  }, [artworkUrl]);

  // Main Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (viewMode === 'flat') {
      // ----------------------------------------------------
      // MODE: FLAT PRINT AREA (21 cm × 9.5 cm -> Ratio 21/9.5 = 2.2105)
      // ----------------------------------------------------
      const W = 1050; // 21 * 50
      const H = 475;  // 9.5 * 50
      canvas.width = W;
      canvas.height = H;

      // Background: White sheet
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Subtle safe area grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#F1F1F1';
      for (let x = 50; x < W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 50; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Safe margin line (5mm / ~25px from edges)
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#D1D5DB';
      ctx.strokeRect(25, 25, W - 50, H - 50);
      ctx.setLineDash([]);

      // Center crosshair
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // If user uploaded artwork, render it with transform
      if (artworkImageRef.current && isArtworkLoaded) {
        const art = artworkImageRef.current;
        ctx.save();

        // Clip to print boundary
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.clip();

        // Center point for translation
        const centerX = W / 2 + offsetX;
        const centerY = H / 2 + offsetY;

        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);

        // Calculate aspect ratio fitting
        const artAspect = art.width / art.height;
        let drawW = W * 0.5 * scale;
        let drawH = drawW / artAspect;

        ctx.drawImage(art, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        // Placeholder text
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Área de Impressão: 21 × 9,5 cm', W / 2, H / 2 - 14);
        ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText('Envie sua arte para visualizar aqui', W / 2, H / 2 + 14);
      }

      // Border around flat sheet
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, W, H);

    } else {
      // ----------------------------------------------------
      // MODE: 2D PHOTOGRAPHIC MOCKUP WITH CYLINDRICAL MAPPING
      // ----------------------------------------------------
      const mockup = mockupImageRef.current;
      // 1280 x 827 matches mockup aspect ratio ~ 1.548
      const targetW = 1280;
      const targetH = 827;
      canvas.width = targetW;
      canvas.height = targetH;

      // Clean neutral studio background
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, targetW, targetH);

      if (mockup && isMockupLoaded) {
        // Draw the background mockup image centered fitting perfectly
        const scaleFit = Math.min(targetW / mockup.width, targetH / mockup.height);
        const drawMockW = mockup.width * scaleFit;
        const drawMockH = mockup.height * scaleFit;
        const mockX = (targetW - drawMockW) / 2;
        const mockY = (targetH - drawMockH) / 2;

        ctx.drawImage(mockup, mockX, mockY, drawMockW, drawMockH);

        // CYLINDRICAL BODY TARGET IN MOCKUP:
        // Calibration parameters for the mug in mug_mockup.png (1280 x 827)
        const mugCenterX = mockX + drawMockW * 0.515;
        const mugTopY = mockY + drawMockH * 0.22;
        const mugBottomY = mockY + drawMockH * 0.82;
        const mugHeight = mugBottomY - mugTopY;
        const mugRadius = drawMockW * 0.175; // Front visible half-width of cylinder
        const mugLeft = mugCenterX - mugRadius;
        const mugRight = mugCenterX + mugRadius;

        if (artworkImageRef.current && isArtworkLoaded) {
          const art = artworkImageRef.current;

          // Create a flat intermediate canvas representing the full 21 x 9.5 cm print sheet
          const flatCanvas = document.createElement('canvas');
          flatCanvas.width = 1050;
          flatCanvas.height = 475;
          const fCtx = flatCanvas.getContext('2d');
          if (fCtx) {
            fCtx.save();
            const centerX = flatCanvas.width / 2 + offsetX;
            const centerY = flatCanvas.height / 2 + offsetY;
            fCtx.translate(centerX, centerY);
            fCtx.rotate((rotation * Math.PI) / 180);
            const artAspect = art.width / art.height;
            const drawW = flatCanvas.width * 0.5 * scale;
            const drawH = drawW / artAspect;
            fCtx.drawImage(art, -drawW / 2, -drawH / 2, drawW, drawH);
            fCtx.restore();
          }

          // Now perform vertical strip cylindrical warp onto the mug body:
          const SLICES = 48;
          const cylinderWidth = mugRight - mugLeft;

          ctx.save();

          // Clip to mug cylinder body boundary with subtle top/bottom curvature
          ctx.beginPath();
          // Top curved rim
          const rimArc = mugHeight * 0.045; // subtle perspective ellipse arc
          ctx.moveTo(mugLeft, mugTopY);
          ctx.quadraticCurveTo(mugCenterX, mugTopY + rimArc, mugRight, mugTopY);
          // Right edge
          ctx.lineTo(mugRight, mugBottomY);
          // Bottom curved base
          ctx.quadraticCurveTo(mugCenterX, mugBottomY + rimArc, mugLeft, mugBottomY);
          ctx.closePath();
          ctx.clip();

          // Map flat print sheet to cylinder
          const flatCropStart = flatCanvas.width * 0.28;
          const flatCropWidth = flatCanvas.width * 0.44;

          for (let i = 0; i < SLICES; i++) {
            const u0 = (i / SLICES) * 2 - 1;
            const u1 = ((i + 1) / SLICES) * 2 - 1;

            const theta0 = Math.asin(Math.max(-1, Math.min(1, u0)));
            const theta1 = Math.asin(Math.max(-1, Math.min(1, u1)));

            const destX0 = mugCenterX + u0 * mugRadius;
            const destX1 = mugCenterX + u1 * mugRadius;
            const sliceDestW = Math.max(0.5, destX1 - destX0);

            const srcNorm0 = (theta0 / Math.PI + 0.5);
            const srcX0 = flatCropStart + srcNorm0 * flatCropWidth;
            const srcNorm1 = (theta1 / Math.PI + 0.5);
            const srcX1 = flatCropStart + srcNorm1 * flatCropWidth;
            const sliceSrcW = Math.max(0.5, srcX1 - srcX0);

            const arcY = Math.cos(theta0) * rimArc;
            const destY = mugTopY + arcY;
            const sliceDestH = mugHeight;

            ctx.drawImage(
              flatCanvas,
              srcX0,
              0,
              sliceSrcW,
              flatCanvas.height,
              destX0,
              destY,
              sliceDestW + 0.5,
              sliceDestH
            );
          }

          // Ceramic glaze shading overlay:
          const shadeGrad = ctx.createLinearGradient(mugLeft, 0, mugRight, 0);
          shadeGrad.addColorStop(0.0, 'rgba(0,0,0,0.20)');
          shadeGrad.addColorStop(0.15, 'rgba(0,0,0,0.05)');
          shadeGrad.addColorStop(0.35, 'rgba(255,255,255,0.18)');
          shadeGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
          shadeGrad.addColorStop(0.85, 'rgba(0,0,0,0.05)');
          shadeGrad.addColorStop(1.0, 'rgba(0,0,0,0.22)');

          ctx.fillStyle = shadeGrad;
          ctx.fillRect(mugLeft, mugTopY, cylinderWidth, mugHeight + rimArc);

          ctx.restore();
        }
      } else {
        // Mockup loading state
        ctx.fillStyle = '#78716C';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Carregando pré-visualização fotográfica...', targetW / 2, targetH / 2);
      }
    }

    // Pass snapshot dataUrl to parent if requested
    if (onSnapshotReady && canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onSnapshotReady(dataUrl);
      } catch (e) {
        // ignore cross-origin taint if any
      }
    }
  }, [
    viewMode,
    isMockupLoaded,
    isArtworkLoaded,
    offsetX,
    offsetY,
    scale,
    rotation,
    onSnapshotReady,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Top Header: Title & View Mode Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
          Pré-visualização da Caneca
        </h2>

        {/* View Mode Switcher Buttons */}
        <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('mockup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'mockup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualização da Caneca</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('flat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'flat'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arte Completa (21 × 9,5 cm)</span>
          </button>
        </div>
      </div>

      {/* Main Preview Canvas - prominent, centered, minimal inner margins */}
      <div className="relative w-full bg-[#FAFAFA] rounded-xl border border-stone-200/70 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[520px] object-contain rounded-lg"
        />

        {/* Empty state hint */}
        {!artworkUrl && viewMode === 'mockup' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/5 pointer-events-none p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center mb-2 text-stone-700">
              <Sparkles className="w-4 h-4 text-stone-800" />
            </div>
            <p className="text-xs font-semibold text-stone-800">
              Envie sua arte no editor abaixo para visualizar aqui em tempo real
            </p>
          </div>
        )}
      </div>

      {/* Bottom Information */}
      <p className="text-xs text-stone-500 leading-relaxed pt-1">
        Esta é uma simulação visual da sua caneca personalizada. O resultado físico poderá apresentar pequenas variações de cor e posicionamento.
      </p>
    </div>
  );
};
