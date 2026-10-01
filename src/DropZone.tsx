import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function DropZone({ onFilesSelected }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    onFilesSelected(droppedFiles);
  }, [onFilesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      onFilesSelected(selectedFiles);
    }
  };

  // Простая функция для красивого отображения размера (без библиотек)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Зона перетаскивания */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <span className="text-4xl mb-3">📁</span>
          <span className="text-lg font-medium text-gray-700">
            Перетащите файлы сюда или <span className="text-blue-600 underline">выберите на компьютере</span>
          </span>
          <span className="text-sm text-gray-500 mt-2">Поддерживаются любые форматы</span>
        </label>
      </div>

      {/* Список выбранных файлов */}
      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Выбранные файлы ({files.length})
          </div>
          <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}