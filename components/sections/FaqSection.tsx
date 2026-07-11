'use client';

import { motion } from 'framer-motion';
import { Emphasis } from '@/components/ui/Emphasis';
import { FALLBACK_CONTENT, type FaqNote } from '@/content/bwaContent';

const easeOut = [0.22, 1, 0.36, 1] as const;

// Sticky-note palette: vivid brand red and blue notes with white text,
// slapped on the white blueprint. Each note rests at a slight tilt;
// hovering skirts it (lifts + straightens toward the other side).
const NOTE_STYLES = [
  { bg: '#D33C24', edge: '#9A2917', tilt: -1.4 },  // vivid red
  { bg: '#2B4BD1', edge: '#112F7F', tilt: 1.2 },   // vivid blue
  { bg: '#D33C24', edge: '#9A2917', tilt: 1.6 },   // vivid red
  { bg: '#2B4BD1', edge: '#112F7F', tilt: -1.1 },  // vivid blue
] as const;

// Every question AND answer is always in the DOM and always visible —
// crawlers index the full text, and FAQPage JSON-LD reinforces it.
export const FaqSection = ({
  heading = FALLBACK_CONTENT.faq.heading,
  items = FALLBACK_CONTENT.faq.items,
}: {
  heading?: string;
  items?: FaqNote[];
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <section
      id="faqs"
      data-nav-theme="light"
      className="bwa-surface relative flex w-full justify-center overflow-hidden px-[24px] py-[80px] sm:px-[40px] lg:px-[80px] lg:py-[96px]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative z-10 w-full max-w-[1040px]">

        {/* Section header */}
        <motion.div
          className="mb-[56px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <p className="mb-3 font-subhead text-[13px] font-normal uppercase tracking-[0.18em] text-navy-700 opacity-70">
            FAQ
          </p>
          <h2 className="m-0 font-display text-[clamp(26px,4vw,40px)] font-[350] leading-none tracking-[-0.02em] text-[#071F6B]">
            {heading}
          </h2>
        </motion.div>

        {/* Sticky-note Q&A grid */}
        <div className="grid grid-cols-1 items-start gap-[28px] md:grid-cols-2">
          {items.map(({ question, answer }, i) => {
            const note = NOTE_STYLES[i % NOTE_STYLES.length];
            return (
              <motion.div
                key={question}
                initial={{ opacity: 0, y: 16, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: note.tilt }}
                viewport={{ once: true }}
                whileHover={{ rotate: -note.tilt * 0.8, y: -8, scale: 1.015 }}
                whileTap={{ rotate: -note.tilt * 0.8, scale: 0.99 }}
                transition={{ duration: 0.35, ease: easeOut, delay: (i % 2) * 0.05 }}
                className="rounded-none px-[26px] pb-[26px] pt-[30px] shadow-[0_14px_36px_rgba(7,31,107,0.14)]"
                style={{ background: note.bg, borderTop: `10px solid ${note.edge}` }}
              >
                <h3 className="m-0 font-display text-[clamp(15px,2vw,18px)] font-[350] leading-[1.3] tracking-[-0.01em] text-white">
                  <Emphasis text={question} />
                </h3>
                <p className="mb-0 mt-3 font-body text-[clamp(14px,1.7vw,16px)] font-normal leading-[1.65] text-[rgba(255,255,255,0.92)]">
                  {answer}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
