'use client';
import EditorNavbar from '@/features/editor/components/editor-navbar';
import { useEditor } from '@/features/editor/hooks/use-editor';
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { fabric } from 'fabric';
import { EditorSidebar } from '@/features/editor/components/editor-sidebar';
import EditorToolbar from '@/features/editor/components/editor-toolbar';
import EditorFooter from '@/features/editor/components/editor-footer';
import { EditorShapeSidebar } from '@/features/editor/components/editor-shape-sidebar';
import { ActiveTool } from '../types';

const Editor = () => {
  const { init, editor } = useEditor();
  const [activeTool, setActiveTool] =
    useState<ActiveTool>('select');
  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === activeTool) {
        return setActiveTool('select');
      }
      if (tool === 'draw') {
        // TODO enable draw mode
      }
      if (activeTool === 'draw') {
        // TODO disable draw mode
      }
      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true
    });

    if (canvas && containerRef) {
      init({
        initialCanvas: canvas,
        initialContainer: containerRef.current!
      });
    }

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <EditorNavbar
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <EditorSidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <EditorShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
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
