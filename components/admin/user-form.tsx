"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface UserFormProps {
  onSuccess?: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const createUser = useMutation(api.users.create);
  const createAdmin = useMutation(api.users.createAdmin);
  
  // Состояние формы
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  

  // Загрузка моделей при монтировании компонента
  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        toast({
          title: "Модели загружены",
          description: "Система распознавания лиц готова к работе",
        });
      } catch (error) {
        console.error("Ошибка загрузки моделей:", error);
        toast({
          variant: "destructive",
          title: "Ошибка загрузки моделей",
          description: "Не удалось загрузить модели распознавания лиц",
        });
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, [toast]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  // Валидация формы
  const validateForm = () => {
    let isValid = true;
    
    // Проверка имени
    if (name.trim().length < 2) {
      setNameError("Имя должно содержать минимум 2 символа");
      isValid = false;
    } else {
      setNameError("");
    }
    
    // Проверка email
    if (email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    return isValid;
  };

  // Обработчик отправки формы
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!preview || !imageRef.current) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Загрузите фотографию пользователя",
      });
      return;
    }

    if (!modelsLoaded) {
      toast({
        variant: "destructive",
        title: "Модели не загружены",
        description: "Дождитесь загрузки моделей распознавания лиц",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Получаем дескриптор лица
      const detections = await faceapi.detectSingleFace(imageRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast({
          variant: "destructive",
          title: "Лицо не обнаружено",
          description: "Пожалуйста, загрузите другое фото",
        });
        setIsProcessing(false);
        return;
      }

      // Сохраняем фото на сервере
      const formData = new FormData();
      const blob = await fetch(preview).then(r => r.blob());
      formData.append('photo', blob);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const { url } = await uploadResponse.json();

      // Создаем пользователя или администратора в зависимости от выбранной роли
      if (isAdmin) {
        await createAdmin({
          name,
          email: email || undefined,
          photoUrl: url,
          faceDescriptor: Array.from(detections.descriptor),
        });
      } else {
        await createUser({
          name,
          email: email || undefined,
          photoUrl: url,
          faceDescriptor: Array.from(detections.descriptor),
        });
      }

      toast({
        title: "Пользователь создан",
        description: "Пользователь успешно добавлен в систему",
      });

      // Сбрасываем форму
      setName("");
      setEmail("");
      setIsAdmin(false);
      setPreview(null);
      
      // Вызываем колбэк успешного создания, если он предоставлен
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать пользователя",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {isLoadingModels && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-4">
          <p className="font-medium">Загрузка моделей распознавания...</p>
          <p className="text-sm">Пожалуйста, подождите. Это может занять несколько секунд.</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Имя пользователя</Label>
        <Input 
          id="name" 
          placeholder="Иван Иванов" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={nameError ? "border-red-500" : ""}
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email (необязательно)</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="user@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        <p className="text-sm text-muted-foreground">
          Email используется для входа в панель администратора
        </p>
      </div>
      
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isAdmin" className="text-base">Администратор</Label>
          <p className="text-sm text-muted-foreground">
            Администраторы имеют доступ к панели управления
          </p>
        </div>
        <Switch
          id="isAdmin"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
      </div>
      
      <div>
        <Label>Фотография</Label>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mt-2
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative">
              <img 
                ref={imageRef}
                src={preview} 
                alt="Предпросмотр" 
                className="mx-auto max-h-64 rounded-md" 
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="py-8">
              <p className="text-muted-foreground">
                {isDragActive 
                  ? "Перетащите фото сюда..." 
                  : "Перетащите фото или нажмите для выбора"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isProcessing || isLoadingModels || !modelsLoaded}
      >
        {isProcessing 
          ? "Создание..." 
          : isLoadingModels 
            ? "Загрузка моделей..." 
            : "Создать пользователя"}
      </Button>
    </form>
  );
}
