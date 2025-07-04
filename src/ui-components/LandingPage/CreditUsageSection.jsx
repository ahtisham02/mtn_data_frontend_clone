import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

// Animation variants remain the same
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const pricingTiers = [
  {
    title: "Basic Data Record",
    cost: "1 token",
  },
  {
    title: "Add-ons (skills, bios, posts)",
    cost: "+0.5 tokens per field",
  },
  {
    title: "AI Features",
    cost: "Varies by tool",
  },
];

const TokenSystemSection = () => {
  return (
    <section className="py-16 bg-white text-black md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div
          className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <p className="text-sm font-bold tracking-wider uppercase text-accent">
              Credit Usage
            </p>
            <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
              Simple &
              <span className="relative inline-block ml-3">
                <span className="absolute md:top-10 top-8 w-full h-3 bg-accent/20"></span>
                <span className="relative">Fair Pricing</span>
              </span>
            </h2>
            <ScrollLink
              to="packages"
              spy={true}
              smooth={true}
              offset={-70}
              duration={800}
              className="cursor-pointer inline-flex items-center gap-2 mt-4 font-semibold transition-colors text-accent hover:text-blue-400"
            >
              Explore our full pricing guide <ArrowRight size={16} />
            </ScrollLink>
          </motion.div>

          <motion.div className="space-y-6" variants={fadeInUp}>
            {pricingTiers.map((item) => (
              <div key={item.title}>
                <div className="flex items-baseline justify-between pb-2 border-b border-slate-700">
                  <h3 className="flex items-center gap-3 sm:text-xl text-lg font-bold">
                    <CheckCircle size={20} className="text-accent" />
                    {item.title}
                  </h3>
                  <p className="font-semibold text-slate-700">{item.cost}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-24 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-foreground">
            <div className="p-3 rounded-full bg-accent/10">
              <ShieldCheck className="w-12 h-12 text-accent" />
            </div>
          </div>
          <div className="p-12 bg-foreground rounded-3xl">
            <p className="text-sm font-bold pt-8 tracking-wider uppercase text-accent">
              Your Data, Protected
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-200">
              Committed to Privacy and Security
            </h3>
            <p className="max-w-xl mx-auto mt-4 text-slate-200">
              The confidentiality of your information is our highest priority.
              Our systems are fully GDPR compliant, and we never retain personal
              data.
            </p>
            <div className="mt-8">
              <ScrollLink
                to="booking"
                spy={true}
                smooth={true}
                offset={-70}
                duration={800}
                className="cursor-pointer"
              >
                <button className="px-8 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-accent hover:bg-accent-hover hover:shadow-xl hover:-translate-y-0.5">
                  Request a Demo →
                </button>
              </ScrollLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TokenSystemSection;
