import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

import img1 from "../../assets/img/1.png";
import img2 from "../../assets/img/2.png";
import img3 from "../../assets/img/3.png";
import img4 from "../../assets/img/4.png";
import img5 from "../../assets/img/5.png";
import img6 from "../../assets/img/6.png";

const tools = [
  {
    category: "Conversational AI",
    brand: "NexusQuery",
    title: "AI Chat Assistant",
    description:
      "Ask questions about any company, person, or industry and get structured results.",
    image: img1,
    accentClass: "bg-green-500",
  },
  {
    category: "Data Enhancement",
    brand: "DataRefine",
    title: "Profile Optimizer",
    description: "Get AI suggestions to improve profile data structure.",
    image: img2,
    accentClass: "bg-teal-500",
  },
  {
    category: "Automated Writing",
    brand: "AutoScribe",
    title: "Magic Pen Generator",
    description: "Auto-write summaries, bios, or outreach blurbs.",
    image: img3,
    accentClass: "bg-cyan-500",
  },
  {
    category: "Data Intelligence",
    brand: "ClarityEngine",
    title: "Insight Engine",
    description:
      "Surface hidden insights from public activity, trends, and intent signals.",
    image: img4,
    accentClass: "bg-sky-500",
  },
  {
    category: "Market Analysis",
    brand: "StratoScope",
    title: "Market Explorer",
    description:
      "Visualize hiring trends, industry shifts, and team expansions.",
    image: img5,
    accentClass: "bg-indigo-500",
  },
  {
    category: "Automated Outreach",
    brand: "EngageBot",
    title: "Message Composer",
    description:
      "Auto-generate cold emails or intro messages from scraped data.",
    image: img6,
    accentClass: "bg-purple-500",
  },
];

const ToolCard = ({ tool }) => (
  <div className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_31.5%] min-w-0 px-3">
    <div className="flex flex-col h-full overflow-hidden text-center transition-all duration-300 bg-white border rounded-2xl border-border hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`w-full py-2 text-sm font-bold text-white ${tool.accentClass}`}
      >
        {tool.category}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <div className="pb-4 mb-4 border-b border-border">
          <img
            src={tool.image}
            alt={tool.title}
            className="object-contain w-full h-32 mx-auto"
          />
        </div>
        <div className="flex flex-col flex-grow text-left">
          <p className="text-sm text-muted">{tool.brand}</p>
          <h3 className="mt-1 text-xl font-bold text-foreground">
            {tool.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted flex-grow">
            {tool.description}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AiToolsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="aitools" className="py-16 bg-card md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold tracking-wider uppercase text-accent">
            AI TOOLS FOR DATA INSIGHTS
          </p>
          <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
            AI Tools for
            <span className="relative inline-block ml-3">
              <span className="absolute w-[135px] md:w-full md:top-10 top-8 h-3 bg-accent/20"></span>
              <span className="relative">Smarter Automation</span>
            </span>
          </h2>
          <p className="mt-3 text-base font-medium text-gray-600 md:text-lg">
            Enhance every data call with precision AI tools—built to accelerate
            your workflows.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-3">
              {tools.map((tool) => (
                <ToolCard key={tool.title} tool={tool} />
              ))}
            </div>
          </div>

          <button
            className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-4 p-2 rounded-full bg-white shadow-md hover:bg-accent hover:text-white transition-colors"
            onClick={scrollPrev}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-4 p-2 rounded-full bg-white shadow-md hover:bg-accent hover:text-white transition-colors"
            onClick={scrollNext}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "bg-accent scale-125" : "bg-border"
              }`}
            />
          ))}
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
              <span className="flex leading-tight md:leading-normal items-center text-lg">
                Integrate AI-Powered Enrichment in Minutes
              </span>
              <span className="text-[14px] font-normal pt-1 md:pt-0 tracking-wider uppercase">
                Try AI Tools Now
              </span>
            </button>
          </ScrollLink>
        </div>
      </div>
    </section>
  );
};

export default AiToolsSection;
