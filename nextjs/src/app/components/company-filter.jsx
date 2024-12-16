"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CompanyFilter({
  onFilterChange,
  selectedCompanies = [],
}) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/jobs");
        const data = await response.json();
        // Deduplicate companies based on name
        const uniqueCompanies = data.companies.filter(
          (company, index, self) =>
            index === self.findIndex((c) => c.name === company.name)
        );
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (company) => {
    if (!selectedCompanies.find((c) => c.id === company.id)) {
      onFilterChange([...selectedCompanies, company]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (companyId) => {
    const newSelected = selectedCompanies.filter((c) => c.id !== companyId);
    onFilterChange(newSelected);
  };

  return (
    <div className="space-y-0">
      <Command className="rounded-lg border shadow-[0_0_10px_rgba(0,0,0,0.1)]">
        <Command.Input
          placeholder="Search companies..."
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setIsOpen(value.length > 0);
          }}
          onFocus={() => setIsOpen(search.length > 0)}
          onBlur={() => {
            // Small delay to allow click events on items to fire
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="w-full px-3 py-2 rounded"
          style={{ margin: "2px", width: "calc(100% - 4px)" }}
        />
        {isOpen && filteredCompanies.length > 0 && (
          <Command.List className="max-h-48 overflow-y-auto p-2 border-t">
            {filteredCompanies.map((company) => (
              <Command.Item
                key={company.id}
                value={company.name}
                onSelect={() => handleSelect(company)}
                className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
              >
                {company.name}
              </Command.Item>
            ))}
          </Command.List>
        )}
      </Command>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedCompanies.map((company) => (
          <Badge
            key={company.id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {company.name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemove(company.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
