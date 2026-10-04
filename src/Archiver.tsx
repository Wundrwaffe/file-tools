import { useState } from 'react';
import JSZip from 'jszip';

type Mode = 'compress' | 'extract';

interface ArchiveFile {
  id: string;
  file: File;
  name: string;
  path: string;
  size: number;
}

interface ExtractedFile {
  name: string;
  path: string;
  size: number;
  blob: Blob;
}

export default function Archiver() {
  const [mode, setMode] = useState<Mode>('compress');
  
  const [filesToArchive, setFilesToArchive] = useState<ArchiveFile[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<'STORE' | 'DEFLATE'>('DEFLATE');
  const [archiveName, setArchiveName] = useState('archive');
  const [archiving, setArchiving] = useState(false);
  const [archiveBlob, setArchiveBlob] = useState<Blob | null>(null);
  const [archiveError, setArchiveError] = useState('');

  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [extractError, setExtractError] = useState('');

  // === ЧТЕНИЕ ПАПКИ (рекурсивно через webkitGetAsEntry) ===
  const readDirectory = (entry: FileSystemEntry): Promise<ArchiveFile[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        fileEntry.file((file) => {
          const path = fileEntry.fullPath.startsWith('/') 
            ? fileEntry.fullPath.substring(1) 
            : fileEntry.fullPath;
          
          resolve([{
            id: `${path}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            path,
            size: file.size,
          }]);
        }, () => resolve([]));
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        
        dirReader.readEntries(async (entries) => {
          const results: ArchiveFile[] = [];
          for (const childEntry of entries) {
            const childFiles = await readDirectory(childEntry);
            results.push(...childFiles);
          }
          resolve(results);
        }, () => resolve([]));
      } else {
        resolve([]);
      }
    });
  };

  // === АРХИВАЦИЯ ===
  const handleFilesForArchive = (newFiles: FileList | File[]) => {
    const validFiles: ArchiveFile[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
      
      if (file.size === 0 && !file.type && !relativePath) {
        errors.push(`"${file.name}" — возможно, это папка. Используйте кнопку "Выбрать папку".`);
        return;
      }
      
      validFiles.push({
        id: `${relativePath || file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        path: relativePath || file.name,
        size: file.size,
      });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFilesToArchive(prev => [...prev, ...validFiles]);
      setArchiveBlob(null);
      setArchiveError('');
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFilesForArchive(files);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    const items = e.dataTransfer.items;
    if (!items) return;

    const allFiles: ArchiveFile[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = (item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.();
      
      if (entry) {
        const files = await readDirectory(entry);
        allFiles.push(...files);
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          allFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            path: file.name,
            size: file.size,
          });
        }
      }
    }

    if (allFiles.length > 0) {
      setFilesToArchive(prev => [...prev, ...allFiles]);
      setArchiveBlob(null);
      setArchiveError('');
    }
  };

  const removeFileFromArchive = (id: string) => {
    setFilesToArchive(filesToArchive.filter(f => f.id !== id));
    setArchiveBlob(null);
  };

  const createArchive = async () => {
    if (filesToArchive.length === 0) {
      setArchiveError('Добавьте хотя бы один файл или папку');
      return;
    }

    setArchiving(true);
    setArchiveError('');
    
    try {
      const zip = new JSZip();
      const compression = compressionLevel === 'STORE' ? 'STORE' : 'DEFLATE';
      // ИСПРАВЛЕНИЕ: всегда число, никогда undefined
      const level: number = compression === 'DEFLATE' ? 9 : 0;

      for (const file of filesToArchive) {
        // ИСПРАВЛЕНИЕ: приводим File к Blob для совместимости с типами JSZip
        zip.file(file.path, file.file as Blob, {
          compression: compression,
          compressionOptions: {
            level: level,
          },
        });
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: compression,
        compressionOptions: {
          level: level,
        },
      });

      setArchiveBlob(blob);
    } catch (err) {
      console.error('Archive error:', err);
      setArchiveError('Ошибка при создании архива. Попробуйте другой метод сжатия.');
    } finally {
      setArchiving(false);
    }
  };

  const downloadArchive = () => {
    if (!archiveBlob) return;
    const url = URL.createObjectURL(archiveBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${archiveName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // === РАЗАРХИВАЦИЯ ===
  const handleArchiveFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Пожалуйста, выберите ZIP файл');
      return;
    }
    setArchiveFile(file);
    setExtractedFiles([]);
    setExtractError('');
  };

  const extractArchive = async () => {
    if (!archiveFile) return;

    setExtracting(true);
    setExtractError('');
    
    try {
      const arrayBuffer = await archiveFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const files: ExtractedFile[] = [];

      const promises = Object.keys(zip.files).map(async (filename) => {
        const file = zip.files[filename];
        if (!file.dir) {
          const blob = await file.async('blob');
          files.push({
            name: file.name,
            path: filename,
            size: blob.size,
            blob,
          });
        }
      });

      await Promise.all(promises);
      setExtractedFiles(files);
    } catch (err) {
      console.error('Extract error:', err);
      setExtractError('Ошибка при разархивации. Возможно, файл повреждён или использует неподдерживаемый формат.');
    } finally {
      setExtracting(false);
    }
  };

  // Скачать один файл
  const downloadExtractedFile = (file: ExtractedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = file.path.split('/').pop() || file.name;
    a.download = safeName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Скачать всё как НАСТОЯЩУЮ папку (через File System Access API)
  const downloadAsFolder = async () => {
    if (extractedFiles.length === 0) return;

    const folderName = archiveFile?.name.replace(/\.zip$/i, '') || 'extracted';

    // Проверяем поддержку File System Access API (Chrome, Edge, Opera)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        
        const targetDir = await dirHandle.getDirectoryHandle(folderName, { create: true });
        
        for (const file of extractedFiles) {
          const fileName = file.path.split('/').pop() || file.name;
          const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(file.blob);
          await writable.close();
        }
        
        alert(`✅ Файлы сохранены в папку "${folderName}"`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('File System Access API error:', err);
      }
    }

    // Фолбэк: скачиваем как ZIP (для Safari, Firefox и старых браузеров)
    const zip = new JSZip();
    
    for (const file of extractedFiles) {
      zip.file(`${folderName}/${file.path}`, file.blob);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('📁 Ваш браузер не поддерживает прямое сохранение папок. Файлы скачаны как ZIP-архив.');
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalSize = filesToArchive.reduce((sum, f) => sum + f.size, 0);

  const getFolderStructure = () => {
    const structure: Record<string, ArchiveFile[]> = {};
    filesToArchive.forEach(file => {
      const parts = file.path.split('/');
      const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(корень)';
      if (!structure[folder]) structure[folder] = [];
      structure[folder].push(file);
    });
    return structure;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Архиватор / Разархиватор</h2>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('compress')}
            className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${
              mode === 'compress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📦 Архивировать
          </button>
          <button
            onClick={() => setMode('extract')}
            className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${
              mode === 'extract'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📂 Разархивировать
          </button>
        </div>

        {mode === 'compress' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
            >
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-700 font-medium mb-3">Перетащите файлы или папки сюда</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFilesForArchive(e.target.files)}
                  className="hidden"
                  id="archive-files-input"
                />
                <label 
                  htmlFor="archive-files-input" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium"
                >
                  📄 Выбрать файлы
                </label>

                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                  id="archive-folder-input"
                />
                <label 
                  htmlFor="archive-folder-input" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-medium"
                >
                  📁 Выбрать папку
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Поддерживается перетаскивание папок целиком с сохранением структуры
              </p>
            </div>

            {filesToArchive.length > 0 && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Добавлено: {filesToArchive.length} файлов • Общий размер: {formatSize(totalSize)}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Object.entries(getFolderStructure()).map(([folder, files]) => (
                      <div key={folder} className="mb-2">
                        {folder !== '(корень)' && (
                          <p className="text-xs text-gray-500 font-mono mb-1">📁 {folder}/</p>
                        )}
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                            </div>
                            <button
                              onClick={() => removeFileFromArchive(file.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Удалить"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Имя архива</label>
                    <input
                      type="text"
                      value={archiveName}
                      onChange={(e) => setArchiveName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="archive"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Метод сжатия</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCompressionLevel('STORE')}
                        className={`flex-1 p-2 rounded border text-sm ${
                          compressionLevel === 'STORE'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        Без сжатия (быстро)
                      </button>
                      <button
                        onClick={() => setCompressionLevel('DEFLATE')}
                        className={`flex-1 p-2 rounded border text-sm ${
                          compressionLevel === 'DEFLATE'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        Максимальное сжатие
                      </button>
                    </div>
                  </div>
                </div>

                {archiveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                    {archiveError}
                  </div>
                )}

                <button
                  onClick={createArchive}
                  disabled={archiving}
                  className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                    archiving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {archiving ? '⏳ Архивация...' : `📦 Создать архив (${filesToArchive.length} файлов)`}
                </button>

                {archiveBlob && (
                  <button
                    onClick={downloadArchive}
                    className="w-full mt-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ⬇️ Скачать {archiveName}.zip ({formatSize(archiveBlob.size)})
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'extract' && (
          <div>
            {!archiveFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleArchiveFile(file);
                }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              >
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => e.target.files && handleArchiveFile(e.target.files[0])}
                  className="hidden"
                  id="extract-input"
                />
                <label htmlFor="extract-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-gray-700 font-medium">Перетащите ZIP файл сюда</p>
                  <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
                </label>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 truncate">{archiveFile.name}</p>
                      <p className="text-xs text-gray-500">{formatSize(archiveFile.size)}</p>
                    </div>
                    <button
                      onClick={() => { setArchiveFile(null); setExtractedFiles([]); }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Выбрать другой
                    </button>
                  </div>
                </div>

                {extractError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                    {extractError}
                  </div>
                )}

                <button
                  onClick={extractArchive}
                  disabled={extracting}
                  className={`w-full p-3 rounded-lg font-semibold transition-colors mb-4 ${
                    extracting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {extracting ? '⏳ Разархивация...' : ' Извлечь файлы'}
                </button>

                {extractedFiles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">
                        Извлечено файлов: {extractedFiles.length}
                      </h3>
                    </div>

                    <button
                      onClick={downloadAsFolder}
                      className="w-full mb-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                      title="Сохранить файлы в настоящую папку на компьютере"
                    >
                       Скачать всё как папку
                    </button>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {extractedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.path}</p>
                            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => downloadExtractedFile(file)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Скачать
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}