// components/group-classes/LoadingSpinner.tsx
export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Загрузка расписания...</p>
      </div>
    </div>
  );
};
