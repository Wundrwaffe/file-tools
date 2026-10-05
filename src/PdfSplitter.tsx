import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PageThumbnail {
  pageNumber: number;
  url: string;
}

export default function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [renderingThumbnails, setRenderingThumbnails] = useState(false);
  const [previewPage, setPreviewPage] = useState<PageThumbnail | null>(null);

  const handleFile = async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('Пожалуйста, выберите PDF файл');
      return;
    }

    setFile(f);
    setResultBlob(null);
    setSelectedPages([]);
    setThumbnails([]);
    setPreviewPage(null);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);
      setSelectedPages(Array.from({ length: count }, (_, i) => i + 1));

      await renderThumbnails(arrayBuffer, count);
    } catch {
      alert('Ошибка чтения PDF');
    }
  };

  const renderThumbnails = async (arrayBuffer: ArrayBuffer, count: number) => {
    setRenderingThumbnails(true);
    try {
      // @ts-ignore
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs';

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const thumbs: PageThumbnail[] = [];

      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        thumbs.push({ pageNumber: i, url: canvas.toDataURL('image/jpeg', 0.8) });
      }
      setThumbnails(thumbs);
    } catch (err) {
      console.error('Thumbnail rendering error:', err);
    } finally {
      setRenderingThumbnails(false);
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
    setResultBlob(null);
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    setResultBlob(null);
  };

  const selectNone = () => {
    setSelectedPages([]);
    setResultBlob(null);
  };

  const selectRange = () => {
    const from = prompt('Начальная страница:', '1');
    const to = prompt('Конечная страница:', String(pageCount));
    if (from && to) {
      const start = parseInt(from);
      const end = parseInt(to);
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= pageCount && start <= end) {
        setSelectedPages(Array.from({ length: end - start + 1 }, (_, i) => start + i));
        setResultBlob(null);
      } else {
        alert('Некорректный диапазон');
      }
    }
  };

  const splitPdf = async () => {
    if (!file || selectedPages.length === 0) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const indices = selectedPages.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch {
      alert('Ошибка при разделении PDF');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_pages.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✂️ Разделение PDF</h2>
        <p className="text-gray-600 mb-4">
          Выберите нужные страницы из PDF и сохраните их в отдельный файл.
        </p>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              className="hidden"
              id="split-input"
            />
            <label htmlFor="split-input" className="cursor-pointer">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-700 font-medium">Перетащите PDF файл сюда</p>
              <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatSize(file.size)} • {pageCount} стр.
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setPageCount(0); setThumbnails([]); setResultBlob(null); setPreviewPage(null); }}
                className="text-red-600 hover:underline text-sm"
              >
                Выбрать другой
              </button>
            </div>

            {/* Кнопки быстрого выбора */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={selectAll} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Выбрать все
              </button>
              <button onClick={selectNone} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Снять все
              </button>
              <button onClick={selectRange} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Выбрать диапазон
              </button>
              <button
                onClick={() => {
                  setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1).filter(p => p % 2 === 0));
                  setResultBlob(null);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Только чётные
              </button>
              <button
                onClick={() => {
                  setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1).filter(p => p % 2 !== 0));
                  setResultBlob(null);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Только нечётные
              </button>
            </div>

            {/* Миниатюры страниц */}
            {renderingThumbnails && (
              <div className="text-center py-8 text-gray-600">
                <div className="text-2xl mb-2">⏳</div>
                <p>Загрузка миниатюр страниц...</p>
              </div>
            )}

            {!renderingThumbnails && thumbnails.length > 0 && (
              <>
                <div className="mb-3 text-sm text-gray-600">
                  <strong>Кликните на страницу</strong> для выбора/снятия. <strong>Двойной клик</strong> — просмотр в полном размере.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                  {thumbnails.map((thumb) => {
                    const isSelected = selectedPages.includes(thumb.pageNumber);
                    return (
                      <button
                        key={thumb.pageNumber}
                        onClick={() => togglePage(thumb.pageNumber)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setPreviewPage(thumb);
                        }}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg ${
                          isSelected
                            ? 'border-blue-600 shadow-md ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={thumb.url}
                          alt={`Страница ${thumb.pageNumber}`}
                          className="w-full h-auto"
                        />
                        <div className={`absolute top-1 left-1 px-2 py-0.5 rounded text-xs font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                        }`}>
                          {thumb.pageNumber}
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg">
                              ✓
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Fallback: если миниатюры не загрузились */}
            {!renderingThumbnails && thumbnails.length === 0 && pageCount > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Миниатюры недоступны. Выберите страницы кнопками:</p>
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => togglePage(pageNum)}
                      className={`p-3 rounded-lg font-mono text-sm transition-colors ${
                        selectedPages.includes(pageNum)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Счётчик выбранных страниц */}
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Выбрано страниц: <strong className="text-blue-600">{selectedPages.length}</strong> из {pageCount}
              </p>
              <p className="text-sm text-gray-500">
                {selectedPages.length === pageCount ? '✓ Все страницы' : `${pageCount - selectedPages.length} стр. будет удалено`}
              </p>
            </div>

            <button
              onClick={splitPdf}
              disabled={processing || selectedPages.length === 0}
              className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                processing || selectedPages.length === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {processing ? '⏳ Обработка...' : `✂️ Извлечь ${selectedPages.length} стр.`}
            </button>

            {resultBlob && (
              <button
                onClick={downloadResult}
                className="w-full mt-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                ⬇️ Скачать ({formatSize(resultBlob.size)})
              </button>
            )}
          </>
        )}
      </div>

      {/* Модальное окно предпросмотра страницы */}
      {previewPage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewPage(null)}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Страница {previewPage.pageNumber} из {pageCount}
              </h3>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewPage.url}
                alt={`Страница ${previewPage.pageNumber}`}
                className="w-full h-auto"
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2">
              <button
                onClick={() => {
                  togglePage(previewPage.pageNumber);
                  setPreviewPage(null);
                }}
                className={`flex-1 p-2 rounded-lg font-medium transition-colors ${
                  selectedPages.includes(previewPage.pageNumber)
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedPages.includes(previewPage.pageNumber) ? '✕ Исключить страницу' : '✓ Выбрать страницу'}
              </button>
              <button
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}