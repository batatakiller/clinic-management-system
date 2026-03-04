"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                ref={overlayRef}
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="relative h-full w-64 shadow-xl">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-3 z-10 p-1.5 rounded-lg text-muted-foreground
                       hover:text-foreground hover:bg-sidebar-accent transition-med"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <Sidebar isOpen={isOpen} onClose={onClose} />
                </div>
            </div>
        </>
    );
}
