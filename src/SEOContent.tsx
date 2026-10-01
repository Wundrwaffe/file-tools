
export default function SEOContent() {
  return (
    <section className="max-w-4xl mx-auto mt-16 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Бесплатные инструменты для работы с файлами
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold mb-3">🗜️ Сжатие изображений</h3>
          <p className="mb-4">
            Уменьшите размер JPG, PNG и WebP файлов без потери качества. 
            Идеально для загрузки на сайты, отправки по почте и экономии места на диске. 
            Поддержка пакетной обработки нескольких файлов одновременно.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">🧹 Удаление метаданных EXIF</h3>
          <p className="mb-4">
            Очистите фотографии от скрытых данных: GPS-координаты, модель камеры, 
            дата съёмки и другая приватная информация. Защитите свою приватность 
            перед публикацией фото в интернете.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3">🔒 Шифрование файлов паролем</h3>
          <p className="mb-4">
            Зашифруйте любой файл надёжным алгоритмом AES-256. 
            Создайте саморасшифровывающийся HTML-файл, который можно открыть 
            на любом устройстве без установки программ.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">#️⃣ Генератор хешей</h3>
          <p className="mb-4">
            Вычислите контрольные суммы MD5, SHA-1, SHA-256 и SHA-512 для проверки 
            целостности файлов. Сравните хеши скачанных файлов с оригиналом, 
            убедитесь в отсутствии повреждений.
          </p>
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-900 mb-3">
          🔒 Полная приватность и безопасность
        </h3>
        <p className="text-blue-800">
          Все операции выполняются <strong>локально в вашем браузере</strong>. 
          Файлы никогда не загружаются на сервер. Мы не видим, не сохраняем 
          и не передаём ваши данные третьим лицам. Идеально для работы 
          с конфиденциальными документами.
        </p>
      </div>
    </section>
  );
}