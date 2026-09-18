import { FILE_UPLOAD_CONFIG } from '../config/appConfig'

/** Formats a byte count for display, e.g. "482 KB" or "3.1 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Returns the lowercased extension of a filename, including the leading dot (e.g. ".pdf"), or "" if none. */
export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx === -1 ? '' : fileName.slice(idx).toLowerCase()
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates a selected `File` against the centralized upload rules in
 * `appConfig.ts`. Pure front-end validation — nothing here inspects file
 * contents, since the file is never actually read or transmitted.
 */
export function validateFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: 'The selected file appears to be empty. Please choose a different file.' }
  }

  const ext = getFileExtension(file.name)
  if (!ext || !FILE_UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file type "${ext || 'unknown'}". Allowed types: ${FILE_UPLOAD_CONFIG.allowedExtensions.join(', ')}.`,
    }
  }

  if (file.size > FILE_UPLOAD_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${formatFileSize(
        FILE_UPLOAD_CONFIG.maxSizeBytes,
      )}.`,
    }
  }

  return { valid: true }
}
