import { useState, useRef, useEffect } from 'react';

type BlurType = 'gaussian' | 'pixelate' | 'black' | 'white' | 'mosaic';
type ShapeType = 'rectangle' | 'freeform';

interface BlurArea {
  id: string;
  points: { x: number; y: number }[];
  shape: ShapeType;
  blurType: BlurType;
}

export default function SensitiveBlur() {
  const [image, setImage] = useState<string | null>(null);
  const [blurAreas, setBlurAreas] = useState<BlurArea[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [blurType, setBlurType] = useState<BlurType>('gaussian');
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [pixelSize, setPixelSize] = useState(10);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    const url = URL.createObjectURL(file);
    setImage(url);
    setBlurAreas([]);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxWidth = 900;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      drawCanvas();
    };
    img.src = image;
  }, [image, blurAreas, blurType, blurIntensity, pixelSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    blurAreas.forEach((area) => {
      applyBlurToArea(ctx, area);
    });

    if (currentPoints.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      if (shapeType === 'rectangle' && currentPoints.length >= 2) {
        const startX = currentPoints[0].x;
        const startY = currentPoints[0].y;
        const endX = currentPoints[currentPoints.length - 1].x;
        const endY = currentPoints[currentPoints.length - 1].y;
        ctx.rect(startX, startY, endX - startX, endY - startY);
      } else {
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (shapeType === 'freeform') {
        currentPoints.forEach((point) => {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  };

  const applyBlurToArea = (ctx: CanvasRenderingContext2D, area: BlurArea) => {
    const scale = canvasRef.current ? canvasRef.current.width / (imageRef.current?.width || 1) : 1;
    
    ctx.save();
    ctx.beginPath();
    
    if (area.shape === 'rectangle' && area.points.length >= 2) {
      const x = area.points[0].x * scale;
      const y = area.points[0].y * scale;
      const w = (area.points[1].x - area.points[0].x) * scale;
      const h = (area.points[1].y - area.points[0].y) * scale;
      ctx.rect(x, y, w, h);
    } else {
      area.points.forEach((point, i) => {
        const px = point.x * scale;
        const py = point.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
    }
    ctx.clip();

    if (area.blurType === 'gaussian') {
      ctx.filter = `blur(${blurIntensity}px)`;
      ctx.drawImage(canvasRef.current!, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
    } else if (area.blurType === 'pixelate' || area.blurType === 'mosaic') {
      const pSize = pixelSize * scale;
      const bounds = getBounds(area.points, scale);
      for (let y = bounds.minY; y < bounds.maxY; y += pSize) {
        for (let x = bounds.minX; x < bounds.maxX; x += pSize) {
          const imageData = ctx.getImageData(x, y, pSize, pSize);
          if (imageData.data.length === 0) continue;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            count++;
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, pSize, pSize);
        }
      }
    } else if (area.blurType === 'black') {
      const bounds = getBounds(area.points, scale);
      ctx.fillStyle = '#000000';
      ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    } else if (area.blurType === 'white') {
      const bounds = getBounds(area.points, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    }

    ctx.restore();
  };

  const getBounds = (points: { x: number; y: number }[], scale: number) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      const px = p.x * scale;
      const py = p.y * scale;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    });
    return { minX, minY, maxX, maxY };
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (shapeType === 'rectangle') {
      setIsDrawing(true);
      setCurrentPoints([pos]);
    } else {
      setCurrentPoints(prev => [...prev, pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || shapeType !== 'rectangle') return;
    const pos = getMousePos(e);
    setCurrentPoints([currentPoints[0], pos]);
  };

  const handleMouseUp = () => {
    if (shapeType === 'rectangle' && isDrawing && currentPoints.length >= 2) {
      const area: BlurArea = {
        id: `area-${Date.now()}`,
        points: [currentPoints[0], currentPoints[1]],
        shape: 'rectangle',
        blurType,
      };
      setBlurAreas([...blurAreas, area]);
    }
    setIsDrawing(false);
    if (shapeType === 'rectangle') {
      setCurrentPoints([]);
    }
  };

  const handleDoubleClick = () => {
    if (shapeType === 'freeform' && currentPoints.length >= 3) {
      const area: BlurArea = {
        id: `area-${Date.now()}`,
        points: [...currentPoints],
        shape: 'freeform',
        blurType,
      };
      setBlurAreas([...blurAreas, area]);
      setCurrentPoints([]);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const clearAll = () => setBlurAreas([]);
  const undoLast = () => setBlurAreas(blurAreas.slice(0, -1));

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'blurred_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🔒 Размытие sensitive-данных</h2>
        <p className="text-gray-600 mb-4">
          Выделите области на фото и примените размытие. Всё работает локально.
        </p>

        {!image ? (
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="blur-input"
            />
            <label htmlFor="blur-input" className="cursor-pointer">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-gray-700 font-medium">Перетащите изображение сюда</p>
              <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
            </label>
          </div>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Форма выделения:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShapeType('rectangle'); setCurrentPoints([]); }}
                    className={`flex-1 p-2 rounded-lg border text-sm transition-colors ${
                      shapeType === 'rectangle'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ▭ Прямоугольник
                  </button>
                  <button
                    onClick={() => { setShapeType('freeform'); setCurrentPoints([]); }}
                    className={`flex-1 p-2 rounded-lg border text-sm transition-colors ${
                      shapeType === 'freeform'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ✏️ Произвольная (по точкам)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Тип размытия:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {([
                    { id: 'gaussian', label: '️ Гаусс', desc: 'Мягкое' },
                    { id: 'pixelate', label: '🟦 Пиксели', desc: 'Кубиками' },
                    { id: 'mosaic', label: '🎨 Мозаика', desc: 'Цветные блоки' },
                    { id: 'black', label: ' Чёрный', desc: 'Закрыть' },
                    { id: 'white', label: '⬜ Белый', desc: 'Закрыть' },
                  ] as { id: BlurType; label: string; desc: string }[]).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setBlurType(opt.id)}
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        blurType === opt.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs opacity-75">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(blurType === 'gaussian' || blurType === 'pixelate' || blurType === 'mosaic') && (
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{blurType === 'gaussian' ? 'Сила размытия' : 'Размер пикселя'}</span>
                    <span className="font-mono">{blurType === 'gaussian' ? `${blurIntensity}px` : `${pixelSize}px`}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={blurType === 'gaussian' ? blurIntensity : pixelSize}
                    onChange={(e) => {
                      if (blurType === 'gaussian') setBlurIntensity(Number(e.target.value));
                      else setPixelSize(Number(e.target.value));
                    }}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button onClick={undoLast} disabled={blurAreas.length === 0} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                  ↩️ Отменить последнюю
                </button>
                <button onClick={clearAll} disabled={blurAreas.length === 0} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  🗑️ Очистить все
                </button>
                <button onClick={() => setImage(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  📁 Другое фото
                </button>
                <button onClick={downloadImage} disabled={blurAreas.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  💾 Скачать результат
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
              {shapeType === 'rectangle' ? (
                <>
                  <strong>Прямоугольник:</strong> Зажмите левую кнопку мыши и перетащите, чтобы выделить область.
                </>
              ) : (
                <>
                  <strong>Произвольная форма:</strong> Кликайте по точкам контура. Двойной клик — завершить выделение. Правый клик — отмена.
                </>
              )}
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleRightClick}
                className="cursor-crosshair block max-w-full"
              />
            </div>

            {blurAreas.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Применено областей: <strong>{blurAreas.length}</strong>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}