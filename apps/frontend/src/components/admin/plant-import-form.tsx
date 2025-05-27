import { sendCSV } from "@/lib/admin-utils";
import { PaperclipIcon } from "lucide-react";
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from "../ui/button";

export default function ImportContainer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUploadClick = async () => {
    console.log("hello");
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    console.log("hello");

    try {
      const response = await sendCSV(formData);
      toast.success(`Imported ${response.imported} rows!`);
      setSelectedFile(null);
    } catch {
      toast.error(`Import failed`);
    } finally {
      setUploading(false);
    }
  };

  return (
      <div className="m-2 border border-gray-700 rounded-[3px]">
          <h3 className="m-4">Upload Plants</h3>
          <p className="m-4">Please upload plant data in a ".csv" file</p>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            onClick={handlePickClick}
            className="
              flex items-center
              border border-gray-700
              rounded-lg
              bg-pink-50
              p-4
              cursor-pointer
              hover:shadow-lg
              w-full max-w-md
              mx-auto
            "
          >
            <PaperclipIcon className="w-6 h-6 text-gray-700 mr-3" />
            <span className="font-semibold underline text-gray-900">
              {selectedFile ? selectedFile.name + " : CHANGE FILE" : "BROWSE FILES"}
            </span>
          </label>

          <Button 
            type="button" 
            variant="darkGreen"
            onClick={handleUploadClick} 
            disabled={!selectedFile || uploading}
          >{uploading ? "IMPORTING…" : "IMPORT DATA"}</Button>
      </div>
  );
}
