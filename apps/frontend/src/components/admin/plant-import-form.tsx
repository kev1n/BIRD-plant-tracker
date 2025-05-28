/**
 * Plant Import Form Component
 * 
 * Refactored for:
 * - Modern typography with proper text sizing
 * - Consistent spacing and visual hierarchy
 * - Better file upload UX with drag and drop
 * - Improved accessibility and error states
 * - Mobile-first responsive design
 */

import { AlertCircle, CheckCircle, FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { sendCSV } from '@/lib/admin-utils';

export default function ImportContainer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handlePickClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid CSV file');
      }
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await sendCSV(formData);
      toast.success(`Successfully imported ${response.imported} rows!`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Import failed. Please check your file format and try again. ' + error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">File Upload</h4>
        <p className="text-xs text-muted-foreground">
          Upload plant data in CSV format. Maximum file size: 10MB
        </p>
      </div>

      {/* File Upload Area */}
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          aria-describedby="file-upload-description"
        />

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25'
            }
          `}
          onClick={handlePickClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePickClick();
            }
          }}
          aria-label="Upload CSV file"
        >
          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • Click to change file
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: .csv files only
                </p>
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-600">
                Ready to import • {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Importing data...</span>
            <span className="text-xs text-muted-foreground">Please wait</span>
          </div>
          <Progress value={undefined} className="h-1" />
        </div>
      )}

      {/* Import Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>CSV Format Requirements:</strong> Ensure your file includes headers and follows the expected column structure. 
          Invalid rows will be skipped during import.
        </AlertDescription>
      </Alert>

      {/* Action Button */}
      <Button 
        type="button" 
        onClick={handleUploadClick} 
        disabled={!selectedFile || uploading}
        className="w-full"
        size="sm"
      >
        {uploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </>
        )}
      </Button>
    </div>
  );
}
