import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectInventoryCard from "./ProjectInventoryCard";

import { getProjects } from "../services/projectService";

export default function Inventory() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  const loadProjects = async () => {
    try {
      setLoading(true);

      const data = await getProjects();

      setProjects(data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);


 const filteredProjects = projects.filter((project) => {
  const matchesName = project.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesYear =
    selectedYear === "All" ||
    project.year == selectedYear;

  return matchesName && matchesYear;
});

  return (
    <DashboardLayout>
      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Project Inventory
        </h1>

        <p className="mt-2 text-slate-500">
          Select a construction project to manage its materials and inventory.
        </p>
      </div>

      <input
  type="text"
  placeholder="Search project by name..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    mb-8
    w-full
    rounded-xl
    border
    border-slate-200
    bg-white
    px-5
    py-3
    shadow-sm
    outline-none
    focus:border-blue-500
    focus:ring-4
    focus:ring-blue-100
    md:w-96
  "
/>

<select
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value)}
  className="
    mb-8
    ml-0
    rounded-xl
    border
    border-slate-200
    bg-white
    px-5
    py-3
    shadow-sm
    outline-none
    focus:border-blue-500
    focus:ring-4
    focus:ring-blue-100
  "
>
  <option value="All">All Years</option>

  {[...new Set(projects.map((p) => p.year))]
    .sort((a, b) => b - a)
    .map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
</select>

      {/* Projects */}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold">
            Loading Projects...
          </h2>
        </div>
      ) : filteredProjects.length === 0? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <h2 className="text-2xl font-bold">
            No Projects Found
          </h2>

          <p className="mt-3 text-slate-500">
            Create a project before adding inventory.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectInventoryCard
              key={project._id}
              project={project}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}