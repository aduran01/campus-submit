import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { FILE_UPLOAD_CONFIG } from '../../config/appConfig'
import { formatFileSize, validateFile } from '../../utils/fileUtils'
import styles from './FileDropzone.module.css'

interface FileDropzoneProps {
  selectedFile: File | null
  onFileSelected: (file: File) => void
  onFileRemoved: () => void
  error: string | null
  disabled?: boolean
}

export function FileDropzone({ selectedFile, onFileSelected, onFileRemoved, error, disabled = false }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  function handleFiles(files: FileList | null) {
    if (disabled) return
    const file = files?.[0]
    if (!file) return
    const result = validateFile(file)
    if (!result.valid) {
      // Still surface the file so the caller can show a validation error next to it.
      onFileSelected(file)
      return
    }
    onFileSelected(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleRemove() {
    onFileRemoved()
    if (inputRef.current) inputRef.current.value = ''
  }

  if (selectedFile) {
    return (
      <div className={`${styles.selectedFile} ${error ? styles.selectedFileError : ''}`}>
        <div className={styles.fileIcon} aria-hidden="true">
          📄
        </div>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{selectedFile.name}</span>
          <span className={styles.fileMeta}>
            {selectedFile.type || 'Unknown type'} • {formatFileSize(selectedFile.size)}
          </span>
          {error && <span className={styles.fileError}>{error}</span>}
        </div>
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove selected file"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div
      className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${disabled ? styles.disabled : ''}`}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Attach a file"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openPicker()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        accept={FILE_UPLOAD_CONFIG.allowedExtensions.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
        tabIndex={-1}
      />
      <div className={styles.uploadIcon} aria-hidden="true">
        ⬆
      </div>
      <p className={styles.dropzoneTitle}>Click to attach a file, or drag it here</p>
      <p className={styles.dropzoneHint}>
        Accepted: {FILE_UPLOAD_CONFIG.allowedExtensions.join(', ')} — up to {formatFileSize(FILE_UPLOAD_CONFIG.maxSizeBytes)}
      </p>
    </div>
  )
}
