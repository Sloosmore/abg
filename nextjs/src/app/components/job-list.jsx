import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const hoverVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
    },
  },
};

export default function JobList({ jobs, onCompanyClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    // Force year to 2024
    date.setFullYear(2024);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {jobs.map((job) => (
        <motion.div
          key={job.id}
          variants={itemVariants}
          whileHover="hover"
          className="bg-white border rounded-lg p-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
            <div className="flex-1 min-w-0 w-full">
              <h3 className="text-lg font-semibold break-words">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => onCompanyClick(job.company)}
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {job.company}
                </button>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600 break-words">
                  {job.location.replace(/<[^>]*>/g, "")}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Posted: {formatDate(job.date_posted)}
              </div>
            </div>
            <Badge
              variant="default"
              className={`text-white border-0 whitespace-nowrap ${
                job.score >= 90
                  ? "bg-gradient-to-r from-purple-900 to-blue-700"
                  : job.score >= 80
                  ? "bg-gradient-to-r from-purple-800 to-blue-600"
                  : "bg-gradient-to-r from-purple-700 to-blue-500"
              }`}
            >
              {job.score}% Match
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-3 break-words">
            {job.description}
          </p>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Technical Skills</p>
              <div className="flex flex-wrap gap-1">
                {job.technicalSkills.split(",").map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Soft Skills</p>
              <div className="flex flex-wrap gap-1">
                {job.softSkills.split(",").map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="text-sm text-gray-600">Experience Level:</div>
              <div>
                <Badge variant="outline" className="capitalize">
                  {job.experienceLevel || "Not specified"}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => window.open(job.applicationUrl, "_blank")}
              className="w-full sm:w-auto"
            >
              Apply <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
