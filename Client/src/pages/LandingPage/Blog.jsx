import React from "react";

const Blog = () => {
  const blogPosts = [
    {
      title: "5 Ways QR Code Ordering is Revolutionizing Restaurants",
      date: "January 15, 2026",
      excerpt: "Discover how QR code ordering systems are transforming the dining experience and helping restaurants increase efficiency.",
      category: "Technology"
    },
    {
      title: "The Future of Restaurant Management: Trends to Watch in 2026",
      date: "January 10, 2026",
      excerpt: "Explore the latest trends shaping the restaurant industry and how technology is driving innovation.",
      category: "Industry Insights"
    },
    {
      title: "How to Increase Table Turnover Without Compromising Service",
      date: "January 5, 2026",
      excerpt: "Learn practical strategies for improving table turnover rates while maintaining high-quality customer service.",
      category: "Operations"
    },
    {
      title: "Understanding Restaurant Analytics: Key Metrics That Matter",
      date: "December 28, 2025",
      excerpt: "A comprehensive guide to the most important metrics every restaurant owner should track to drive growth.",
      category: "Analytics"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.13_0.005_260)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-[oklch(0.98_0_0)] mb-4">
          Blog
        </h1>
        <p className="text-[oklch(0.65_0_0)] mb-12 text-lg">
          Insights, tips, and stories from the restaurant industry
        </p>

        <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-6 hover:border-[oklch(0.7_0.18_45)]/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[oklch(0.7_0.18_45)]/10 text-[oklch(0.7_0.18_45)] text-sm rounded-full">
                  {post.category}
                </span>
                <span className="text-[oklch(0.65_0_0)] text-sm">
                  {post.date}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-3">
                {post.title}
              </h2>
              <p className="text-[oklch(0.65_0_0)] mb-4">
                {post.excerpt}
              </p>
              <a
                href="#contact"
                className="text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 font-medium transition"
              >
                Read More →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl text-center">
          <h2 className="text-2xl font-semibold text-[oklch(0.98_0_0)] mb-3">
            Stay Updated
          </h2>
          <p className="text-[oklch(0.65_0_0)] mb-4">
            Subscribe to our newsletter to get the latest articles and industry insights delivered to your inbox.
          </p>
          <a
            href="#contact"
            className="inline-block px-6 py-2 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] rounded-lg font-medium hover:bg-[oklch(0.7_0.18_45)]/90 transition"
          >
            Subscribe
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;

