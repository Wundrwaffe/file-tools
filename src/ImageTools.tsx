import { useState } from 'react';
import HeicConverter from './HeicConverter';
import ImageResizer from './ImageResizer';
import ImageCropper from './ImageCropper';
import SensitiveBlur from './SensitiveBlur';

type ImageTool = 'heic' | 'resize' | 'crop' | 'blur' | null;

export default function ImageTools() {
  const [selectedTool, setSelectedTool] = useState<ImageTool>(null);

  const tools = [
    { id: 'heic' as ImageTool, icon: '📱', title: 'HEIC → JPG', desc: 'Конвертер фото с iPhone' },
    { id: 'resize' as ImageTool, icon: '📐', title: 'Изменение размера', desc: 'Resize с пресетами' },
    { id: 'crop' as ImageTool, icon: '✂️', title: 'Обрезка', desc: 'Crop с пропорциями' },
    { id: 'blur' as ImageTool, icon: '🔒', title: 'Размытие данных', desc: 'Скрыть номера, лица' },
  ];

  if (selectedTool) {
    return (
      <div>
        <button 
          onClick={() => setSelectedTool(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Назад к инструментам картинок
        </button>
        {selectedTool === 'heic' && <HeicConverter />}
        {selectedTool === 'resize' && <ImageResizer />}
        {selectedTool === 'crop' && <ImageCropper />}
        {selectedTool === 'blur' && <SensitiveBlur />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setSelectedTool(tool.id)}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-left"
        >
          <div className="text-3xl mb-2">{tool.icon}</div>
          <h3 className="font-semibold text-gray-800">{tool.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
        </button>
      ))}
    </div>
  );
}