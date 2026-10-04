import { useState } from 'react';

interface ConvertedFile {
  id: string;
  originalFile: File;
  originalUrl: string;
  convertedUrl: string | null;
  convertedBlob: Blob | null;
  processing: boolean;
  error: string | null;
}

export default function HeicConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    const heicFiles = newFiles.filter(f => 
      f.name.toLowerCase().endsWith('.heic') || 
      f.name.toLowerCase().endsWith('.heif')
    );
    
    if (heicFiles.length === 0) {
      alert('Пожалуйста, выберите файлы HEIC или HEIF');
      return;
    }

    setFiles(heicFiles);
    
    const newConverted: ConvertedFile[] = heicFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      convertedUrl: null,
      convertedBlob: null,
      processing: false,
      error: null,
    }));
    
    setConverted(newConverted);
  };

  const convertFile = async (file: File): Promise<Blob> => {
    // Используем heic2any для конвертации
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    return blob as Blob;
  };

  const convertAll = async () => {
    const updated = await Promise.all(
      converted.map(async (img) => {
        try {
          img.processing = true;
          const blob = await convertFile(img.originalFile);
          const url = URL.createObjectURL(blob);
          return {
            ...img,
            convertedUrl: url,
            convertedBlob: blob,
            processing: false,
            error: null,
          };
        } catch (err) {
          return {
            ...img,
            processing: false,
            error: 'Ошибка конвертации',
          };
        }
      })
    );
    setConverted(updated);
  };

  const downloadFile = (img: ConvertedFile) => {
    if (!img.convertedBlob) return;
    const name = img.originalFile.name.replace(/\.(heic|heif)$/i, '.jpg');
    const url = URL.createObjectURL(img.convertedBlob);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📱 Конвертер HEIC → JPG</h2>
        <p className="text-gray-600 mb-4">
          Конвертируйте фото с iPhone (HEIC/HEIF) в формат JPG. Всё работает локально в браузере.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".heic,.heif"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            id="heic-input"
          />
          <label htmlFor="heic-input" className="cursor-pointer">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-700 font-medium">Перетащите HEIC файлы сюда</p>
            <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
          </label>
        </div>

        {files.length > 0 && (
          <button
            onClick={convertAll}
            disabled={converted.some(img => img.processing)}
            className={`w-full mt-4 p-3 rounded-lg font-semibold transition-colors ${
              converted.some(img => img.processing)
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {converted.some(img => img.processing) ? '⏳ Конвертация...' : '🔄 Конвертировать все'}
          </button>
        )}
      </div>

      {/* Список файлов */}
      {converted.length > 0 && (
        <div className="space-y-4">
          {converted.map((img) => (
            <div key={img.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={img.convertedUrl || img.originalUrl}
                    alt={img.originalFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{img.originalFile.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Размер: {formatSize(img.originalFile.size)}
                  </p>
                  {img.error && (
                    <p className="text-red-500 text-sm mt-2">{img.error}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => downloadFile(img)}
                    disabled={!img.convertedBlob}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      img.convertedBlob
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                     Скачать JPG
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