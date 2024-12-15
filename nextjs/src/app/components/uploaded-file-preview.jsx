"use client";

import React from "react";
import { File, FileText, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

// Dummy data to demonstrate the component
const dummyFiles = [
  {
    name: "report.pdf",
    type: "application/pdf",
  },
  {
    name: "document.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    name: "data-analysis.csv",
    type: "text/csv",
  },
  {
    name: "profile-picture.jpg",
    type: "image/jpeg",
  },
];

const FileIcon = ({ fileType }) => {
  const getIconConfig = (type) => {
    if (type?.includes("pdf")) {
      return {
        icon: FileText,
        bgColor: "bg-red-100",
        iconColor: "text-red-600",
      };
    }
    if (type?.includes("wordprocessingml.document") || type?.includes("docx")) {
      return {
        icon: FileCheck,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      };
    }
    return {
      icon: File,
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    };
  };

  const config = getIconConfig(fileType);
  const IconComponent = config.icon;

  return (
    <motion.div
      className={`p-2 rounded-lg ${config.bgColor}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
    </motion.div>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const UploadedFilePreview = ({ files = dummyFiles }) => {
  if (!files?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 text-center text-gray-500"
      >
        No files uploaded
      </motion.div>
    );
  }

  return (
    <div className="p-4">
      <motion.div
        className="flex flex-wrap gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {files.map((file, index) => (
          <motion.div
            key={`file-${index}`}
            variants={item}
            className="flex items-center p-3 space-x-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
          >
            <FileIcon fileType={file.type} />
            <motion.div
              className="min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name || "Untitled"}
              </p>
              {file.type && (
                <p className="text-xs text-gray-500 truncate">{file.type}</p>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UploadedFilePreview;
