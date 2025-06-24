import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChevronRight, CheckCircle } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

const endpoints = [
  {
    title: "Advanced Role & Company Search",
    description:
      "Our advanced endpoints were built for developers who need precision and control.",
    features: [
      "Search with custom keywords or structured filters",
      "Match roles to public-facing company insights",
      "Enrich partial records with AI-powered logic",
    ],
    code: `{
  "status": "success",
  "data": {
    "fullName": "Aneeq Khurram",
    "headline": "Full-Stack Web Developer",
    "connections": 3392
  }
}
`,
  },
  {
    title: "Person Search API",
    description:
      "Search professionals by name, title, organization, and other advanced filters.",
    features: [
      "Filter by seniority, geography, and industry",
      "Access real-time, publicly available profile data",
      "Retrieve contact information and skills",
    ],
    code: `{
  "query": { "name": "John Doe", "company": "Acme Corp" },
  "results": [
    {
      "full_name": "Johnathan Doe",
      "headline": "Senior Software Engineer at Acme Corp",
      "location": "San Francisco, California"
    }
  ]
}`,
  },
  {
    title: "Company Search API",
    description:
      "Pull detailed firmographics, company size, recent posts, and full descriptions.",
    features: [
      "Get employee count and growth trends",
      "Find company websites, locations, and industries",
      "Access a list of key decision-makers",
    ],
    code: `{
  "query": { "domain": "acme.com" },
  "result": {
    "name": "Acme Corporation",
    "description": "A leading provider of innovative solutions...",
    "industry": "Information Technology",
    "employee_count": 5230
  }
}`,
  },
  {
    title: "Job Listings API",
    description:
      "Access public listings for open roles, filtered by company, title, and region.",
    features: [
      "Search for jobs by keywords and location",
      "Filter by job function and seniority level",
      "Retrieve full job descriptions",
    ],
    code: `{
  "query": { "title": "Product Manager", "region": "USA" },
  "jobs": [
    {
      "job_id": "987654",
      "title": "Senior Product Manager, AI",
      "company": "Tech Innovations Inc.",
      "location": "New York, NY"
    }
  ]
}`,
  },
  {
    title: "Content & Activity API",
    description:
      "Scrape public posts, detailed bios, published articles, and recent profile updates.",
    features: [
      "Monitor profile activity and public role changes",
      "Extract full text from posts and articles",
      "Track engagement metrics like comments",
    ],
    code: `{
  "profile_id": "urn:li:person:12345",
  "activity": [
    {
      "type": "post",
      "text": "Excited to share our latest product update!...",
      "timestamp": "2024-05-21T10:00:00Z"
    }
  ]
}`,
  },
  {
    title: "Bulk & Pagination",
    description:
      "Query at scale with high-volume bulk endpoints and seamless pagination support.",
    features: [
      "Process thousands of requests per minute",
      "Use cursor-based pagination for large datasets",
      "Avoid throttling with optimized batch processing",
    ],
    code: `{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "next_page_token": "aBcDeFg12345",
    "total_results": 15000
  }
}`,
  },
  {
    title: "AI Filter Engine",
    description:
      "Leverage smart suggestions and filters for intent, seniority, or industry.",
    features: [
      "Identify prospects with buying intent signals",
      "Automatically classify seniority from job titles",
      "Get suggestions for related industries and skills",
    ],
    code: `{
  "query": {
    "industry": "SaaS",
    "ai_filter": {
      "intent": "hiring_for_sales",
      "seniority": ["c-level", "vp"]
    }
  }
}`,
  },
];

const ApiEndpointsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEndpoint = endpoints[activeIndex];

  return (
    <section id="api" className="py-16 bg-background md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-bold tracking-wider uppercase text-accent">
            Developer First
          </p>
          <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
            Our API
            <span className="relative inline-block ml-3">
              <span className="absolute md:top-10 top-8 w-full h-3 bg-accent/20"></span>
              <span className="relative">Endpoints</span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Everything you need to extract, analyze, and activate live
            professional data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ul className="space-y-2">
              {endpoints.map((endpoint, index) => (
                <li key={endpoint.title}>
                  <button
                    onClick={() => setActiveIndex(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 flex justify-between items-center ${
                      activeIndex === index
                        ? "bg-accent text-white shadow-lg"
                        : "bg-card hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span className="font-semibold">{endpoint.title}</span>
                    <ChevronRight
                      className={`transition-transform duration-300 ${
                        activeIndex === index ? "opacity-100" : "opacity-50"
                      }`}
                      size={20}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEndpoint.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-card"
              >
                <h3 className="text-2xl font-bold text-foreground">
                  {activeEndpoint.title}
                </h3>
                <p className="mt-2 text-muted">{activeEndpoint.description}</p>
                <ul className="mt-6 space-y-3">
                  {activeEndpoint.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 text-green-500" />
                      <span className="text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 overflow-hidden rounded-lg">
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {activeEndpoint.code.trim()}
                  </SyntaxHighlighter>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center mt-8">
              <ScrollLink
                to="booking"
                spy={true}
                smooth={true}
                offset={-70}
                duration={800}
                className="cursor-pointer"
              >
                <button className="inline-flex flex-col items-center px-8 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-accent to-accent-hover hover:shadow-xl hover:-translate-y-0.5">
                  <span className="flex items-center text-lg">
                    Test Our API Live
                  </span>
                  <span className="text-xs font-normal tracking-wider uppercase">
                    Access the Developer Console
                  </span>
                </button>
              </ScrollLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApiEndpointsSection;
