import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  SlidersHorizontal,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Database,
} from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

const features = [
  {
    icon: Globe,
    title: "Public Data Discovery",
    description:
      "Discover people and organizations from a wide range of public sources.",
  },
  {
    icon: SlidersHorizontal,
    title: "Granular Targeting & Filters",
    description:
      "Filter by title, seniority, geography, company size, and industry to find the perfect match.",
  },
  {
    icon: UserCheck,
    title: "Profile & Email Matching",
    description:
      "Confidently match email addresses to their corresponding public profiles.",
  },
  {
    icon: ClipboardList,
    title: "Comprehensive Data Scraping",
    description:
      "Scrape detailed information including bios, activity history, skills, and more.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Activity Tracking",
    description:
      "Track profile updates, posting patterns, and public role changes to stay informed.",
  },
  {
    icon: Database,
    title: "High-Volume Bulk Processing",
    description:
      "Use pagination and dedicated bulk endpoints for high-volume, large-scale jobs.",
  },
];

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section id="features" className="py-16 bg-background md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold tracking-wider uppercase text-accent">
            Features
          </p>
          <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
            What Can You Do with
            <span className="relative inline-block ml-3">
              <span className="absolute top-10 w-full h-3 bg-accent/20"></span>
              <span className="relative">Our API?</span>
            </span>
          </h2>
          <p className="mt-3 text-base font-medium text-gray-600 md:text-lg">
            Skip the scraping. Integrate live role, company, and job data
            directly into your stack.
          </p>
        </div>

        <div className="relative mt-16 group overflow-hidden mask-gradient">
          <motion.div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
            {[...features, ...features].map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveFeature(feature)}
                className="flex items-center flex-shrink-0 gap-3 px-6 py-3 transition-all duration-300 border rounded-full cursor-pointer bg-card border-border hover:bg-accent hover:text-white"
              >
                <feature.icon className="w-5 h-5" />
                <span className="font-semibold">{feature.title}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative mt-8 min-h-[160px] w-full max-w-4xl mx-auto px-8 pt-10 rounded-2xl bg-card shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center md:flex-row md:text-left md:gap-8"
            >
              <div className="flex-shrink-0 p-4 rounded-full bg-accent/10">
                <activeFeature.icon className="w-10 h-10 text-accent" />
              </div>
              <div>
                <p className="mt-2 text-lg text-muted">
                  {activeFeature.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center mt-12">
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
                Power Your Platform with Scalable, Enriched Data
              </span>
              <span className="text-xs font-normal tracking-wider uppercase">
                Get API Access
              </span>
            </button>
          </ScrollLink>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
