import { useState } from 'react';

interface EncryptorProps {
  files: File[];
}

interface EncryptResult {
  id: string;
  fileName: string;
  htmlBlob?: Blob;
  error?: string;
  isProcessing: boolean;
}

// Вспомогательные функции для конвертации (без внешних библиотек)
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};


// Шаблон саморасшифровывающегося HTML
const getDecryptHtml = (encryptedBase64: string, saltBase64: string, ivBase64: string, originalName: string) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Расшифровка файла: ${originalName}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
    input { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; margin: 10px 0; box-sizing: border-box; }
    button { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; }
    button:hover { background: #1d4ed8; }
    #status { margin-top: 15px; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 Зашифрованный файл</h2>
    <p>Введите пароль для расшифровки <strong>${originalName}</strong></p>
    <input type="password" id="pwd" placeholder="Пароль">
    <button onclick="decryptFile()">Расшифровать и скачать</button>
    <div id="status"></div>
  </div>
  <script>
    const encData = "${encryptedBase64}";
    const saltData = "${saltBase64}";
    const ivData = "${ivBase64}";
    const fileName = "${originalName}";

    async function decryptFile() {
      const pwd = document.getElementById('pwd').value;
      const status = document.getElementById('status');
      if (!pwd) { status.innerText = 'Введите пароль!'; return; }
      
      status.innerText = 'Расшифровка...';
      try {
        const encBuf = base64ToBuf(encData);
        const saltBuf = base64ToBuf(saltData);
        const ivBuf = base64ToBuf(ivData);

        const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(pwd), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: saltBuf, iterations: 100000, hash: "SHA-256" },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );

        const decryptedBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, key, encBuf);
        
        const blob = new Blob([decryptedBuf]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        status.innerText = 'Успешно! Файл скачан.';
      } catch (e) {
        status.innerText = 'Ошибка: неверный пароль или поврежденный файл.';
      }
    }

    function base64ToBuf(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes.buffer;
    }
  </script>
</body>
</html>`;

export default function Encryptor({ files }: EncryptorProps) {
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<EncryptResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!password) {
      alert('Пожалуйста, введите пароль!');
      return;
    }
    if (files.length === 0) return;

    setIsProcessing(true);
    const initialResults: EncryptResult[] = files.map(f => ({
      id: Math.random().toString(36).substring(7),
      fileName: f.name,
      isProcessing: true,
    }));
    setResults(initialResults);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileBuffer = await file.arrayBuffer();
        
        // Генерация соли и вектора инициализации (IV)
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Получение ключа из пароля
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveKey"]
        );
        const key = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt"]
        );

        // Шифрование
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          fileBuffer
        );

        // Создание HTML
        const htmlContent = getDecryptHtml(
          arrayBufferToBase64(encryptedBuffer),
          arrayBufferToBase64(salt.buffer),
          arrayBufferToBase64(iv.buffer),
          file.name
        );

        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, isProcessing: false, htmlBlob } : r
        ));
      } catch (error) {
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, isProcessing: false, error: 'Ошибка шифрования' } : r
        ));
      }
    }
    setIsProcessing(false);
  };

  const downloadHtml = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.encrypted.html`;
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
      {/* Панель пароля */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Придумайте надежный пароль (запомните его, восстановить нельзя!)
        </label>
        <div className="flex gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleEncrypt}
            disabled={isProcessing || !password}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isProcessing || !password
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing ? '⏳ Шифрование...' : '🔒 Зашифровать'}
          </button>
        </div>
      </div>

      {/* Результаты */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Результаты шифрования
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.fileName}</p>
                  {item.error && <p className="text-red-500 text-sm mt-1">️ {item.error}</p>}
                  {item.isProcessing && <p className="text-blue-600 text-sm mt-1 animate-pulse">Шифрование...</p>}
                </div>
                {item.htmlBlob && (
                  <button
                    onClick={() => downloadHtml(item.htmlBlob!, item.fileName)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <span>️</span> Скачать HTML
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}