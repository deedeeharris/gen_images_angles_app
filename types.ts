export interface UploadedImage {
  dataUrl: string;
  file: File;
}

export interface CameraAngle {
  name: string;
  description: string;
  promptHint: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  angle: CameraAngle;
  isUpscaling?: boolean;
  isRemovingBackground?: boolean;
  originalSrc?: string; // To store the pre-upscale image for comparison
}