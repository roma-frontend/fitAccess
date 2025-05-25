import { CheckCircle, XCircle } from "lucide-react";

interface AccessResultProps {
  success: boolean;
}

export function AccessResult({ success }: AccessResultProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {success ? (
        <>
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-600 mb-2">Доступ разрешен</h2>
          <p className="text-center text-muted-foreground">
            Вы успешно прошли проверку. Добро пожаловать!
          </p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Доступ запрещен</h2>
          <p className="text-center text-muted-foreground">
            Ваше лицо не распознано в системе. Пожалуйста, попробуйте еще раз или обратитесь к администратору.
          </p>
        </>
      )}
    </div>
  );
}
