import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const ConsultationSection = () => {
  const [selectedDuration, setSelectedDuration] = useState("15min");

  const calLinks = {
    "15min": import.meta.env.VITE_CAL_15MIN || "https://cal.com/ahtisham/15min",
    "30min": import.meta.env.VITE_CAL_30MIN || "https://cal.com/ahtisham/30min",
    "secret": import.meta.env.VITE_CAL_SECRET || "https://cal.com/ahtisham/secret",
  };

  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

        {/* Duration Selection Tabs */}
        <motion.div
          className="flex justify-center gap-4 mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <button
            onClick={() => setSelectedDuration("15min")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDuration === "15min"
                ? "bg-accent text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            15 Minutes
          </button>
          <button
            onClick={() => setSelectedDuration("30min")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDuration === "30min"
                ? "bg-accent text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            30 Minutes
          </button>
          <button
            onClick={() => setSelectedDuration("secret")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDuration === "secret"
                ? "bg-accent text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Secret Meeting
          </button>
        </motion.div>

        <motion.div
          className="mt-12 overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="min-h-[700px] bg-white">
            <iframe
              src={`${calLinks[selectedDuration]}?embed=true&theme=light&hideEventTypeDetails=false`}
              width="100%"
              height="724px"
              style={{ 
                border: 0,
                backgroundColor: '#ffffff',
                colorScheme: 'light'
              }}
              title="Book a consultation"
              allow="payment"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationSection;