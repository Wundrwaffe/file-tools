import { useState, useEffect } from 'react';

interface CroppedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  croppedUrl: string | null;
  croppedBlob: Blob | null;
  processing: boolean;
  error: string | null;
}

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '9:16';

export default function ImageCropper() {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<CroppedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Пожалуйста, выберите изображения');
      return;
    }

    setFiles(imageFiles);
    const newImages: CroppedImage[] = imageFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      croppedUrl: null,
      croppedBlob: null,
      processing: false,
      error: null,
    }));
    setImages(newImages);
  };

  // Автоматическая обрезка при изменении пропорций
  useEffect(() => {
    if (images.length === 0 || aspectRatio === 'free') return;

    const cropAll = async () => {
      const updated = await Promise.all(
        images.map(async (img) => {
          try {
            img.processing = true;
            const blob = await cropImage(img.originalFile, aspectRatio);
            const url = URL.createObjectURL(blob);
            return {
              ...img,
              croppedUrl: url,
              croppedBlob: blob,
              processing: false,
              error: null,
            };
          } catch (err) {
            return {
              ...img,
              processing: false,
              error: 'Ошибка обрезки',
            };
          }
        })
      );
      setImages(updated);
    };

    cropAll();
  }, [aspectRatio]);

  const cropImage = (file: File, ratio: AspectRatio): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let cropWidth = img.width;
        let cropHeight = img.height;

        if (ratio === '1:1') {
          const size = Math.min(img.width, img.height);
          cropWidth = size;
          cropHeight = size;
        } else if (ratio === '4:3') {
          cropHeight = Math.min(img.height, (img.width * 3) / 4);
          cropWidth = (cropHeight * 4) / 3;
        } else if (ratio === '16:9') {
          cropHeight = Math.min(img.height, (img.width * 9) / 16);
          cropWidth = (cropHeight * 16) / 9;
        } else if (ratio === '9:16') {
          cropWidth = Math.min(img.width, (img.height * 9) / 16);
          cropHeight = (cropWidth * 16) / 9;
        }

        const startX = (img.width - cropWidth) / 2;
        const startY = (img.height - cropHeight) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Crop failed'));
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadFile = (img: CroppedImage) => {
    if (!img.croppedBlob) return;
    const name = img.originalFile.name.replace(/\.[^.]+$/, '') + '_cropped.jpg';
    const url = URL.createObjectURL(img.croppedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✂️ Обрезка изображений</h2>
        <p className="text-gray-600 mb-4">
          Автоматическая обрезка по центру с заданными пропорциями.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            id="crop-input"
          />
          <label htmlFor="crop-input" className="cursor-pointer">
            <div className="text-4xl mb-2">✂️</div>
            <p className="text-gray-700 font-medium">Перетащите изображения сюда</p>
            <p className="text-sm text-gray-500 mt-1">или нажмите для выбора</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Пропорции обрезки:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'free', label: 'Без изменений' },
                { id: '1:1', label: '1:1 (Квадрат)' },
                { id: '4:3', label: '4:3 (Стандарт)' },
                { id: '16:9', label: '16:9 (Широкий)' },
                { id: '9:16', label: '9:16 (Stories)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAspectRatio(opt.id as AspectRatio)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    aspectRatio === opt.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={img.croppedUrl || img.originalUrl}
                    alt={img.originalFile.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">{img.originalFile.name}</h4>
                  {img.error && <p className="text-red-500 text-sm mt-2">{img.error}</p>}
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => downloadFile(img)}
                    disabled={!img.croppedBlob || aspectRatio === 'free'}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      img.croppedBlob && aspectRatio !== 'free'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Скачать
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