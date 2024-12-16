import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ResumeDisplay({ parsedData }) {
  if (!parsedData) return null;

  return (
    <div className="h-[calc(100vh-3rem)] shadow-lg rounded-lg overflow-hidden">
      <div className="bg-white h-full p-6">
        <h2 className="text-2xl font-bold mb-4">Resume Analysis</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Profile Summary</h3>
              <p className="text-gray-600">{parsedData.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Work Experience
              </h3>
              <div className="flex flex-row flex-wrap gap-2">
                {parsedData.work_experience?.map((experience, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg text-sm flex-shrink-0 text-center border border-black"
                    style={{ width: "fit-content" }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <h4 className="font-extrabold text-gray-800">
                        {experience.title}
                      </h4>
                      <p className="font-semibold text-gray-600 text-xs">
                        {experience.company}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsedData.technical_skills.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsedData.soft_skills.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Experience Level
              </h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {parsedData.experience_level}
              </span>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
