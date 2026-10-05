import { useState, useEffect } from 'react';
import exifr from 'exifr';
import { PDFDocument } from 'pdf-lib';

interface MetadataCleanerProps {
  files: File[];
}

interface FileResult {
  id: string;
  file: File;
  type: 'image' | 'pdf' | 'other';
  metadata: Record<string, any>;
  isCleaned: boolean;
  cleanedBlob?: Blob;
  error?: string;
  isProcessing: boolean;
  selectedFieldsToRemove: string[];
}

export default function MetadataCleaner({ files }: MetadataCleanerProps) {
  const [mode, setMode] = useState<'all' | 'selective'>('selective');
  const [results, setResults] = useState<FileResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (files.length === 0) {
      setResults([]);
      return;
    }

    const loadMetadata = async () => {
      const newResults: FileResult[] = await Promise.all(
        files.map(async (file) => {
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          const isImage = file.type.startsWith('image/');

          if (!isPdf && !isImage) {
            return {
              id: Math.random().toString(36).substring(7),
              file,
              type: 'other' as const,
              metadata: {},
              isCleaned: false,
              error: 'Поддерживаются только изображения (JPG, PNG, WebP) и PDF',
              isProcessing: false,
              selectedFieldsToRemove: [],
            };
          }

          try {
            let metadata: Record<string, any> = {};

            if (isImage) {
              const meta = await exifr.parse(file, { 
                exif: true, gps: true, iptc: true, icc: true, xmp: true, tiff: true, jfif: true, reviveValues: true 
              });
              metadata = meta || {};
            } else if (isPdf) {
              const arrayBuffer = await file.arrayBuffer();
              const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
              metadata = {
                title: pdfDoc.getTitle() || undefined,
                author: pdfDoc.getAuthor() || undefined,
                subject: pdfDoc.getSubject() || undefined,
                keywords: pdfDoc.getKeywords() || undefined,
                creator: pdfDoc.getCreator() || undefined,
                producer: pdfDoc.getProducer() || undefined,
                creationDate: pdfDoc.getCreationDate()?.toString() || undefined,
                modificationDate: pdfDoc.getModificationDate()?.toString() || undefined,
              };
            }

            const availableFields = Object.keys(metadata).filter(key => metadata[key] !== undefined);

            return {
              id: Math.random().toString(36).substring(7),
              file,
              type: isImage ? 'image' : 'pdf',
              metadata,
              isCleaned: false,
              isProcessing: false,
              selectedFieldsToRemove: availableFields,
            };
          } catch {
            return {
              id: Math.random().toString(36).substring(7),
              file,
              type: isImage ? 'image' : 'pdf',
              metadata: {},
              isCleaned: false,
              error: 'Не удалось прочитать метаданные',
              isProcessing: false,
              selectedFieldsToRemove: [],
            };
          }
        })
      );
      setResults(newResults);
    };

    loadMetadata();
  }, [files]);

  const toggleField = (id: string, field: string) => {
    setResults(prev => prev.map(item => {
      if (item.id === id) {
        const isSelected = item.selectedFieldsToRemove.includes(field);
        return {
          ...item,
          selectedFieldsToRemove: isSelected
            ? item.selectedFieldsToRemove.filter(f => f !== field)
            : [...item.selectedFieldsToRemove, field],
        };
      }
      return item;
    }));
  };

  const cleanFile = async (result: FileResult): Promise<FileResult> => {
    if (result.error || result.type === 'other') {
      return { ...result, isProcessing: false };
    }

    try {
      if (result.type === 'pdf') {
        const arrayBuffer = await result.file.arrayBuffer();
        
        if (mode === 'all') {
          const sourcePdf = await PDFDocument.load(arrayBuffer);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
          copiedPages.forEach((page) => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          
          return {
            ...result,
            isCleaned: true,
            // ИСПРАВЛЕНИЕ: используем .buffer для получения ArrayBuffer из Uint8Array
            cleanedBlob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
            isProcessing: false,
          };
        } else {
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const fieldsToRemove = result.selectedFieldsToRemove;
          
          if (fieldsToRemove.includes('title')) pdfDoc.setTitle('');
          if (fieldsToRemove.includes('author')) pdfDoc.setAuthor('');
          if (fieldsToRemove.includes('subject')) pdfDoc.setSubject('');
          if (fieldsToRemove.includes('keywords')) pdfDoc.setKeywords([]);
          if (fieldsToRemove.includes('creator')) pdfDoc.setCreator('');
          if (fieldsToRemove.includes('producer')) pdfDoc.setProducer('');
          if (fieldsToRemove.includes('creationDate')) pdfDoc.setCreationDate(new Date(0));
          if (fieldsToRemove.includes('modificationDate')) pdfDoc.setModificationDate(new Date(0));

          const pdfBytes = await pdfDoc.save();
          return {
            ...result,
            isCleaned: true,
            // ИСПРАВЛЕНИЕ: используем .buffer
            cleanedBlob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
            isProcessing: false,
          };
        }
      } else if (result.type === 'image') {
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
      }
    } catch {
      return {
        ...result,
        isProcessing: false,
        error: 'Ошибка при очистке',
      };
    }
    
    // ИСПРАВЛЕНИЕ: гарантированный return для TS2366
    return { ...result, isProcessing: false, error: 'Необработанный тип файла' };
  };

  const handleCleanAll = async () => {
    setIsProcessing(true);
    setResults(prev => prev.map(r => ({ ...r, isProcessing: true })));

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
    const nameParts = fileName.split('.');
    const ext = nameParts.pop();
    const cleanName = `clean_${nameParts.join('.')}.${ext}`;
    
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ИСПРАВЛЕНИЕ: добавлен тип 'other'
  const formatMetadata = (meta: Record<string, any>, type: 'image' | 'pdf' | 'other') => {
    if (type === 'other' || Object.keys(meta).length === 0) return null;

    if (type === 'pdf') {
      return (
        <ul className="list-disc list-inside space-y-1 text-sm">
          {meta.title && <li><strong>Название:</strong> {meta.title}</li>}
          {meta.author && <li><strong>Автор:</strong> {meta.author}</li>}
          {meta.subject && <li><strong>Тема:</strong> {meta.subject}</li>}
          {meta.keywords && <li><strong>Ключевые слова:</strong> {meta.keywords}</li>}
          {meta.creator && <li><strong>Создатель:</strong> {meta.creator}</li>}
          {meta.producer && <li><strong>Производитель (ПО):</strong> {meta.producer}</li>}
          {meta.creationDate && <li><strong>Дата создания:</strong> {meta.creationDate}</li>}
          {meta.modificationDate && <li><strong>Дата изменения:</strong> {meta.modificationDate}</li>}
        </ul>
      );
    } else {
      const groups: Record<string, string[]> = {
        '📷 Камера': [],
        '📍 Геолокация': [],
        '📅 Дата и время': [],
        '💻 ПО и настройки': [],
        '📐 Изображение': [],
      };

      if (meta.Make || meta.Model) groups['📷 Камера'].push(`${meta.Make || ''} ${meta.Model || ''}`.trim());
      if (meta.latitude && meta.longitude) groups['📍 Геолокация'].push(`${meta.latitude.toFixed(4)}, ${meta.longitude.toFixed(4)}`);
      if (meta.DateTimeOriginal || meta.CreateDate) groups['📅 Дата и время'].push(String(meta.DateTimeOriginal || meta.CreateDate));
      if (meta.Software || meta.Creator) groups['💻 ПО и настройки'].push(meta.Software || meta.Creator);
      if (meta.ImageWidth || meta.ImageHeight) groups['📐 Изображение'].push(`${meta.ImageWidth} x ${meta.ImageHeight}`);

      Object.keys(meta).forEach(key => {
        if (!['Make', 'Model', 'latitude', 'longitude', 'DateTimeOriginal', 'CreateDate', 'Software', 'Creator', 'ImageWidth', 'ImageHeight'].includes(key)) {
           if (typeof meta[key] === 'string' || typeof meta[key] === 'number') {
             groups['📐 Изображение'].push(`${key}: ${meta[key]}`);
           }
        }
      });

      return (
        <div className="space-y-3 text-sm">
          {Object.entries(groups).map(([groupName, items]) => 
            items.length > 0 ? (
              <div key={groupName}>
                <p className="font-semibold text-gray-700 mb-1">{groupName}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {items.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            ) : null
          )}
        </div>
      );
    }
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Удалить всё (Рекомендуется)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" value="selective" checked={mode === 'selective'} onChange={() => setMode('selective')} className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Выбрать категории</span>
            </label>
          </div>

          <button
            onClick={handleCleanAll}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing ? '⏳ Очистка...' : '🧹 Очистить метаданные'}
          </button>
        </div>
        
        {mode === 'selective' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            💡 <strong>Примечание:</strong> Для PDF применяется точечное удаление выбранных полей. Для изображений применяется полная перерисовка (Canvas), что гарантирует удаление <strong>всех</strong> скрытых данных.
          </div>
        )}
      </div>

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
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        item.type === 'pdf' ? 'bg-red-100 text-red-700' : 
                        item.type === 'image' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.type === 'pdf' ? 'PDF' : item.type === 'image' ? 'Изображение' : 'Неподдерживаемый'}
                      </span>
                      <p className="font-medium text-gray-800 truncate">{item.file.name}</p>
                    </div>
                    
                    {item.error ? (
                      <p className="text-red-500 text-sm mt-1">⚠️ {item.error}</p>
                    ) : Object.keys(item.metadata).length > 0 ? (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-2">Найденные метаданные:</p>
                        {formatMetadata(item.metadata, item.type)}
                        
                        {mode === 'selective' && item.type !== 'other' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="font-semibold text-gray-700 mb-2">Удалить следующие поля:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(item.metadata).map((field) => (
                                <label key={field} className="flex items-center gap-1.5 text-sm cursor-pointer select-none bg-white px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={item.selectedFieldsToRemove.includes(field)}
                                    onChange={() => toggleField(item.id, field)}
                                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                  />
                                  <span className="capitalize text-gray-700">
                                    {field === 'creationDate' ? 'Дата создания' : 
                                     field === 'modificationDate' ? 'Дата изменения' : 
                                     field}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Явные метаданные не найдены (файл будет пересоздан для гарантии чистоты)</p>
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