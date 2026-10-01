import { useState } from 'react';
import md5 from 'js-md5';

interface HasherProps {
  files: File[];
}

interface HashResult {
  id: string;
  fileName: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  } | null;
  isProcessing: boolean;
  error?: string;
}

const bufferToHex = (buffer: ArrayBuffer) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export default function Hasher({ files }: HasherProps) {
  const [results, setResults] = useState<HashResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateHashes = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const initialResults: HashResult[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      hashes: null,
      isProcessing: true,
    }));
    setResults(initialResults);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();

        // @ts-ignore - js-md5 имеет кривые типы, но работает отлично
        const md5Hash = md5(arrayBuffer);

        const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
        const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const sha512Buffer = await crypto.subtle.digest('SHA-512', arrayBuffer);

        const hashes = {
          md5: md5Hash,
          sha1: bufferToHex(sha1Buffer),
          sha256: bufferToHex(sha256Buffer),
          sha512: bufferToHex(sha512Buffer),
        };

        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, isProcessing: false, hashes } : r
        ));
      } catch (error) {
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, isProcessing: false, error: 'Ошибка чтения файла' } : r
        ));
      }
    }
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-center">
        <button
          onClick={calculateHashes}
          disabled={isProcessing}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isProcessing ? '⏳ Вычисление...' : '#️⃣ Рассчитать хеши'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Результаты хеширования
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((item) => (
              <div key={item.id} className="p-4">
                <p className="font-medium text-gray-800 mb-3 truncate">{item.fileName}</p>
                
                {item.error ? (
                  <p className="text-red-500 text-sm">⚠️ {item.error}</p>
                ) : item.isProcessing ? (
                  <p className="text-blue-600 text-sm animate-pulse">Обработка...</p>
                ) : item.hashes ? (
                  <div className="space-y-2">
                    {Object.entries(item.hashes).map(([algo, hash]) => (
                      <div key={algo} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs font-bold text-gray-500 uppercase w-12 flex-shrink-0">
                          {algo}
                        </span>
                        <code className="text-xs text-gray-700 break-all flex-1 font-mono">
                          {hash}
                        </code>
                        <button
                          onClick={() => copyToClipboard(hash)}
                          className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          title="Копировать"
                        >
                          📋
                        </button>
      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}