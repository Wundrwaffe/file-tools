import { useEffect } from 'react';

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    // Меняем title вкладки
    document.title = title;
    
    // Меняем мета-тег description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}