"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

export default function FileUpload({ onFileUpload }) {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx"
        style={{ display: "none" }}
      />
      <Button
        onClick={handleButtonClick}
        size="icon"
        variant="outline"
        title={fileName || "Upload Resume"}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
}
