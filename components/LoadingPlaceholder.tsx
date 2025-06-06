// components/LoadingPlaceholder.tsx
interface LoadingPlaceholderProps {
  className?: string;
  height?: string;
}

export function LoadingPlaceholder({ 
  className = "", 
  height = "h-96" 
}: LoadingPlaceholderProps) {
  return (
    <div className={`${height} ${className} bg-gray-200 rounded-3xl animate-pulse`}>
      <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-3xl" />
    </div>
  );
}
