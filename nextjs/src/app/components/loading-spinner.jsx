import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 text-xl">
          Processing your resume...
        </span>
      </div>
      <span className="text-gray-500 text-sm mt-2">
        This may take 10-20 seconds
      </span>
    </div>
  );
}
