import { Fragment } from 'react';

/**
 * Brand rule: Cocogoose numeral glyphs are never used — any run of digits
 * (with common joiners like 50+, 1,000, 2026, 3–5) renders in Montserrat
 * via font-subhead, matching the parent site's "50+ active student builders"
 * treatment.
 */
const NUMBER_RUN = /(\d[\d,.+%–-]*\+?)/g;

const withMontserratNumbers = (text: string, keyPrefix: string) =>
  text.split(NUMBER_RUN).map((chunk, i) =>
    i % 2 === 1 ? (
      // 1.15em: Montserrat numerals run visually smaller than Cocogoose caps,
      // so numbers get a slight bump to match.
      <span key={`${keyPrefix}-${i}`} className="font-subhead font-semibold tracking-[-0.03em] text-[1.15em]">
        {chunk}
      </span>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{chunk}</Fragment>
    )
  );

/**
 * Renders a string where *starred* spans become <b>, and all numbers render
 * in Montserrat (see brand rule above). Used for CMS-editable copy so
 * editors control emphasis without rich text.
 * "50+ people from *Build with ASES*" → Montserrat 50+, bold Build with ASES.
 */
export const Emphasis = ({ text, boldWeight = 700 }: { text: string; boldWeight?: number }) => {
  const parts = text.split('*');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} style={{ fontWeight: boldWeight }}>{withMontserratNumbers(part, `b${i}`)}</b>
        ) : (
          <Fragment key={i}>{withMontserratNumbers(part, `t${i}`)}</Fragment>
        )
      )}
    </>
  );
};
