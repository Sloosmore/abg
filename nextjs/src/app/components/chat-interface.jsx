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
import LoadingSpinner from "./loading-spinner";
import JobBoard from "./job-board";
import ResumeDisplay from "./resume-display";

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
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!isConversationStarted || inputMessage !== "") {
      const userMessage = inputMessage || "Please analyze this resume";
      setInputMessage("");
      setIsConversationStarted(true);
      setIsLoading(true);
      setParsedData(null);
      setJobs([]);

      // Create a text file from the input message if no files are uploaded
      let fileContents = [];
      if (uploadedFiles.length === 0 && inputMessage) {
        const textFile = new File([inputMessage], "resume.txt", {
          type: "text/plain",
        });
        const content = await readFileAsBase64(textFile);
        fileContents = [
          {
            name: "resume.txt",
            type: "text/plain",
            content: content,
          },
        ];
      } else {
        fileContents = await Promise.all(
          uploadedFiles.map(async (file) => {
            const content = await readFileAsBase64(file);
            return {
              name: file.name,
              type: file.type,
              content: content,
            };
          })
        );
      }

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
          if (done) {
            try {
              const jsonStr = streamedMessage
                .split("\n")
                .filter((line) => line.startsWith("data: "))
                .map((line) => line.slice(6))
                .join("");

              const parsedData = JSON.parse(jsonStr);
              setParsedData(parsedData);

              // Fetch matching jobs
              try {
                const jobsResponse = await fetch("/api/jobs", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    description: parsedData.description,
                    technical_skills: parsedData.technical_skills,
                    soft_skills: parsedData.soft_skills,
                  }),
                });

                if (!jobsResponse.ok) {
                  throw new Error(`HTTP error! status: ${jobsResponse.status}`);
                }

                const { jobs: matchedJobs } = await jobsResponse.json();
                setJobs(
                  matchedJobs.map((job) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company_name,
                    location: job.location,
                    applicationUrl: job.application_url,
                    description: job.job_description,
                    technicalSkills: job.technical_skills,
                    softSkills: job.soft_skills,
                    experienceLevel: job.experience_level,
                    score: Math.round(job.similarity_score * 100),
                  }))
                );
              } catch (error) {
                console.error("Error fetching matching jobs:", error);
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
            setIsLoading(false);
            break;
          }
          const chunk = decoder.decode(value);
          streamedMessage += chunk;
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setParsedData(null);
    setJobs([]);
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputMessage || "Please analyze this resume",
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
        if (done) {
          try {
            const jsonStr = streamedMessage
              .split("\n")
              .filter((line) => line.startsWith("data: "))
              .map((line) => line.slice(6))
              .join("");

            const parsedData = JSON.parse(jsonStr);
            console.log("Parsed JSON data:", parsedData);

            setParsedData(parsedData);
            setMessages((prev) => [
              ...prev,
              {
                text: streamedMessage,
                isUser: false,
                parsedData: parsedData,
              },
            ]);

            try {
              const jobsResponse = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  description: parsedData.description,
                  technical_skills: parsedData.technical_skills,
                  soft_skills: parsedData.soft_skills,
                }),
              });

              if (!jobsResponse.ok) {
                throw new Error(`HTTP error! status: ${jobsResponse.status}`);
              }

              const { jobs: matchedJobs } = await jobsResponse.json();
              setJobs(
                matchedJobs.map((job) => ({
                  id: job.id,
                  title: job.title,
                  company: job.company_name, // Changed from companies?.name
                  location: job.location,
                  applicationUrl: job.application_url,
                  description: job.job_description,
                  technicalSkills: job.technical_skills,
                  softSkills: job.soft_skills,
                  experienceLevel: job.experience_level,
                  date_posted: job.date_posted, // Make sure this is included
                  score: Math.round(job.similarity_score * 100),
                }))
              );
            } catch (error) {
              console.error("Error fetching matching jobs:", error);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            setMessages((prev) => [
              ...prev,
              {
                text: streamedMessage,
                isUser: false,
                error: "Failed to parse response as JSON",
              },
            ]);
          }
          setIsLoading(false);
          break;
        }

        const chunk = decoder.decode(value);
        streamedMessage += chunk;
        setStreamingMessage(streamedMessage);
      }

      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message}`,
          isUser: false,
        },
      ]);
      setIsLoading(false);
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

  console.log(streamingMessage);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full mx-auto">
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : parsedData ? (
        <div className="flex flex-col h-full">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <JobBoard jobs={jobs} isLoading={isLoading} />
            <ResumeDisplay parsedData={parsedData} />
          </div>
          <div
            className="flex items-center gap-2 p-4 cursor-pointer hover:opacity-80 justify-center border-t"
            onClick={() => {
              setIsConversationStarted(false);
              setParsedData(null);
              setJobs([]);
              setMessages([]);
              setInputMessage("");
              setUploadedFiles([]);
            }}
          >
            <span className="text-blue-600 font-bold flex items-center">
              ← Try another resume
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div
            className={`flex flex-col items-center justify-center ${
              isConversationStarted ? "h-auto" : "flex-grow"
            }`}
          >
            {!isConversationStarted && (
              <>
                <img
                  src="/HireWizard.png"
                  alt="HireWizard Logo"
                  className="mb-6 w-64"
                />
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

            {isConversationStarted && (
              <ScrollArea className="flex-grow mb-4 p-4 rounded-md w-full lg:w-1/2 lg:mx-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.isUser ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block px-3 py-2 whitespace-pre-wrap ${
                        message.isUser
                          ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-br-lg rounded-bl-2xl"
                          : "bg-gray-200 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-lg"
                      }`}
                    >
                      {message.parsedData ? (
                        <div>
                          <h3>Profile Summary:</h3>
                          <p>{message.parsedData.description}</p>

                          <h3>Technical Skills:</h3>
                          <p>{message.parsedData.technical_skills}</p>

                          <h3>Soft Skills:</h3>
                          <p>{message.parsedData.soft_skills}</p>

                          <h3>Experience Level:</h3>
                          <p>{message.parsedData.experience_level}</p>
                        </div>
                      ) : (
                        message.text
                      )}
                    </span>
                  </div>
                ))}
                {streamingMessage && (
                  <div className="inline-block px-3 py-2 whitespace-pre-wrap bg-gray-200 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-lg">
                    {streamingMessage}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
            )}

            <div className="w-full max-w-3xl space-y-4 mx-auto p-4">
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
                  AI Job Assistant is designed to help you find suitable
                  internships and jobs. Start by uploading your resume or
                  sending a message.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
