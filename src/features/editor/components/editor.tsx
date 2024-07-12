"use client";
import EditorNavbar from "@/features/editor/components/editor-navbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import EditorSidebar from "@/features/editor/components/editor-sidebar";
import EditorToolbar from "@/features/editor/components/editor-toolbar";
import EditorFooter from "@/features/editor/components/editor-footer";

const Editor = () => {
  const { init } = useEditor();
  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <EditorNavbar />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <EditorSidebar />
        <main className="flex-1  bg-muted overflow-auto relative flex flex-col">
          <EditorToolbar />
          <div
            className="h-[calc(100%-124px)] flex-1 bg-muted"
            ref={containerRef}
          >
            <canvas ref={canvasRef} />
          </div>
          <EditorFooter />
        </main>
      </div>
    </div>
  );
};

export default Editor;
