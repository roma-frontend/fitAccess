"use client";

import { useCallback, useRef } from "react";
import { useQuery } from "convex/react"; // Важно: импорт из convex/react
import { api } from "@/convex/_generated/api";

interface FaceDescriptor {
  id: string;
  name: string;
  faceDescriptor: number[];
}

interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  faceapi: any;
  isScanning: boolean;
  onMatch: (user: FaceDescriptor) => void;
}

export function useFaceDetection({
  videoRef,
  canvasRef,
  faceapi,
  isScanning,
  onMatch
}: UseFaceDetectionProps) {
  const animationFrameRef = useRef<number | null>(null);
  const faceDescriptors = useQuery(api.users.getAllFaceDescriptors) || [];

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        const labeledDescriptors = faceDescriptors
          .filter((descriptor: FaceDescriptor) =>
            descriptor.faceDescriptor && descriptor.faceDescriptor.length > 0
          )
          .map((descriptor: FaceDescriptor) =>
            new faceapi.LabeledFaceDescriptors(descriptor.name, [
              new Float32Array(descriptor.faceDescriptor),
            ])
          );

        if (labeledDescriptors.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
          const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
          if (bestMatch.label !== "unknown") {
            const matchedUser = faceDescriptors.find(
              (descriptor: FaceDescriptor) => descriptor.name === bestMatch.label
            );
            if (matchedUser) {
              onMatch(matchedUser);
              return;
            }
          }
        }
      }

      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
    } catch (error) {
      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
    }
  }, [isScanning, faceapi, faceDescriptors, onMatch, videoRef, canvasRef]);

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  return {
    detectFace,
    stopDetection
  };
}
