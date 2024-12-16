"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUpload from "./file-upload";
import JobList from "./job-list";
import { Send } from "lucide-react";
import UploadedFilePreview from "./uploaded-file-preview";
import axios from "axios";

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [showJobList, setShowJobList] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() || !isConversationStarted) {
      const userMessage = inputMessage || "Please analyze this resume";
      setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
      setInputMessage("");
      setIsConversationStarted(true);
      setStreamingMessage("");

      const fileContents = await Promise.all(
        uploadedFiles.map(async (file) => {
          const content = await readFileAsBase64(file);
          return {
            name: file.name,
            type: file.type,
            content: content,
          };
        })
      );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: userMessage,
            files: fileContents,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedMessage = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          streamedMessage += chunk;
          setStreamingMessage(streamedMessage);
        }

        setMessages((prev) => [
          ...prev,
          { text: streamedMessage, isUser: false },
        ]);
        setStreamingMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          { text: `Error: ${error.message}`, isUser: false },
        ]);
      }
    }
  };

  const handleFileUpload = async (files) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);

    const fileContents = await Promise.all(
      Array.from(files).map(async (file) => {
        const content = await readFileAsBase64(file);
        return {
          name: file.name,
          type: file.type,
          content: content,
        };
      })
    );

    try {
      // Modified this part
      const response = await axios.post(
        "/api/chat",
        { files: fileContents },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Error:", error);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const handleStreamedResponse = async (reader) => {
        let done = false;
        let message = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          const lines = chunkValue.split("\n");

          for (const line of lines) {
            if (line.startsWith("0:")) {
              const data = line.slice(3, -1);
              message += data;
              setStreamingMessage((prev) => prev + data);
            } else if (line.startsWith("e:")) {
              const json = JSON.parse(line.slice(2));
              if (json.finishReason === "stop") {
                setMessages((prev) => [
                  ...prev,
                  { text: message, isUser: false },
                ]);
                setStreamingMessage("");
                message = "";
              }
            }
          }
        }
      };

      handleStreamedResponse(reader);
    } catch (error) {
      console.error("Error uploading files:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: `Error uploading files: ${error.message}`,
          isUser: false,
        },
      ]);
    }
  };

  // Helper function to read file as base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result
          .replace("data:", "")
          .replace(/^.+,/, "");
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full mx-auto">
      {isConversationStarted && (
        <ScrollArea className="flex-grow mb-4 p-4 rounded-md w-full lg:w-1/2 lg:mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 whitespace-pre-wrap ${
                  message.isUser
                    ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-br-lg rounded-bl-2xl"
                    : "bg-gray-200 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-lg"
                }`}
              >
                {message.text}
              </span>
            </div>
          ))}
          {streamingMessage && (
            <div className="inline-block px-3 py-2 whitespace-pre-wrap bg-gray-200 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-lg">
              {streamingMessage}
            </div>
          )}
          {showJobList && <JobList jobs={jobs} />}
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
      <div
        className={`flex flex-col items-center justify-center ${
          isConversationStarted ? "h-auto" : "flex-grow"
        }`}
      >
        {!isConversationStarted && (
          <>
            <h1
              className={`text-center text-4xl font-bold text-gray-800 ${
                uploadedFiles.length > 0 ? "mb-2" : "mb-8"
              }`}
            >
              Find your dream job in seconds
            </h1>
            {uploadedFiles.length > 0 && (
              <UploadedFilePreview files={uploadedFiles} />
            )}
          </>
        )}
        <div className="w-full max-w-3xl space-y-4">
          <div className="flex items-center space-x-2">
            <FileUpload onFileUpload={handleFileUpload} />
            <Input
              type="text"
              placeholder={
                isConversationStarted
                  ? "Type your message..."
                  : "Send a message to start the conversation..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConversationStarted && (
            <p className="text-center text-sm text-gray-500 mt-8">
              AI Job Assistant is designed to help you find suitable internships
              and jobs. Start by uploading your resume or sending a message.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
