
interface PartnerCardProps {
  name: string;
  description: string;
  url: string;
  icon: string;
}

export default function PartnerCard({ name, description, url, icon }: PartnerCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <span className="text-xs text-blue-600 mt-2 inline-block">Перейти →</span>
        </div>
      </div>
    </a>
  );
}