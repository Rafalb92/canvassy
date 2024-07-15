import { useCallback, useMemo, useState } from 'react';
import { fabric } from 'fabric';
import { useAutoResize } from './use-auto-resize';
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  Editor,
  RECTANGLE_OPTIONS
} from '../types';

function buildEditor({ canvas }: BuildEditorProps): Editor {
  // Helper method to get WORKSPACE
  const getWorkspace = () => {
    return canvas
      .getObjects()
      .find((obj) => obj.name === 'clip');
  };
  // Catch center of workspace
  const center = (obj: fabric.Object) => {
    const workspace = getWorkspace();
    const centerPoint = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas.viewportCenterObject(obj);
  };
  // Add to canvas method
  const addToCanvas = (obj: fabric.Object) => {
    center(obj);
    canvas.add(obj);
    canvas.setActiveObject(obj);
  };

  return {
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS
      });
      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 10,
        ry: 10
      });
      addToCanvas(object);
    }
  };
}

export const useEditor = () => {
  const [canvas, setCanvas] =
    useState<fabric.Canvas | null>(null);
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null);

  useAutoResize({
    canvas,
    container
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({ canvas });
    }
    return undefined;
  }, [canvas]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: '#FFF',
        cornerStyle: 'circle',
        borderColor: '#3b82f6',
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: '#3b82f6'
      });

      const initialWorkspace = new fabric.Rect({
        width: 900,
        height: 1200,
        name: 'clip',
        fill: 'white',
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.8)',
          blur: 5
        })
      });

      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(
        initialContainer.offsetHeight
      );

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);
    },
    []
  );

  return { init, editor };
};
