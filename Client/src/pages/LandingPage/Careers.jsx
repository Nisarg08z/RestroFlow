import React from "react";

const Careers = () => {
  const openPositions = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time"
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "San Francisco, CA / Remote",
      type: "Full-time"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      title: "Sales Representative",
      department: "Sales",
      location: "Remote",
      type: "Full-time"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.13_0.005_260)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-[oklch(0.98_0_0)] mb-4">
          Careers
        </h1>
        <p className="text-[oklch(0.65_0_0)] mb-12 text-lg">
          Join us in transforming the restaurant industry
        </p>

        <div className="space-y-8 text-[oklch(0.65_0_0)]">
          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Why Work at RestroFlow?
            </h2>
            <p className="mb-3">
              At RestroFlow, we're building the future of restaurant technology. We're a fast-growing startup with a passionate team dedicated to making a real impact in the industry.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Competitive salary and equity packages</li>
              <li>Comprehensive health, dental, and vision insurance</li>
              <li>Flexible work arrangements (remote-friendly)</li>
              <li>Professional development opportunities</li>
              <li>Collaborative and inclusive work environment</li>
              <li>Stocked kitchen and team lunches</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-6">
              Open Positions
            </h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-6 hover:border-[oklch(0.7_0.18_45)]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-[oklch(0.65_0_0)]">{position.department}</span>
                        <span className="text-[oklch(0.65_0_0)]">•</span>
                        <span className="text-[oklch(0.65_0_0)]">{position.location}</span>
                        <span className="text-[oklch(0.65_0_0)]">•</span>
                        <span className="text-[oklch(0.65_0_0)]">{position.type}</span>
                      </div>
                    </div>
                    <a
                      href="#contact"
                      className="px-6 py-2 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] rounded-lg font-medium hover:bg-[oklch(0.7_0.18_45)]/90 transition whitespace-nowrap"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Don't See a Role That Fits?
            </h2>
            <p>
              We're always looking for talented individuals to join our team. Even if you don't see a position that matches your skills, we'd love to hear from you. Send us your resume and let us know how you'd like to contribute to RestroFlow.
            </p>
            <p className="mt-4">
              Email: careers@restroflow.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;

