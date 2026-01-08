import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
          Terms of Service
        </h1>
        <p className="text-[oklch(0.65_0_0)] mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-[oklch(0.65_0_0)]">
          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using RestroFlow's services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              2. Use License
            </h2>
            <p className="mb-3">Permission is granted to temporarily use RestroFlow's services for personal or commercial purposes. This license does not include:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose without written consent</li>
              <li>Attempting to reverse engineer any software</li>
              <li>Removing any copyright or proprietary notations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              3. Account Registration
            </h2>
            <p className="mb-3">To use certain features, you must register for an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain and update your information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              4. Payment Terms
            </h2>
            <p>
              Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days' notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              5. Prohibited Uses
            </h2>
            <p className="mb-3">You may not use our services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>In any unlawful manner or for unlawful purposes</li>
              <li>To transmit viruses or malicious code</li>
              <li>To violate any applicable laws or regulations</li>
              <li>To infringe upon the rights of others</li>
              <li>To interfere with or disrupt our services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              6. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of RestroFlow are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              In no event shall RestroFlow be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              8. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to our services immediately, without prior notice, for conduct that we believe violates these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              9. Contact Information
            </h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-3">
              Email: legal@restroflow.com<br />
              Address: 123 Tech Street, San Francisco, CA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;

