import { useState } from 'react';
import PdfMerger from './PdfMerger';
import PdfSplitter from './PdfSplitter';
import PdfToImage from './PdfToImage';

type PdfTool = 'merge' | 'split' | 'toimage' | null;

export default function PdfTools() {
  const [selectedTool, setSelectedTool] = useState<PdfTool>(null);

  const tools = [
    { id: 'merge' as PdfTool, icon: '📎', title: 'Объединить PDF', desc: 'Несколько файлов в один' },
    { id: 'split' as PdfTool, icon: '✂️', title: 'Разделить PDF', desc: 'Извлечь нужные страницы' },
    { id: 'toimage' as PdfTool, icon: '🖼️', title: 'PDF → JPG', desc: 'Страницы в изображения' },
  ];

  if (selectedTool) {
    return (
      <div>
        <button 
          onClick={() => setSelectedTool(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Назад к инструментам PDF
        </button>
        {selectedTool === 'merge' && <PdfMerger />}
        {selectedTool === 'split' && <PdfSplitter />}
        {selectedTool === 'toimage' && <PdfToImage />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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