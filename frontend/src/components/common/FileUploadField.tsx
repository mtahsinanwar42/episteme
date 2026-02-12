import { useId } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { fileService } from '@/services/fileService';

interface UploadedFileInfo {
  name: string;
  size: number;
  storageKey: string;
}

interface FileUploadFieldProps {
  label: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  helperText?: string;
  uploadedFile?: UploadedFileInfo | null;
  maxNameLength?: number;
}

export function FileUploadField({
  label,
  selectedFile,
  onFileSelect,
  disabled,
  accept,
  helperText = 'Any file type is supported',
  uploadedFile,
  maxNameLength = 40,
}: FileUploadFieldProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  const handleDownload = async (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadedFile?.storageKey) return;
    await fileService.downloadFile(uploadedFile.storageKey);
  };

  return (
    <div className="flex flex-col space-y-3 max-w-lg">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="file"
          onChange={handleChange}
          disabled={disabled}
          accept={accept}
          className="cursor-pointer hidden"
        />
        <label
          htmlFor={inputId}
          className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg transition-colors ${
            selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-border bg-slate-900 hover:border-slate-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-6 h-6 text-foreground/80" />
            <div className="text-sm text-foreground/80">
              {selectedFile ? (
                <div className="flex flex-col items-center space-y-1">
                  <FileText className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-600 max-w-[280px] truncate" title={selectedFile.name}>
                    {selectedFile.name.length > maxNameLength
                      ? `${selectedFile.name.slice(0, maxNameLength)}...`
                      : selectedFile.name}
                  </p>
                  <p className="text-xs text-foreground/80">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-medium">
                    Click to select or drag and drop
                  </p>
                  <p className="text-xs text-foreground/60">{helperText}</p>
                </>
              )}
            </div>
          </div>
        </label>
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <FileText className="w-4 h-4" />
          <span className="font-medium" title={uploadedFile.name}>
            {uploadedFile.name.length > maxNameLength
              ? `${uploadedFile.name.slice(0, maxNameLength)}...`
              : uploadedFile.name}
          </span>
          {uploadedFile.size > 0 && (
            <span className="text-xs">
              ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          )}
          <Download
            className="ml-2 h-4 w-4 cursor-pointer text-accent hover:text-accent-foreground"
            onClick={handleDownload}
          />
        </div>
      )}
    </div>
  );
}
