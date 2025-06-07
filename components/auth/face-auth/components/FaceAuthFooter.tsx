// components/auth/face-auth/components/FaceAuthFooter.tsx
"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function FaceAuthFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.6 }}
      className="mt-12 text-center"
    >
      <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Powered by Advanced AI Technology</span>
      </div>
    </motion.div>
  );
}
