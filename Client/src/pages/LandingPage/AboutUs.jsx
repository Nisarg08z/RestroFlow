import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AboutUs = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.13_0.005_260)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[oklch(0.98_0_0)] mb-8">
          About Us
        </h1>

        <div className="space-y-8 text-[oklch(0.65_0_0)]">
          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Our Mission
            </h2>
            <p>
              At RestroFlow, we're on a mission to revolutionize the restaurant industry by providing cutting-edge technology that simplifies operations, enhances customer experiences, and drives business growth. We believe every restaurant, regardless of size, deserves access to powerful tools that help them thrive.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Our Story
            </h2>
            <p>
              Founded in 2024, RestroFlow was born from a simple observation: restaurants were struggling with outdated systems that couldn't keep up with modern customer expectations. Our team of passionate developers, designers, and restaurant industry veterans came together to create a comprehensive solution that addresses real-world challenges.
            </p>
            <p className="mt-4">
              Today, we serve hundreds of restaurants across the country, helping them streamline operations, reduce wait times, and increase customer satisfaction. Our platform processes millions of orders monthly, and we're just getting started.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              What We Do
            </h2>
            <p className="mb-3">RestroFlow provides a complete restaurant management ecosystem:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>QR code-based ordering system for seamless customer experience</li>
              <li>Real-time kitchen display systems for efficient order management</li>
              <li>Comprehensive analytics and reporting tools</li>
              <li>Smart billing and payment solutions</li>
              <li>Multi-dashboard access for different user roles</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Our Values
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Innovation
                </h3>
                <p>
                  We continuously innovate to stay ahead of industry trends and provide the best solutions for our customers.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Reliability
                </h3>
                <p>
                  We understand that restaurants depend on our platform. That's why we maintain 99.9% uptime and provide 24/7 support.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Customer-Centric
                </h3>
                <p>
                  Our customers are at the heart of everything we do. We listen, learn, and adapt to meet their evolving needs.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              Contact Us
            </h2>
            <p>
              Want to learn more about RestroFlow or have questions? We'd love to hear from you.
            </p>
            <p className="mt-3">
              Email: hello@restroflow.com<br />
              Phone: +1 (234) 567-890<br />
              Address: 123 Tech Street, San Francisco, CA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

