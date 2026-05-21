import React, { useRef, useState, useCallback } from 'react';
import { Upload, Camera, X, FileText, Image, File, Loader2 } from 'lucide-react';
import { uploadFileToCloudinary, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, formatFileSize, getFileIcon } from '../../lib/cloudinary';
import { Attachment } from '../../types';
import { generateId } from '../../utils/helpers';
import { cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface FileUploadProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

export function FileUpload({ attachments, onAttachmentsChange, maxFiles = 10 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => {
      if (!ALLOWED_FILE_TYPES.includes(f.type) && !f.type.startsWith('image/')) {
        toast.error(`${f.name}: Unsupported file type`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: File too large (max 25MB)`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > maxFiles) {
      toast.error(`Max ${maxFiles} files allowed`);
      return;
    }

    for (const file of validFiles) {
      const uploadId = generateId();
      setUploading(prev => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

      try {
        const result = await uploadFileToCloudinary(file, (progress) => {
          setUploading(prev =>
            prev.map(u => u.id === uploadId ? { ...u, progress: progress.percent } : u)
          );
        });

        const attachment: Attachment = {
          uploadId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          url: result.secure_url,
          publicId: result.public_id,
          createdAt: Date.now(),
        };

        onAttachmentsChange([...attachments, attachment]);
        toast.success(`${file.name} uploaded!`);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploading(prev => prev.filter(u => u.id !== uploadId));
      }
    }
  }, [attachments, onAttachmentsChange, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = '';
  };

  const removeAttachment = (uploadId: string) => {
    onAttachmentsChange(attachments.filter(a => a.uploadId !== uploadId));
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={cn('drop-zone', isDragOver && 'drag-over')}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span>{' '}
          or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPT, Images up to 25MB</p>
      </div>

      {/* Camera Button */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-sm text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <Camera size={16} />
        <span>Take a Photo</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
      />

      {/* Uploading Progress */}
      {uploading.map(u => (
        <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
          <Loader2 size={16} className="animate-spin text-indigo-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{u.name}</p>
            <div className="mt-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${u.progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-600">{u.progress}%</span>
        </div>
      ))}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(att => (
            <div key={att.uploadId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <span className="text-lg">{getFileIcon(att.fileType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{att.fileName}</p>
                <p className="text-xs text-gray-400">{formatFileSize(att.fileSize)}</p>
              </div>
              {att.fileType.startsWith('image/') && (
                <img src={att.url} alt={att.fileName} className="w-10 h-10 rounded-lg object-cover" />
              )}
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                View
              </a>
              <button
                type="button"
                onClick={() => removeAttachment(att.uploadId)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
