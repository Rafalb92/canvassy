import {
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';
import { fabric } from 'fabric';
import { useAutoResize } from './use-auto-resize';
import { useCanvasEvents } from './use-canvas-events';
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  Editor,
  EditorHookProps,
  FILL_COLOR,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  JSON_KEYS,
  RECTANGLE_OPTIONS,
  STROKE_COLOR,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
  TEXT_OPTIONS,
  TRIANGLE_OPTIONS
} from '../types';
import { createFilter, isTextType } from '../utils';
import { useClipboard } from './use-clipboard';
import { useHotkeys } from './use-hotkeys';
import { useHistory } from './use-history';

function buildEditor({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  // fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray
}: BuildEditorProps): Editor {
  // Helper method to get WORKSPACE
  const getWorkspace = () => {
    return canvas
      .getObjects()
      .find((obj) => obj.name === 'clip');
  };
  // Catch center of workspace
  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };
  // Add to canvas method
  const addToCanvas = (obj: fabric.Object) => {
    center(obj);
    canvas.add(obj);
    canvas.setActiveObject(obj);
  };

  return {
    onUndo: () => undo(),
    onRedo: () => redo(),
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio
      );
    },
    changeBackground: (color: string) => {
      const workspace = getWorkspace();
      if (!workspace) return;
      workspace.set({ fill: color });
      canvas.renderAll();
      // TODO: SAVE WORKSPACE
      save();
    },
    changeSize: (size: {
      width: number;
      height: number;
    }) => {
      const workspace = getWorkspace();
      if (!workspace) return;
      workspace.set({
        width: size.width,
        height: size.height
      });
      autoZoom();
      // TODO: SAVE WORKSPACE
      save();
    },
    //* Drawing
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(
        canvas
      );
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    fillColor,
    //* Image
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === 'image') {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    addImage(value) {
      fabric.Image.fromURL(
        value,
        (img) => {
          const workspace = getWorkspace();
          img.scaleToWidth(workspace?.width || 0);
          img.scaleToHeight(workspace?.height || 0);

          addToCanvas(img);
        },
        {
          crossOrigin: 'anonymous'
        }
      );
    },
    //* Delete
    delete: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.remove(object);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    //* FONT SIZE
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 16;
      }

      // Faulty TS library, textAlign exists.
      const value =
        // @ts-ignore
        selectedObject.get('fontSize') || FONT_SIZE;

      return value;
    },
    //* FONT STYLE
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 'left';
      }

      // Faulty TS library, textAlign exists.
      const value =
        // @ts-ignore
        selectedObject.get('textAlign') || 'left';

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // Faulty TS library, underline exists.
      const value =
        // @ts-ignore
        selectedObject.get('underline') || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // Faulty TS library, linethrough exists.
      const value =
        // @ts-ignore
        selectedObject.get('linethrough') || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 'normal';
      }

      // Faulty TS library, fontStyle exists.
      const value =
        // @ts-ignore
        selectedObject.get('fontStyle') || 'normal';

      return value;
    },
    // !FONT WEIGHT
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, fontWeight exists.
      const value =
        // @ts-ignore
        selectedObject.get('fontWeight') || FONT_WEIGHT;

      return value;
    },

    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1.0;
      }
      const value =
        // @ts-ignore
        selectedObject.get('fontFamily') || FONT_FAMILY;

      return value;
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object) => {
        if (!isTextType(object.type)) return;
        object._set('fontFamily', value);
      });
      canvas.renderAll();
    },
    addText(value, options) {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        ...options,
        fill: fillColor
      });
      addToCanvas(object);
    },
    getActiveOpacity() {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1.0;
      }

      const value = selectedObject.get('opacity') || 1;

      return value;
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });

      canvas.renderAll();

      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value =
        selectedObject.get('strokeDashArray') ||
        strokeDashArray;

      return value;
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value =
        selectedObject.get('strokeWidth') || strokeWidth;

      return value as number;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value =
        selectedObject.get('stroke') || strokeColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get('fill') || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });

      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // fill if text
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }
        // stroke if object
        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
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
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS
      });
      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT }
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray
        }
      );

      addToCanvas(object);
    },
    addRectangle() {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS
      });
      addToCanvas(object);
    },
    addDiamond() {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 }
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray
        }
      );
      addToCanvas(object);
    },
    canvas,
    selectedObjects,
    autoZoom,
    getWorkspace,
    canRedo,
    canUndo
  };
}

//? HOOK

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] =
    useState<fabric.Canvas | null>(null);
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<
    fabric.Object[]
  >([]);

  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] =
    useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] =
    useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<
    number[]
  >(STROKE_DASH_ARRAY);

  //! Fonts
  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);

  const {
    save,
    canRedo,
    canUndo,
    undo,
    redo,
    canvasHistory,
    setHistoryIndex
  } = useHistory({
    canvas,
    saveCallback
  });

  //* Canvas Events hook
  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback
  });

  //* Auto rezize hook
  const { autoZoom } = useAutoResize({
    canvas,
    container
  });

  //* Clipboard hook
  const { copy, paste } = useClipboard({ canvas });

  useHotkeys({
    copy,
    paste,
    canvas,
    undo,
    redo,
    save
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily
      });
    }

    return undefined;
  }, [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily
  ]);

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

      const currentState = JSON.stringify(
        initialCanvas.toJSON(JSON_KEYS)
      );
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [canvasHistory, setHistoryIndex]
  );

  return { init, editor };
};
