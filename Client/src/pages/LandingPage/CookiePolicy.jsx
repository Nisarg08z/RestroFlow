import React from "react";

const CookiePolicy = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.13_0.005_260)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-[oklch(0.98_0_0)] mb-8">
          Cookie Policy
        </h1>
        <p className="text-[oklch(0.65_0_0)] mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-[oklch(0.65_0_0)]">
          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              2. Types of Cookies We Use
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Essential Cookies
                </h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Performance Cookies
                </h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Functionality Cookies
                </h3>
                <p>
                  These cookies allow the website to remember choices you make and provide enhanced, personalized features.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Targeting Cookies
                </h3>
                <p>
                  These cookies may be set through our site by our advertising partners to build a profile of your interests.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              3. How We Use Cookies
            </h2>
            <p className="mb-3">We use cookies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Remember your login information and preferences</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Improve website functionality and user experience</li>
              <li>Provide personalized content and advertisements</li>
              <li>Ensure website security and prevent fraud</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              4. Third-Party Cookies
            </h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              5. Managing Cookies
            </h2>
            <p className="mb-3">You can control and manage cookies in various ways:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
              <li>Browser plugins: You can use browser plugins to manage cookies</li>
              <li>Opt-out tools: Some third-party services provide opt-out mechanisms</li>
            </ul>
            <p className="mt-3">
              Please note that disabling cookies may affect the functionality of our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              6. Cookie Duration
            </h2>
            <p>
              Cookies may be either "persistent" or "session" cookies. Persistent cookies remain on your device for a set period or until you delete them, while session cookies are deleted when you close your browser.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              7. Updates to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-4">
              8. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-3">
              Email: privacy@restroflow.com<br />
              Address: 123 Tech Street, San Francisco, CA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CookiePolicy;

