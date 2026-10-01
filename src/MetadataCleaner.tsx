import React, { useState } from 'react';
import exifr from 'exifr';

interface MetadataCleanerProps {
  files: File[];
}

interface FileResult {
  id: string;
  file: File;
  metadata: any; // Используем any, чтобы не бороться с типами EXIF
  isCleaned: boolean;
  cleanedBlob?: Blob;
  error?: string;
  isProcessing: boolean;
}

export default function MetadataCleaner({ files }: MetadataCleanerProps) {
  const [mode, setMode] = useState<'all' | 'selective'>('all');
  const [results, setResults] = useState<FileResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Чтение метаданных при выборе файлов
  React.useEffect(() => {
    if (files.length === 0) {
      setResults([]);
      return;
    }

    const loadMetadata = async () => {
      const newResults: FileResult[] = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            return {
              id: Math.random().toString(36).substring(7),
              file,
              metadata: null,
              isCleaned: false,
              error: 'Обработке подлежат только изображения (JPG, PNG, WebP)',
              isProcessing: false,
            };
          }

          try {
            // Читаем основные EXIF, GPS и IPTC данные
            const meta = await exifr.parse(file, { exif: true, gps: true, iptc: true });
            return {
              id: Math.random().toString(36).substring(7),
              file,
              metadata: meta,
              isCleaned: false,
              isProcessing: false,
            };
          } catch (e) {
            // Если метаданных нет или ошибка чтения, это не страшно
            return {
              id: Math.random().toString(36).substring(7),
              file,
              metadata: null,
              isCleaned: false,
              isProcessing: false,
            };
          }
        })
      );
      setResults(newResults);
    };

    loadMetadata();
  }, [files]);

  // Функция очистки через Canvas (гарантированно удаляет ВСЕ метаданные)
  const cleanFile = async (result: FileResult): Promise<FileResult> => {
    if (result.error || !result.file.type.startsWith('image/')) {
      return { ...result, isProcessing: false };
    }

    try {
      const img = new Image();
      const url = URL.createObjectURL(result.file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Не удалось получить контекст canvas');
      
      ctx.drawImage(img, 0, 0);

      // Конвертируем canvas обратно в Blob. 
      // ВАЖНО: Canvas по своей природе НЕ сохраняет метаданные исходного файла.
      // Это самый надежный способ "выжечь" их без сложных библиотек.
      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, result.file.type || 'image/jpeg', 0.95)
      );

      URL.revokeObjectURL(url);

      if (!blob) throw new Error('Ошибка создания очищенного файла');

      return {
        ...result,
        isCleaned: true,
        cleanedBlob: blob,
        isProcessing: false,
      };
    } catch (error) {
      return {
        ...result,
        isProcessing: false,
        error: 'Ошибка при очистке',
      };
    }
  };

  const handleCleanAll = async () => {
    setIsProcessing(true);
    setResults(prev => prev.map(r => ({ ...r, isProcessing: true })));

    // Обрабатываем последовательно, чтобы не вешать браузер
    for (let i = 0; i < results.length; i++) {
      const cleaned = await cleanFile(results[i]);
      setResults(prev => prev.map((r, idx) => (idx === i ? cleaned : r)));
    }

    setIsProcessing(false);
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Добавляем префикс "clean_" к имени файла
    const nameParts = fileName.split('.');
    const ext = nameParts.pop();
    const cleanName = `clean_${nameParts.join('.')}.${ext}`;
    
    a.download = cleanName;
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="all"
                checked={mode === 'all'}
                onChange={() => setMode('all')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Удалить всё (Рекомендуется)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="selective"
                checked={mode === 'selective'}
                onChange={() => setMode('selective')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Выбрать категории</span>
            </label>
          </div>

          <button
            onClick={handleCleanAll}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing ? '⏳ Очистка...' : '🧹 Очистить метаданные'}
          </button>
        </div>
        
        {mode === 'selective' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            💡 <strong>Примечание:</strong> Для максимальной гарантии приватности в браузере применяется полная перерисовка изображения. Это физически удаляет <strong>все</strong> скрытые данные (GPS, модель камеры, дату), что надежнее частичного редактирования.
          </div>
        )}
      </div>

      {/* Результаты */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Найденные метаданные и статус
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.file.name}</p>
                    
                    {item.error ? (
                      <p className="text-red-500 text-sm mt-1">⚠️ {item.error}</p>
                    ) : item.metadata ? (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-1">Найдено для удаления:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {item.metadata.Make || item.metadata.Model ? (
                            <li>📷 Камера: {item.metadata.Make} {item.metadata.Model}</li>
                          ) : null}
                          {item.metadata.latitude || item.metadata.longitude ? (
                            <li>📍 GPS: {item.metadata.latitude?.toFixed(4)}, {item.metadata.longitude?.toFixed(4)}</li>
                          ) : null}
                          {item.metadata.DateTimeOriginal ? (
                            <li>📅 Дата съемки: {String(item.metadata.DateTimeOriginal)}</li>
                          ) : null}
                          {!item.metadata.Make && !item.metadata.latitude && !item.metadata.DateTimeOriginal ? (
                            <li>ℹ️ Минимальные метаданные (возможно, уже очищены или это скриншот)</li>
                          ) : null}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Явные метаданные не найдены (файл будет пересоздан для гарантии)</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.isProcessing && (
                      <span className="text-sm text-blue-600 animate-pulse">Очистка...</span>
                    )}
                    {item.isCleaned && item.cleanedBlob && (
                      <button
                        onClick={() => downloadFile(item.cleanedBlob!, item.file.name)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        <span>⬇️</span> Скачать чистый файл
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}