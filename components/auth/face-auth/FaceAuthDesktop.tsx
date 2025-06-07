// components/auth/face-auth/FaceAuthDesktop.tsx
"use client";

import { motion } from "framer-motion";
import { FaceAuthHeader } from "./components/FaceAuthHeader";
import { FaceAuthHero } from "./components/FaceAuthHero";
import { FaceAuthModeSwitch } from "./components/FaceAuthModeSwitch";
import { FaceAuthStatus } from "./components/FaceAuthStatus";
import { FaceAuthScanner } from "./components/FaceAuthScanner";
import { FaceAuthActions } from "./components/FaceAuthActions";
import { FaceAuthSidebar } from "./components/FaceAuthSidebar";
import { FaceAuthStats } from "./components/FaceAuthStats";
import { FaceAuthFooter } from "./components/FaceAuthFooter";
import { FaceAuthBackground } from "./components/FaceAuthBackground";
import type { FaceAuthProps } from "./types";

export function FaceAuthDesktop(props: FaceAuthProps) {
  const { mode, authStatus } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FaceAuthBackground />
      <FaceAuthHeader {...props} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FaceAuthHero mode={mode} />
            
            {!authStatus?.authenticated && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <FaceAuthModeSwitch {...props} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <FaceAuthStatus {...props} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <FaceAuthScanner {...props} />
            </motion.div>

            {mode === 'register' && authStatus?.authenticated && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <FaceAuthActions {...props} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FaceAuthSidebar {...props} />
          </div>
        </div>

        <FaceAuthStats />
        <FaceAuthFooter />
      </div>
    </div>
  );
}
