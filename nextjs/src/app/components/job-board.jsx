import { ScrollArea } from "@/components/ui/scroll-area";
import JobList from "./job-list";
import LoadingSpinner from "./loading-spinner";
import CompanyFilter from "./company-filter";
import { useState } from "react";

export default function JobBoard({ jobs, isLoading }) {
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const handleFilterChange = (companies) => {
    setSelectedCompanies(companies);
    if (companies.length === 0) {
      setFilteredJobs(jobs);
    } else {
      const companyNames = companies.map((c) => c.name);
      setFilteredJobs(jobs.filter((job) => companyNames.includes(job.company)));
    }
  };

  const handleCompanyClick = (companyName) => {
    // Only add if not already selected
    if (!selectedCompanies.find((c) => c.name === companyName)) {
      const newCompany = { id: Date.now(), name: companyName }; // Generate temporary id
      handleFilterChange([...selectedCompanies, newCompany]);
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] shadow-lg rounded-lg overflow-hidden">
      <div className="bg-white h-full p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-4">Matching Jobs</h2>
        <div className="mb-4">
          <CompanyFilter
            onFilterChange={handleFilterChange}
            selectedCompanies={selectedCompanies}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="pb-4 pr-2 sm:pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className="text-center text-gray-500">
                No matching jobs found
              </p>
            ) : (
              <JobList
                jobs={filteredJobs}
                onCompanyClick={handleCompanyClick}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
