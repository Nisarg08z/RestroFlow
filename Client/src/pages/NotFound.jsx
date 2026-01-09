import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
      <p className="text-sm font-semibold text-[oklch(0.7_0.18_45)] mb-2">404</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-[oklch(0.98_0_0)] mb-3 text-center">
        Page not found
      </h1>
      <p className="text-[oklch(0.65_0_0)] mb-6 text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] hover:bg-[oklch(0.7_0.18_45)]/90 transition"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;

