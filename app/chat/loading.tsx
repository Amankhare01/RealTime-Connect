import { Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-text-primary p-4">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        {/* Branded mark matching Task 1 */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/25 border border-white/10">
          C
        </div>
        <div className="flex items-center gap-2.5 text-text-secondary text-sm font-medium">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span>Loading Connect...</span>
        </div>
      </div>
    </div>
  );
}
