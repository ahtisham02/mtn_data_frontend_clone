import React from "react";
import { motion } from "framer-motion";
import { InlineWidget } from "react-calendly";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const ConsultationSection = () => {
  return (
    <section id="booking" className="relative py-16 bg-white md:py-24">
      <div className="relative z-10 container px-4 mx-auto max-w-7xl">
        <motion.div
          className="text-center text-foreground"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <p className="text-sm font-bold tracking-wider uppercase text-accent">
            Schedule a Consultation
          </p>
          <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
            Ready to Leverage
            <span className="relative inline-block ml-3">
              <span className="absolute md:top-10 top-8 w-[183px] md:w-full h-3 bg-accent/20"></span>
              <span className="relative">Actionable Data?</span>
            </span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-700">
            Schedule a one-on-one call with our experts to see how our API can fuel your projects with powerful, real-time insights.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 overflow-hidden bg-card rounded-2xl shadow-xl border border-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="min-h-[700px]">
            <InlineWidget
              url="https://link.salesdriver.io/widget/booking/sCsG5spjB0z4If0w1JBa"
              styles={{
                height: "724px",
                width: "100%",
              }}
              pageSettings={{
                backgroundColor: "ffffff",
                primaryColor: "3b82f6",
                textColor: "0f172a",
                hideLandingPageDetails: true,
                hideEventTypeDetails: true,
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationSection;