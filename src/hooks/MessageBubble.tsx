import { useWebhook } from "../hooks/useWebhook";

export default function MessageBubble({ url }: { url?: string }) {
  const { message, setMessage } = useWebhook(url, 20000);
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="relative rounded-2xl shadow-lg border bg-white text-slate-900 px-4 py-3">
        <button
          aria-label="close"
          className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-white text-slate-600 hover:bg-slate-50"
          onClick={() => setMessage(null)}
        >
          ×
        </button>
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{message}</div>
        <div className="absolute -bottom-2 right-6 h-0 w-0 border-t-8 border-l-8 border-t-white border-l-transparent" />
      </div>
    </div>
  );
}
