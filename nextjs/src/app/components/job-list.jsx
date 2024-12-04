import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function JobList({ jobs }) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Ranked Job Opportunities</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Match Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.company}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    job.score >= 90
                      ? "default"
                      : job.score >= 80
                      ? "secondary"
                      : "outline"
                  }
                >
                  {job.score}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
