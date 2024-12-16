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

export default function JobList({ jobs, onCompanyClick }) {
  console.log(jobs[0]);
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <button
                onClick={() => onCompanyClick(job.company)}
                className="text-gray-600 hover:text-gray-900 hover:underline"
              >
                {job.company}
              </button>
              <span className="text-gray-600"> • {job.location}</span>
            </div>
            <Badge
              variant={
                job.score >= 90
                  ? "success"
                  : job.score >= 80
                  ? "default"
                  : "secondary"
              }
            >
              {job.score}% Match
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-3">{job.description}</p>

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

          <div className="mt-4 flex justify-between items-center">
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
            >
              Apply <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
