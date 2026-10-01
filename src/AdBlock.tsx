import { useEffect } from 'react';

interface AdBlockProps {
  blockId?: string; // ID блока от Яндекса
  variant?: 'banner' | 'sidebar' | 'footer';
}

export default function AdBlock({ 
  blockId = 'R-A-20154437-1', // Твой ID блока
  variant = 'banner' 
}: AdBlockProps) {
  useEffect(() => {
    // @ts-ignore
    if (window.yaContextCb) {
      // @ts-ignore
      window.yaContextCb.push(() => {
        // @ts-ignore
        if (window.Ya && window.Ya.Context && window.Ya.Context.AdvManager) {
          // @ts-ignore
          window.Ya.Context.AdvManager.render({
            renderTo: `yandex_rtb_${blockId}`,
            blockId: blockId
          });
        }
      });
    }
  }, [blockId]);

  const sizeClasses = {
    banner: 'w-full min-h-[250px]',
    sidebar: 'w-full min-h-[400px]',
    footer: 'w-full min-h-[90px]'
  };

  return (
    <div className={`${sizeClasses[variant]} my-4 bg-gray-50 rounded-lg overflow-hidden`}>
      <div id={`yandex_rtb_${blockId}`}></div>
    </div>
  );
}