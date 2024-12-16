import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200 },
  },
};

export default function ResumeDisplay({ parsedData }) {
  if (!parsedData) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-3rem)] shadow-lg rounded-lg overflow-hidden"
    >
      <div className="bg-white h-full p-6">
        <motion.h2
          variants={sectionVariants}
          className="text-2xl font-bold mb-4"
        >
          Resume Analysis
        </motion.h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6">
            <motion.div variants={sectionVariants}>
              <h3 className="text-lg font-bold mb-4">Profile Summary</h3>
              <p className="text-gray-600">{parsedData.description}</p>
            </motion.div>

            <motion.div variants={sectionVariants}>
              <h3 className="text-lg font-semibold text-gray-800">
                Work Experience
              </h3>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-row flex-wrap gap-2"
              >
                {parsedData.work_experience?.map((experience, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
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
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={sectionVariants}>
              <h3 className="text-lg font-semibold text-gray-800">
                Technical Skills
              </h3>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {parsedData.technical_skills.split(",").map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={sectionVariants}>
              <h3 className="text-lg font-semibold text-gray-800">
                Soft Skills
              </h3>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {parsedData.soft_skills.split(",").map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={sectionVariants} whileHover={{ scale: 1.02 }}>
              <h3 className="text-lg font-semibold text-gray-800">
                Experience Level
              </h3>
              <motion.span
                variants={itemVariants}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm inline-block"
              >
                {parsedData.experience_level}
              </motion.span>
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
