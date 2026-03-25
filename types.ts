export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface QueueItem {
  id: string;
  fileName: string;
  themeContent: string;
  status: ProcessingStatus;
  currentPart: number;
  totalParts: number;
  generatedParts: string[];
  errorMessage?: string;
}

export interface GenerationProgress {
  itemId: string;
  part: number;
}
