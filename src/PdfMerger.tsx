import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const handleFiles = async (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      alert('Пожалуйста, выберите PDF файлы');
      return;
    }

    const newPdfFiles: PdfFile[] = await Promise.all(
      pdfFiles.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          return {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            pageCount: pdf.getPageCount(),
          };
        } catch {
          return {
            id: `${file.name}-${Date.now()}`,
            file,
            name: file.name,
            size: file.size,
            pageCount: null,
          };
        }
      })
    );

    setFiles([...files, ...newPdfFiles]);
    setMergedBlob(null);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setMergedBlob(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
    setMergedBlob(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      alert('Нужно минимум 2 файла для объединения');
      return;
    }

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      // ИСПРАВЛЕНИЕ: добавлено .buffer для совместимости с Blob
      const blob = new Blob([mergedBytes.buffer], { type: 'application/pdf' });
      setMergedBlob(blob);
    } catch (err) {
      alert('Ошибка при объединении PDF');
    } finally {
      setProcessing(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📎 Объединение PDF файлов</h2>
        <p className="text-gray-600 mb-4">
          Объедините несколько PDF в один файл. Всё работает локально в браузере.
        </p>

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
            accept=".pdf"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            id="merge-input"
          />
          <label htmlFor="merge-input" className="cursor-pointer">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-700 font-medium">Перетащите PDF файлы сюда</p>
            <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
          </label>
        </div>
      </div>

      {/* Список файлов */}
      {files.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Файлы ({files.length}) — перемещайте для изменения порядка
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-400 font-mono w-6">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatSize(file.size)} • {file.pageCount !== null ? `${file.pageCount} стр.` : 'неизвестно'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
                    title="Вверх"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
                    title="Вниз"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={mergePdfs}
            disabled={processing || files.length < 2}
            className={`w-full mt-4 p-3 rounded-lg font-semibold transition-colors ${
              processing || files.length < 2
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {processing ? '⏳ Объединение...' : `🔗 Объединить ${files.length} файлов`}
          </button>

          {mergedBlob && (
            <button
              onClick={downloadMerged}
              className="w-full mt-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              ⬇️ Скачать объединённый PDF ({formatSize(mergedBlob.size)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}