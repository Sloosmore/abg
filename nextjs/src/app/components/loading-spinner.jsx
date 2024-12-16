import React, { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  FileText,
  ClipboardList,
  LineChart,
} from "lucide-react";

export default function LoadingSpinner() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: FileText, text: "Analyzing document structure..." },
    { icon: ClipboardList, text: "Processing content..." },
    { icon: LineChart, text: "Generating insights..." },
    { icon: CheckCircle, text: "Finalizing results..." },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 150);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      {/* Main loading animation */}
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>

      {/* Progress bar */}
      <div className="w-full mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step indicator */}
      <div className="mt-6 text-center">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center transition-opacity duration-300 mb-2
              ${currentStep === index ? "opacity-100" : "opacity-0 hidden"}`}
          >
            <step.icon className="h-5 w-5 text-black mr-2" />
            <span className="text-gray-600">{step.text}</span>
          </div>
        ))}
      </div>

      {/* Estimated time */}
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-500">
          Estimated time: {Math.max(20 - Math.floor(progress / 5), 3)} seconds
          remaining
        </span>
      </div>
    </div>
  );
}
