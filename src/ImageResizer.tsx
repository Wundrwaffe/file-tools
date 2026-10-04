import { useState, useEffect } from 'react';

interface ResizedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  resizedUrl: string | null;
  resizedBlob: Blob | null;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  processing: boolean;
  error: string | null;
}

const PRESETS = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
];

export default function ImageResizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(85);

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Пожалуйста, выберите изображения');
      return;
    }

    setFiles(imageFiles);
    
    const newImages: ResizedImage[] = imageFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      resizedUrl: null,
      resizedBlob: null,
      originalWidth: 0,
      originalHeight: 0,
      newWidth: width,
      newHeight: height,
      processing: false,
      error: null,
    }));
    
    setImages(newImages);
  };

  useEffect(() => {
    if (images.length === 0) return;

    const resizeAll = async () => {
      const updated = await Promise.all(
        images.map(async (img) => {
          try {
            const blob = await resizeImage(img.originalFile, width, height, maintainAspectRatio, format, quality);
            const url = URL.createObjectURL(blob);
            
            // Получаем новые размеры
            const tempImg = new Image();
            await new Promise((resolve) => {
              tempImg.onload = resolve;
              tempImg.src = URL.createObjectURL(blob);
            });
            
            return {
              ...img,
              resizedUrl: url,
              resizedBlob: blob,
              newWidth: tempImg.width,
              newHeight: tempImg.height,
              processing: false,
              error: null,
            };
          } catch (err) {
            return {
              ...img,
              processing: false,
              error: 'Ошибка изменения размера',
            };
          }
        })
      );
      setImages(updated);
    };

    resizeAll();
  }, [width, height, maintainAspectRatio, format, quality]);

  const resizeImage = (
    file: File, 
    w: number, 
    h: number, 
    maintain: boolean, 
    fmt: string, 
    q: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let newWidth = w;
        let newHeight = h;

        if (maintain) {
          const ratio = Math.min(w / img.width, h / img.height);
          newWidth = Math.round(img.width * ratio);
          newHeight = Math.round(img.height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Resize failed'));
          },
          fmt,
          q / 100
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const downloadFile = (img: ResizedImage) => {
    if (!img.resizedBlob) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const name = img.originalFile.name.replace(/\.[^.]+$/, '') + `_resized.${ext}`;
    const url = URL.createObjectURL(img.resizedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📐 Изменение размера изображений</h2>
        <p className="text-gray-600 mb-4">
          Измените размер изображений с сохранением пропорций или под конкретные размеры.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            id="resize-input"
          />
          <label htmlFor="resize-input" className="cursor-pointer">
            <div className="text-4xl mb-2"></div>
            <p className="text-gray-700 font-medium">Перетащите изображения сюда</p>
            <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
          </label>
        </div>

        {/* Пресеты */}
        {files.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Быстрые пресеты:</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  {preset.name} ({preset.width}×{preset.height})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Настройки */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ширина (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Высота (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={maintainAspectRatio} 
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)} 
                />
                <span className="text-sm">Сохранять пропорции</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Формат</label>
              <div className="flex gap-2">
                {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`flex-1 p-2 rounded-lg border text-sm transition-colors ${
                      format === fmt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {fmt === 'image/jpeg' ? 'JPG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Качество</span>
                <span className="font-mono">{quality}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Список изображений */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={img.resizedUrl || img.originalUrl}
                    alt={img.originalFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{img.originalFile.name}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">Оригинал:</span>{' '}
                      <span className="font-mono">{img.originalWidth || '...'}×{img.originalHeight || ''}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Новый:</span>{' '}
                      <span className="font-mono">{img.newWidth}×{img.newHeight}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Размер:</span>{' '}
                      <span className="font-mono">
                        {img.resizedBlob ? formatSize(img.resizedBlob.size) : formatSize(img.originalFile.size)}
                      </span>
                    </div>
                  </div>
                  {img.error && (
                    <p className="text-red-500 text-sm mt-2">{img.error}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => downloadFile(img)}
                    disabled={!img.resizedBlob}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      img.resizedBlob
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                     Скачать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}