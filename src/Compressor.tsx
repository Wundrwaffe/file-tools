import { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface CompressorProps {
  files: File[];
}

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  compressedUrl: string | null;
  compressedBlob: Blob | null;
  originalSize: number;
  compressedSize: number | null;
  processing: boolean;
  error: string | null;
}

export default function Compressor({ files }: CompressorProps) {
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // При изменении файлов — создаём записи
  useEffect(() => {
    if (files.length === 0) {
      setImages([]);
      return;
    }

    const newImages: ProcessedImage[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: null,
      compressedBlob: null,
      originalSize: file.size,
      compressedSize: null,
      processing: false,
      error: null,
    }));

    setImages(newImages);
  }, [files]);

  // Сжимаем все изображения при изменении качества или формата
  useEffect(() => {
    if (images.length === 0) return;

    const compressAll = async () => {
      const updated = await Promise.all(
        images.map(async (img) => {
          try {
            const blob = await compressImage(img.originalFile, quality, format);
            const url = URL.createObjectURL(blob);
            return {
              ...img,
              compressedUrl: url,
              compressedBlob: blob,
              compressedSize: blob.size,
              processing: false,
              error: null,
            };
          } catch (err) {
            return {
              ...img,
              processing: false,
              error: 'Ошибка сжатия',
            };
          }
        })
      );
      setImages(updated);
    };

    compressAll();
  }, [quality, format]);

  const compressImage = (file: File, q: number, fmt: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          fmt,
          q / 100
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getReduction = (original: number, compressed: number): string => {
    const reduction = ((original - compressed) / original) * 100;
    return reduction.toFixed(0);
  };

  const downloadSingle = (img: ProcessedImage) => {
    if (!img.compressedBlob) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const name = img.originalFile.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`;
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    setDownloadingAll(true);
    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';

    images.forEach((img) => {
      if (img.compressedBlob) {
        const name = img.originalFile.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`;
        zip.file(name, img.compressedBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_images.zip';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadingAll(false);
  };

  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressed = images.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
  const totalReduction = totalOriginal > 0 ? getReduction(totalOriginal, totalCompressed) : '0';

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Загрузите изображения для сжатия</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Панель настроек */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Настройки сжатия</h3>
        
        <div className="mb-4">
          <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Качество</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{quality}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Меньше размер</span>
            <span>Лучше качество</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Формат выхода</label>
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

        {/* Итоговая статистика */}
        {images.length > 0 && images.some(img => img.compressedSize !== null) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Всего файлов: <strong>{images.length}</strong></p>
                <p className="text-sm text-gray-600">
                  Общий размер: <strong>{formatSize(totalOriginal)}</strong> → <strong>{formatSize(totalCompressed)}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">-{totalReduction}%</p>
                <p className="text-xs text-gray-500">экономия</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Список изображений */}
      <div className="space-y-4">
        {images.map((img) => {
          const reduction = img.compressedSize ? getReduction(img.originalSize, img.compressedSize) : null;
          return (
            <div key={img.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Превью */}
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={img.compressedUrl || img.originalUrl}
                    alt={img.originalFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{img.originalFile.name}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">До:</span>{' '}
                      <span className="font-mono">{formatSize(img.originalSize)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">После:</span>{' '}
                      <span className="font-mono">
                        {img.compressedSize ? formatSize(img.compressedSize) : '...'}
                      </span>
                    </div>
                    {reduction && (
                      <div className="text-green-600 font-semibold">
                        -{reduction}%
                      </div>
                    )}
                  </div>
                  {img.error && (
                    <p className="text-red-500 text-sm mt-2">{img.error}</p>
                  )}
                </div>

                {/* Кнопка скачивания */}
                <div className="flex items-center">
                  <button
                    onClick={() => downloadSingle(img)}
                    disabled={!img.compressedBlob}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      img.compressedBlob
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                     Скачать
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Кнопка скачать всё */}
      {images.length > 1 && images.some(img => img.compressedBlob) && (
        <div className="mt-6 text-center">
          <button
            onClick={downloadAll}
            disabled={downloadingAll}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              downloadingAll
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {downloadingAll ? '⏳ Создание ZIP...' : '📦 Скачать все в ZIP'}
          </button>
        </div>
      )}
    </div>
  );
}