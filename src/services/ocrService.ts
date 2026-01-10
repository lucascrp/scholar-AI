import Tesseract from 'tesseract.js';

// Cache del worker per riutilizzo
let worker: Tesseract.Worker | null = null;

/**
 * Inizializza il worker Tesseract
 */
async function getWorker(): Promise<Tesseract.Worker> {
  if (!worker) {
    worker = await Tesseract.createWorker('ita+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
  }
  return worker;
}

/**
 * Estrae il testo da un'immagine usando OCR
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const tesseractWorker = await getWorker();
  
  // Crea URL temporaneo per l'immagine
  const imageUrl = URL.createObjectURL(file);
  
  try {
    const result = await tesseractWorker.recognize(imageUrl, {
      // @ts-expect-error - logger non è nel tipo ma funziona
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });
    
    return result.data.text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * Verifica se un file è un'immagine supportata
 */
export function isImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
  return supportedTypes.includes(file.type);
}

/**
 * Verifica se un file è un PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Termina il worker (chiamare quando l'app si chiude)
 */
export async function terminateOCRWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
