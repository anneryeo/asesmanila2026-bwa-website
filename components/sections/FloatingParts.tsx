'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/**
 * The global field of hovering Ace parts. Rendered ONCE from page.tsx as an
 * absolute overlay spanning the hero AND the Build with ASES manifesto, so
 * the parts drift seamlessly across both sections instead of belonging to
 * either. Section content sits at z-10; this overlay sits at z-[1], above
 * the section backgrounds but under everything readable.
 *
 * `top` is a percentage of the COMBINED hero+manifesto height.
 */
const PARTS = [
  // Left rail, top to bottom
  { src: '/images/ace-parts_1.png', side: 'left', top: '6%', width: 'clamp(140px, 19vw, 340px)', rotate: -8, drift: 14, duration: 5.2, parallax: -50, flip: false },
  { src: '/images/ace-parts_3.png', side: 'left', top: '27%', width: 'clamp(90px, 12vw, 210px)', rotate: 12, drift: 10, duration: 4.1, parallax: -90, flip: false },
  { src: '/images/ace-parts_2.png', side: 'left', top: '48%', width: 'clamp(120px, 15vw, 270px)', rotate: 6, drift: 12, duration: 4.8, parallax: -40, flip: true },
  { src: '/images/ace-parts_4.png', side: 'left', top: '70%', width: 'clamp(100px, 13vw, 230px)', rotate: -11, drift: 15, duration: 5.6, parallax: -70, flip: false },
  { src: '/images/ace-parts_3.png', side: 'left', top: '88%', width: 'clamp(70px, 9vw, 150px)', rotate: -18, drift: 9, duration: 3.9, parallax: -55, flip: true },
  // Right rail, top to bottom
  { src: '/images/ace-parts_2.png', side: 'right', top: '9%', width: 'clamp(130px, 17vw, 300px)', rotate: 7, drift: 12, duration: 4.7, parallax: -70, flip: false },
  { src: '/images/ace-parts_4.png', side: 'right', top: '30%', width: 'clamp(110px, 14vw, 250px)', rotate: -9, drift: 16, duration: 5.8, parallax: -35, flip: false },
  { src: '/images/ace-parts_1.png', side: 'right', top: '52%', width: 'clamp(140px, 18vw, 320px)', rotate: 10, drift: 13, duration: 5.0, parallax: -85, flip: true },
  { src: '/images/ace-parts_3.png', side: 'right', top: '74%', width: 'clamp(90px, 11vw, 190px)', rotate: 16, drift: 10, duration: 4.3, parallax: -60, flip: false },
  { src: '/images/ace-parts_4.png', side: 'right', top: '90%', width: 'clamp(80px, 10vw, 170px)', rotate: -14, drift: 11, duration: 4.6, parallax: -45, flip: true },
] as const;

export const FloatingParts = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: overlayRef, offset: ['start end', 'end start'] });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={overlayRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] hidden md:block">
      {PARTS.map((part, i) => (
        <FloatingPart key={`${part.src}-${i}`} part={part} progress={scrollYProgress} reduceMotion={!!reduceMotion} />
      ))}
    </div>
  );
};

function FloatingPart({
  part,
  progress,
  reduceMotion,
}: {
  part: (typeof PARTS)[number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Slow upward parallax as the combined section scrolls through the viewport.
  const y = useTransform(progress, [0, 1], [0, part.parallax]);

  return (
    <motion.div
      className="absolute"
      style={{
        top: part.top,
        width: part.width,
        y: reduceMotion ? 0 : y,
        // Parts bleed off-screen so text keeps the room, especially on mobile.
        ...(part.side === 'left'
          ? { left: 'clamp(-72px, -4vw, -16px)' }
          : { right: 'clamp(-72px, -4vw, -16px)' }),
      }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -part.drift, 0], rotate: [part.rotate, part.rotate + 3, part.rotate] }}
        transition={{ duration: part.duration, ease: 'easeInOut', repeat: Infinity }}
        style={{ rotate: part.rotate }}
      >
        <Image
          src={part.src}
          alt=""
          width={600}
          height={600}
          sizes="340px"
          style={{
            width: '100%',
            height: 'auto',
            transform: part.flip ? 'scaleX(-1)' : undefined,
            filter: 'drop-shadow(0 18px 36px rgba(12,20,63,0.18))',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
