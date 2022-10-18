// Misc
import { useEffect, useRef, useState } from 'react';

// Styled Components
import { CANVAS_CONTAINER } from './canvas.styles';

const Canvas = () => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const lines = useRef([]);
  const intersections = useRef([]);
  let tempIntersections = useRef([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const mouse = useRef({
    mouseDownPos: null,
    mouseCurrentPos: null,
    mouseUpPos: null,

    setDown: function(e) {
      setIsDrawing(true);
      this.mouseDownPos = this.getPosition(e);
    },
    setCurrent: function(e) {
      this.mouseCurrentPos = this.getPosition(e);
    },
    setUp: function(e) {
      setIsDrawing(false);
      this.mouseUpPos = this.getPosition(e);
    },

    getPosition: function(e) {
      const position = {
        x: e.clientX - canvasRef.current.offsetLeft,
        y: e.clientY - canvasRef.current.offsetTop
      };
      return position;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1200;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    contextRef.current = ctx;
  }, []);

  const drawLine = (line) => {
    const { start, end } = line;

    if (!start || !end) {
      throw new Error('Start or end of line not defined.');
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(start.x, start.y);
    contextRef.current.lineTo(end.x, end.y);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const drawPreviousLinesAndDots = () => {
    clearCanvas();
    lines.current.map(line => drawLine(line));
    intersections.current.map(dot => drawDot(dot));
  };

  const drawingHandler = (e) => {
    if (isDrawing === true) {
      setIsDrawing(false);

      tempIntersections.current.map(dot => intersections.current.push(dot));
      return;
    }

    setIsDrawing(true);

    mouse.current.setDown(e);

    const line = {
      start: mouse.current.mouseDownPos,
      end: mouse.current.mouseDownPos,
    };
    lines.current.push(line);
  };

  const mouseMoveHandler = (e) => {
    if (!isDrawing) return;

    mouse.current.setCurrent(e);

    const line = {
      start: mouse.current.mouseDownPos,
      end: mouse.current.mouseCurrentPos
    };

    lines.current.pop();
    lines.current.push(line);

    drawPreviousLinesAndDots();
    getIntersections(line);
  };

  const getIntersections = (newLine) => {
    tempIntersections.current = [];

    lines.current.map(line => {
      const I = calculateIntersections(newLine, line);
      if (I) {
        tempIntersections.current.push(I);
      }
      return line;
    });

    if (tempIntersections.current.length > 0) {
      tempIntersections.current.map(dot => drawDot(dot));
    }
  };

  const calculateIntersections = (line1, line2) => {
    if (lines.current.length <= 1) return;
    const A = line1.start;
    const B = line1.end;
    const C = line2.start;
    const D = line2.end;

    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
      const t = tTop / bottom;
      const u = uTop / bottom;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: lerp(A.x, B.x, t),
          y: lerp(A.y, B.y, t),
          offset: t
        };
      }
    }
  };

  function lerp(A, B, t) {
    return A + (B - A) * t;
  }

  const drawDot = (point) => {
    contextRef.current.beginPath();
    contextRef.current.fillStyle = "red";
    contextRef.current.arc(point.x, point.y, 10, 0, Math.PI * 2);
    contextRef.current.fill();
    contextRef.current.stroke();
  };

  return (
    <CANVAS_CONTAINER>
      <canvas
        onMouseUp={drawingHandler}
        onMouseMove={mouseMoveHandler}
        ref={canvasRef}
      />
    </CANVAS_CONTAINER>
  );
};

export default Canvas;