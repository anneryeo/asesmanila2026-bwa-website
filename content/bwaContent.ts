/**
 * Fallback content for every CMS-editable piece of the Build with ASES site.
 *
 * Single source of truth when no Sanity project is connected
 * (NEXT_PUBLIC_SANITY_PROJECT_ID unset) or a field is left empty in the
 * Studio. Field names mirror sanity/schemaTypes exactly — same convention
 * as the parent site's content/siteContent.ts.
 */

export interface BwaProject {
  title: string;
  description: string;
  /** next/image-compatible src (local path or Sanity CDN URL) */
  previewImage: string;
  url: string;
  /** BWA episode batch the project was presented in, e.g. "Episode 02" */
  batch: string;
  /** Industry/space the project plays in, e.g. "Fintech" */
  industry: string;
}

export interface FaqNote {
  question: string;
  answer: string;
}

export interface ShipTicket {
  id: string;
  /** Builder's display name */
  name: string;
  /** Optional project the pledge belongs to */
  project?: string;
  /** Episode where the ticket was posted, e.g. "Episode 03". Never changes. */
  episode: string;
  /** The public pledge — what they promise to ship by the next episode */
  pledge: string;
  status: 'pledged' | 'shipped' | 'carried-over';
  /** Episode where it was stamped shipped, if different from where it was pledged */
  shippedEpisode?: string;
  /** How many times the pledge was carried over before shipping (or so far) */
  carriedCount?: number;
  /** Display date, e.g. "Jun 2026" */
  date: string;
}

export interface BwaContent {
  hero: {
    /** *starred* span renders bold (Emphasis) */
    heading: string;
    subheading: string;
  };
  manifesto: {
    /** "Build like ___" slot-machine endings. Keep each short so the line stays on one line. */
    adjectives: string[];
    /** "Build even if you're ___" slot-machine endings */
    actions: string[];
    /** "Build cause ___" slot-machine endings */
    purposes: string[];
  };
  projects: {
    /** Single-line heading, aligned with the see-more button. *Starred* spans render bold. */
    heading: string;
    items: BwaProject[];
  };
  faq: {
    heading: string;
    items: FaqNote[];
  };
  /** Single-line heading for the home page's top-5 ship ticket preview, aligned with its see-more button. */
  ticketsHeading: string;
  shipTickets: ShipTicket[];
}

export const FALLBACK_CONTENT: BwaContent = {
  hero: {
    heading: "Where *students* show what they're building",
    subheading:
      'Twice a month, ASES Manila fills a room with founders, operators, and builders, then hands students the mic.',
  },

  // "Build like (adjective) / Build even if you're (action) / Build cause (purpose)"
  // Every ending is short enough that each line holds on ONE line at the
  // manifesto's font size, even on small screens.
  manifesto: {
    adjectives: [
      'a misfit',
      'you mean it',
      "it's 2am",
      "no one's watching",
    ],
    actions: [
      'scared',
      'not ready',
      'winging it',
      'terrified',
    ],
    purposes: [
      'talk is cheap',
      'the problem is real',
      'no one else will',
      'waiting ships nothing',
    ],
  },

  projects: {
    heading: 'Every project here started as a shaky pitch in the *BWA* room.',
    // Placeholder cards until real projects land in Sanity. Batches map to
    // BWA episode runs; industries drive the see-more filter.
    items: [
      {
        title: 'Your project here',
        description: 'Empty slot, waiting on you. Show up to Build with ASES, ship something real, and we\'ll put it right here.',
        previewImage: '/images/bwa/bwa-03.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 01',
        industry: 'Up for grabs',
      },
      {
        title: 'The next big thing',
        description: 'Every card in this row started as a shaky pitch in a BWA room. Somebody\'s about to be next, might as well be you.',
        previewImage: '/images/bwa/bwa-05.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 01',
        industry: 'Up for grabs',
      },
      {
        title: 'Built from scratch',
        description: 'No credentials, no head start, just a rough idea, a room that tells the truth, and the stubbornness to keep going anyway.',
        previewImage: '/images/bwa/bwa-07.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 02',
        industry: 'Up for grabs',
      },
      {
        title: 'A tool you\'ll steal',
        description: 'Half the room said "I\'d use that tomorrow." The other half asked how it makes money. Both questions got answered.',
        previewImage: '/images/bwa/bwa-02.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 02',
        industry: 'Productivity',
      },
      {
        title: 'The 2am special',
        description: 'Started as a class project, survived three brutal feedback rounds, and now it has actual users. That\'s the pipeline.',
        previewImage: '/images/bwa/bwa-04.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 02',
        industry: 'EdTech',
      },
      {
        title: 'Problem hunt loot',
        description: 'Found the problem on a problem-hunt night, shipped the fix by the next episode. Ship ticket: honored.',
        previewImage: '/images/bwa/bwa-06.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 03',
        industry: 'Community',
      },
      {
        title: 'Proof it works',
        description: 'The pitch was shaky. The build wasn\'t. Sometimes the demo does the talking and the room just nods.',
        previewImage: '/images/bwa/bwa-08.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 03',
        industry: 'Fintech',
      },
      {
        title: 'Version two energy',
        description: 'Got wrecked at episode two, came back at episode three with the fix. That\'s the whole point of the room.',
        previewImage: '/images/bwa/bwa-09.webp',
        url: 'https://buildwithases.asesmanila.com/application',
        batch: 'Episode 03',
        industry: 'Health',
      },
    ],
  },

  faq: {
    heading: 'Questions we actually get.',
    items: [
      {
        question: 'What exactly is Build with ASES?',
        answer:
          'A twice-a-month builder session run by ASES Manila. One night we go hunting for real problems worth solving; the next, you stand up and show what you actually built. A room full of founders, operators, and fellow builders tells you the truth about it. That\'s the whole event.',
      },
      {
        question: 'Do I need to apply? Is this the same as joining ASES?',
        answer:
          'There\'s an application, but it\'s not membership. Different thing entirely. You\'re applying for a seat in the room at a standing event, not applying to join a club. Fill the form, pick a session, show up.',
      },
      {
        question: 'Who\'s allowed in the room?',
        answer:
          'Anyone. Free if you\'re an ASES member, a small door fee if you\'re not. Either way you get the same seat and the same brutally useful feedback. Nobody checks your resume at the door.',
      },
      {
        question: 'Do I need a polished product to present?',
        answer:
          'No. A rough prototype, a landing page, even a well-argued idea with zero code. All fair game. We built BWA because most people hide their rough drafts. We\'d rather put them in front of a room that helps make them less rough.',
      },
      {
        question: 'What happens on a problem hunt night?',
        answer:
          'Instead of demos, the room digs for problems actually worth solving in your campus, your city, your industry. You leave with a target and, if you want, a public ship ticket: a pledge of what you\'ll have built by the next episode.',
      },
      {
        question: 'What\'s a ship ticket?',
        answer:
          'A public promise. At any episode you can post one, like "finish my MVP", "get 10 users", or "rebuild the onboarding", and it goes up on this site for everyone to see. Come back next episode and either stamp it shipped or carry it over. Gentle public pressure, the productive kind.',
      },
      {
        question: 'What if I just want to watch?',
        answer:
          'Totally fine. There\'s a watcher track in the application. Watch other builders get tested, meet people shipping the same way you are, and post a ship ticket of your own if the night gets to you.',
      },
      {
        question: 'How do I reach a human?',
        answer:
          'Facebook or Instagram, both @asesmanila, or email asesmanila.team@gmail.com. A real person answers, not a bot.',
      },
    ],
  },

  ticketsHeading: "Say what you'll ship, then come back and prove it.",

  // Dummy tickets until the Sanity shipTicket documents land.
  shipTickets: [
    { id: 'st-01', name: 'Mika R.', project: 'Presyo', episode: 'Episode 03', pledge: 'Finish the MVP and get it in front of 5 sari-sari store owners.', status: 'pledged', date: 'Jun 2026' },
    { id: 'st-02', name: 'Paolo D.', project: 'NotaBene', episode: 'Episode 03', pledge: 'Ship the reviewer-sharing feature my blockmates keep asking for.', status: 'pledged', date: 'Jun 2026' },
    { id: 'st-03', name: 'Ella S.', episode: 'Episode 01', pledge: 'Stop redesigning the landing page and actually launch it.', status: 'shipped', shippedEpisode: 'Episode 03', carriedCount: 1, date: 'May 2026' },
    { id: 'st-04', name: 'JC V.', project: 'Byahe', episode: 'Episode 02', pledge: 'Interview 10 commuters and kill or confirm the idea.', status: 'shipped', date: 'May 2026' },
    { id: 'st-05', name: 'Andrea L.', episode: 'Episode 02', pledge: 'Write the first line of code instead of the tenth business plan.', status: 'carried-over', date: 'May 2026' },
    { id: 'st-06', name: 'Ram G.', project: 'Kita', episode: 'Episode 01', pledge: 'Get one real freelancer to invoice through the prototype.', status: 'shipped', date: 'Apr 2026' },
  ],
};
