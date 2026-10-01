
interface AdBlockProps {
  title?: string;
  description?: string;
  variant?: 'banner' | 'sidebar' | 'footer';
}

export default function AdBlock({ 
  title = 'Рекламное место', 
  description = 'Здесь может быть ваша реклама',
  variant = 'banner' 
}: AdBlockProps) {
  const sizeClasses = {
    banner: 'w-full h-32',
    sidebar: 'w-full h-64',
    footer: 'w-full h-24'
  };

  return (
    <div className={`${sizeClasses[variant]} bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center my-4`}>
      <div className="text-center">
        <p className="text-gray-500 font-semibold">{title}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}