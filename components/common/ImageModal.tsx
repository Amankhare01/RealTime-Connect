"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

export default function ImageModal({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-50 bg-black/80
        flex items-center justify-center
      "
      onClick={onClose}
    >
      {/* Close button */}
      <button
      title="Close"
        onClick={onClose}
        className="absolute top-4 right-4 text-white"
      >
        <X size={28} />
      </button>

      {/* Image */}
      <Image
      height={420}
      width={300}
        src={src}
        alt="preview"
        onClick={(e) => e.stopPropagation()}
        className="
          max-h-[90vh]
          max-w-[90vw]
          rounded-lg
          object-contain
        "
      />
    </div>
  );
}
