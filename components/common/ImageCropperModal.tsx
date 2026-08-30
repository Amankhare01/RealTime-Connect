"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2 } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string;
  onCrop: (croppedFile: File) => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
}

export default function ImageCropperModal({
  imageSrc,
  onCrop,
  onClose,
  loading = false,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, loading]);

  // Handle Drag / Pan with mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Drag / Pan with touch for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Generate Cropped 1:1 Square File
  const handleApplyCrop = useCallback(async () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const canvas = document.createElement("canvas");
    const OUTPUT_SIZE = 512; // 512x512 square format
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport dimensions (square crop area)
    const containerRect = container.getBoundingClientRect();
    const cropSize = containerRect.width; // square

    // Fill background with white/transparent
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Calculate scale factor between on-screen crop box and high-res output canvas
    const scaleFactor = OUTPUT_SIZE / cropSize;

    // Center output
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Image natural dimensions
    const renderedWidth = img.offsetWidth * zoom * scaleFactor;
    const renderedHeight = img.offsetHeight * zoom * scaleFactor;

    // Offsets
    const offsetX = position.x * scaleFactor;
    const offsetY = position.y * scaleFactor;

    // Draw
    ctx.drawImage(
      img,
      -renderedWidth / 2 + offsetX,
      -renderedHeight / 2 + offsetY,
      renderedWidth,
      renderedHeight
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], "profile-square.jpg", {
          type: "image/jpeg",
        });
        await onCrop(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  }, [zoom, rotation, position, onCrop]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Crop Profile Photo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drag and zoom to frame your square photo
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* CROP VIEWPORT */}
        <div className="relative p-6 flex items-center justify-center bg-slate-950 select-none overflow-hidden">
          {/* Crop Container 1:1 Aspect Ratio */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-dashed border-blue-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-grab active:cursor-grabbing flex items-center justify-center"
          >
            {/* Image being dragged/scaled */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                maxWidth: "100%",
                maxHeight: "100%",
                pointerEvents: "none",
              }}
              className="select-none pointer-events-none"
            />
          </div>

          {/* Guidelines Overlay */}
          <div className="absolute pointer-events-none w-64 h-64 sm:w-72 sm:h-72 rounded-full ring-2 ring-white/40 shadow-inner" />
        </div>

        {/* CONTROLS */}
        <div className="p-5 space-y-4 bg-slate-50/80 dark:bg-slate-900/90">
          {/* ZOOM SLIDER */}
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <ZoomIn size={16} className="text-slate-400 shrink-0" />

            {/* ROTATE BUTTON */}
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90°"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-1"
            >
              <RotateCw size={16} />
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Crop & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
