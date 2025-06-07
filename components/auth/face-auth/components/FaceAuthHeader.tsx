// components/auth/face-auth/components/FaceAuthHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone } from "lucide-react";
import { FaceAuthProps } from "../types";
import { useRouter } from "next/navigation";

export function FaceAuthHeader({ onSwitchMode }: FaceAuthProps) {
  const router = useRouter();
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Button
              className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"
              onClick={() => router.push("/")}
            >
              <Shield className="h-6 w-6 text-white" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Face Authentication
              </h1>
              <p className="text-sm text-gray-600">Powered by AI Technology</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchMode("mobile")}
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Secure
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
