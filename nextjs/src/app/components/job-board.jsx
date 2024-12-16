import { ScrollArea } from "@/components/ui/scroll-area";
import JobList from "./job-list";
import LoadingSpinner from "./loading-spinner";
import CompanyFilter from "./company-filter";
import { useState } from "react";

export default function JobBoard({ jobs, isLoading }) {
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("similarity"); // 'similarity' or 'date'

  const applyFilters = (companies, dateRange, order) => {
    let filtered = [...jobs];

    // Apply company filter
    if (companies.length > 0) {
      const companyNames = companies.map((c) => c.name);
      filtered = filtered.filter((job) => companyNames.includes(job.company));
    }

    // Apply date filter
    if (dateRange !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((job) => {
        if (!job.date_posted) return false;

        const jobDate = new Date(job.date_posted);
        jobDate.setFullYear(2024);

        const diffDays = Math.floor((today - jobDate) / (1000 * 60 * 60 * 24));

        switch (dateRange) {
          case "today":
            return diffDays === 0;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (order === "date") {
        const dateA = new Date(a.date_posted);
        const dateB = new Date(b.date_posted);
        dateA.setFullYear(2024);
        dateB.setFullYear(2024);
        return dateB - dateA; // Most recent first
      } else {
        return b.score - a.score; // Highest similarity first
      }
    });

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (companies) => {
    setSelectedCompanies(companies);
    applyFilters(companies, dateFilter, sortOrder);
  };

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilter(value);
    applyFilters(selectedCompanies, value, sortOrder);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    applyFilters(selectedCompanies, dateFilter, value);
  };

  const handleCompanyClick = (companyName) => {
    if (!selectedCompanies.find((c) => c.name === companyName)) {
      const newCompany = { id: Date.now(), name: companyName };
      handleFilterChange([...selectedCompanies, newCompany]);
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] shadow-lg rounded-lg overflow-hidden">
      <div className="bg-white h-full p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-4">Matching Jobs</h2>
        <div className="mb-4 space-y-3">
          <CompanyFilter
            onFilterChange={handleFilterChange}
            selectedCompanies={selectedCompanies}
          />
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2 min-w-[200px]">
              <span className="text-sm font-medium text-gray-700">Posted:</span>
              <select
                value={dateFilter}
                onChange={handleDateFilterChange}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm 
                          shadow-sm transition-colors hover:border-purple-400 focus:border-purple-500 
                          focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="flex rounded-md border border-gray-300 p-0.5">
                <button
                  onClick={() =>
                    handleSortChange({ target: { value: "similarity" } })
                  }
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortOrder === "similarity"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Best Match
                </button>
                <button
                  onClick={() =>
                    handleSortChange({ target: { value: "date" } })
                  }
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortOrder === "date"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Most Recent
                </button>
              </div>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-14rem)]">
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
