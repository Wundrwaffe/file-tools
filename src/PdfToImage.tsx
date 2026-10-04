import { useState } from 'react';

interface PageImage {
  pageNumber: number;
  url: string;
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PageImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState(85);

  const handleFile = async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('Пожалуйста, выберите PDF файл');
      return;
    }

    setFile(f);
    setImages([]);
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs';

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const pageImages: PageImage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // 2x для качества
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const url = canvas.toDataURL('image/jpeg', quality / 100);
        pageImages.push({ pageNumber: i, url });
      }

      setImages(pageImages);
    } catch (err) {
      alert('Ошибка конвертации PDF. Попробуйте другой файл.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = (img: PageImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `page_${img.pageNumber}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.url;
        a.download = `page_${img.pageNumber}.jpg`;
        a.click();
      }, index * 300);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🖼️ PDF → JPG</h2>
        <p className="text-gray-600 mb-4">
          Конвертируйте страницы PDF в изображения JPG.
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
              id="toimage-input"
            />
            <label htmlFor="toimage-input" className="cursor-pointer">
              <div className="text-4xl mb-2">🖼️</div>
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
                  {images.length} стр. • Качество: {quality}%
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setImages([]); }}
                className="text-red-600 hover:underline text-sm"
              >
                Выбрать другой
              </button>
            </div>

            <div className="mb-4">
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Качество JPG</span>
                <span className="font-mono">{quality}%</span>
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {images.length > 0 && (
              <button
                onClick={downloadAll}
                className="w-full mb-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                ⬇️ Скачать все страницы ({images.length})
              </button>
            )}
          </>
        )}
      </div>

      {processing && (
        <div className="text-center py-8 text-gray-600">
          <div className="text-4xl mb-2">⏳</div>
          <p>Конвертация страниц...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img) => (
            <div key={img.pageNumber} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img src={img.url} alt={`Страница ${img.pageNumber}`} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Страница {img.pageNumber}</span>
                <button
                  onClick={() => downloadImage(img)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Скачать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}