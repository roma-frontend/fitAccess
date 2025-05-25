import * as faceapi from "@vladmandic/face-api";

export async function loadModels() {
  const MODEL_URL = '/models';
  
  await Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
  ]);
}

export async function getFaceDescriptor(imageElement: HTMLImageElement) {
  const detections = await faceapi.detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detections) {
    throw new Error("Лицо не обнаружено");
  }
  
  return detections.descriptor;
}

export function compareFaces(descriptor1: Float32Array, descriptor2: Float32Array, threshold = 0.6) {
  return faceapi.euclideanDistance(descriptor1, descriptor2) <= threshold;
}
