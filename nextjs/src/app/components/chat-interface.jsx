"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUpload from "./file-upload";
import JobList from "./job-list";
import { Send } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [showJobList, setShowJobList] = useState(false);
  const [jobs, setJobs] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() || !isConversationStarted) {
      setMessages([
        ...messages,
        { text: inputMessage || "Hello", isUser: true },
      ]);
      setInputMessage("");
      setIsConversationStarted(true);
      // Simulate AI response
      setTimeout(() => {
        if (!isConversationStarted) {
          setMessages((prev) => [
            ...prev,
            {
              text: "Hello! I'm your AI Job Assistant. Upload your resume, and I'll help you find suitable internships and jobs.",
              isUser: false,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: "I've received your message. Please upload your resume so I can find suitable job opportunities for you.",
              isUser: false,
            },
          ]);
        }
      }, 1000);
    }
  };

  const handleFileUpload = (file) => {
    setMessages((prev) => [
      ...prev,
      { text: `Uploaded file: ${file.name}`, isUser: true },
    ]);
    setIsConversationStarted(true);
    // Simulate AI processing the resume and fetching job listings
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "I've analyzed your resume and found some suitable job opportunities. Here's a ranked list of jobs based on your skills and experience:",
          isUser: false,
        },
      ]);
      setShowJobList(true);
      // Simulated job data
      setJobs([
        {
          id: "1",
          title: "Software Engineer",
          company: "Tech Corp",
          score: 95,
        },
        {
          id: "2",
          title: "Data Analyst",
          company: "Data Insights Inc",
          score: 88,
        },
        {
          id: "3",
          title: "UX Designer",
          company: "Creative Solutions",
          score: 82,
        },
        {
          id: "4",
          title: "Product Manager",
          company: "Innovate Co",
          score: 79,
        },
        {
          id: "5",
          title: "Frontend Developer",
          company: "Web Wizards",
          score: 75,
        },
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      {isConversationStarted && (
        <ScrollArea className="flex-grow mb-4 p-4 rounded-md border">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.text}
              </span>
            </div>
          ))}
          {showJobList && <JobList jobs={jobs} />}
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
      <div
        className={`flex flex-col items-center justify-center ${
          isConversationStarted ? "h-auto" : "flex-grow"
        }`}
      >
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
            <p className="text-center text-sm text-gray-500">
              AI Job Assistant is designed to help you find suitable internships
              and jobs. Start by uploading your resume or sending a message.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
