import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <p className="text-sm font-semibold text-primary mb-2">404</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-center">
        Page not found
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
