"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

export default function FileUpload({ onFileUpload }) {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(
        Array.from(files)
          .map((file) => file.name)
          .join(", ")
      );
      onFileUpload(files);
    } else {
      setFileName(null);
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
        multiple
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
