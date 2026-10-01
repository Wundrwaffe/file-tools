import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface CompressorProps {
  files: File[];
}

// Простой интерфейс для результатов (без сложной типизации)
interface ResultItem {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  error?: string;
  isProcessing: boolean;
}

export default function Compressor({ files }: CompressorProps) {
  const [quality, setQuality] = useState(0.7); // Качество от 0.1 до 1.0
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isCompressingAll, setIsCompressingAll] = useState(false);

  // Форматирование размера файла
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Функция сжатия одного файла
  const compressFile = async (file: File, id: string) => {
    // Проверка: это изображение?
    if (!file.type.startsWith('image/')) {
      setResults(prev => prev.map(item => 
        item.id === id ? { ...item, isProcessing: false, error: 'Поддерживаются только изображения (JPG, PNG, WebP)' } : item
      ));
      return;
    }

    try {
      const options = {
        initialQuality: quality,
        maxWidthOrHeight: 1920, // Ограничиваем максимальное разрешение для ускорения
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      
      setResults(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          isProcessing: false, 
          compressedSize: compressedFile.size, 
          compressedBlob: compressedFile 
        } : item
      ));
    } catch (error) {
      setResults(prev => prev.map(item => 
        item.id === id ? { ...item, isProcessing: false, error: 'Ошибка при сжатии' } : item
      ));
    }
  };

  // Запуск сжатия для всех файлов
  const handleCompressAll = async () => {
    setIsCompressingAll(true);
    
    // Инициализируем список результатов
    const initialResults: ResultItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      originalSize: file.size,
      isProcessing: true,
    }));
    setResults(initialResults);

    // Обрабатываем файлы последовательно, чтобы не перегружать браузер
    for (const file of files) {
      const id = initialResults.find(r => r.fileName === file.name)?.id;
      if (id) {
        await compressFile(file, id);
      }
    }
    
    setIsCompressingAll(false);
  };

  // Скачивание файла
  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (files.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
        Сначала выберите файлы в зоне выше 👆
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Панель управления */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Качество сжатия: <span className="text-blue-600 font-bold">{Math.round(quality * 100)}%</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Макс. сжатие</span>
              <span>Оригинал</span>
            </div>
          </div>
          
          <button
            onClick={handleCompressAll}
            disabled={isCompressingAll}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isCompressingAll 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isCompressingAll ? '⏳ Сжатие...' : '🚀 Сжать все файлы'}
          </button>
        </div>
      </div>

      {/* Результаты */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Результаты обработки
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((item) => {
              const savings = item.compressedSize 
                ? Math.round((1 - item.compressedSize / item.originalSize) * 100) 
                : 0;

              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.fileName}</p>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="text-gray-500">Было: {formatSize(item.originalSize)}</span>
                      {item.compressedSize && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-600 font-medium">Стало: {formatSize(item.compressedSize)}</span>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            -{savings}%
                          </span>
                        </>
                      )}
                    </div>
                    {item.error && (
                      <p className="text-red-500 text-sm mt-1">⚠️ {item.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {item.isProcessing && (
                      <span className="text-sm text-blue-600 animate-pulse">Обработка...</span>
                    )}
                    {item.compressedBlob && !item.isProcessing && (
                      <button
                        onClick={() => downloadFile(item.compressedBlob!, item.fileName)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        <span>⬇️</span> Скачать
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}