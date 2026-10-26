// TRCSL - UOR ICT Volunteer Programme 2025: typed data for the TrcslTimeline section.
// Kept outside seed.json on purpose (no schema change). Sources for every fact:
//   - Programme name, partners, 15 / 18 Aug 2025 sessions: the training posters (training/01, 02).
//   - Role, Sep - Dec 2025, Mullaitivu, curriculum/lab claims: the owner's CV (public/Resume).
//   - Ceremony name and organisers: the banner on the ceremony photos (awarding-ceremony/*).
// Anything else is described only as far as the photos visibly show it.

export interface TrcslPhoto {
  src: string;
  /** Describes what is visible, for screen readers. */
  alt: string;
  /** Short caption shown in the lightbox header. */
  caption?: string;
}

export interface TrcslStage {
  id: string;
  /** Short kicker above the title, e.g. "Training". */
  label: string;
  title: string;
  /** Human-readable period; omitted when not verified. */
  period?: string;
  /** Machine-readable start for <time dateTime>, e.g. "2025-08". */
  periodStart?: string;
  place?: string;
  description: string;
  highlights?: string[];
  /** Index into `photos` used as the large cover image (default 0). */
  cover?: number;
  photos: TrcslPhoto[];
}

export interface TrcslTimelineData {
  title: string;
  lead: string;
  organization: string;
  stages: TrcslStage[];
}

const T = '/activities/trcsl/training';
const W = '/activities/trcsl/working';
const A = '/activities/trcsl/awarding-ceremony';

export const TRCSL_TIMELINE: TrcslTimelineData = {
  title: 'TRCSL ICT Volunteer Programme',
  lead:
    'Training, a school placement and certification under the TRCSL – UOR ICT Volunteer Programme 2025, run by the Telecommunications Regulatory Commission of Sri Lanka with the Ministry of Education and the Faculty of Engineering, University of Ruhuna.',
  organization: 'Telecommunications Regulatory Commission of Sri Lanka (TRCSL)',
  stages: [
    {
      id: 'trcsl-training',
      label: 'Training',
      title: 'Volunteer training sessions',
      period: 'Aug 2025',
      periodStart: '2025-08',
      place: 'Faculty of Engineering, University of Ruhuna',
      description:
        'Preparation sessions for the volunteer cohort before going out to schools, with guest speakers from industry on career readiness and the core skills needed for the future of work.',
      highlights: [
        '15 Aug – “Industry Readiness: Future-Proofing Your Career for 2030 & Beyond”',
        '18 Aug – “Core Skills for the Future”',
      ],
      cover: 3,
      photos: [
        {
          src: `${T}/01.jpg`,
          alt: 'Programme poster: TRCSL – UOR ICT Volunteer Programme 2025, session “Industry Readiness: Future-Proofing Your Career for 2030 & Beyond”, 15 August, 8.00 a.m.',
          caption: 'Session poster – 15 August',
        },
        {
          src: `${T}/04.jpg`,
          alt: 'Selfie of the volunteer cohort gathered around a desk in a lecture hall after a training session.',
          caption: 'Cohort photo after a training session',
        },
        {
          src: `${T}/05.jpg`,
          alt: 'A second selfie of the volunteer cohort in the lecture hall.',
          caption: 'Cohort photo after a training session',
        },
        {
          src: `${T}/03.jpg`,
          alt: 'Large group photo of the volunteer cohort with a guest speaker in a lecture hall.',
          caption: 'Volunteer cohort with a guest speaker',
        },
        {
          src: `${T}/02.jpg`,
          alt: 'Programme poster: TRCSL – UOR ICT Volunteer Programme 2025, session “Core Skills for the Future”, 18 August, 8.00 a.m.',
          caption: 'Session poster – 18 August',
        },
      ],
    },
    {
      id: 'trcsl-working',
      label: 'Placement',
      title: 'ICT Teacher & Technical Support',
      period: 'Sep – Nov 2025',
      periodStart: '2025-09',
      place: 'Mullaitivu, Sri Lanka',
      description:
        'Worked with schools in the Mullaitivu area, teaching and supporting their ICT facilities: hands-on lessons where students opened up desktop PCs to learn the parts inside, classroom teaching at the board, and repair work in the computer lab.',
      highlights: [
        'Designed and delivered a digital literacy curriculum for 50+ students.',
        'Took apart, checked and serviced lab desktops, resolving hardware and network issues.',
        'Took part in school life – addressing an assembly and joining a school community event.',
      ],
      cover: 0,
      photos: [
        {
          src: `${W}/06.jpg`,
          alt: 'Pointing out components inside an open desktop computer to a group of students in school uniform.',
          caption: 'Hands-on PC hardware lesson',
        },
        {
          src: `${W}/07.jpg`,
          alt: 'Students with screwdrivers working on an open desktop case while a teacher and a volunteer look on.',
          caption: 'Students taking a PC apart',
        },
        {
          src: `${W}/09.jpg`,
          alt: 'Students crowding around a table during a practical session, with the volunteer explaining.',
          caption: 'Practical session',
        },
        {
          src: `${W}/08.jpg`,
          alt: 'A school computer lab mid-service, with desktop towers on the floor and several cases opened up.',
          caption: 'Computer lab maintenance',
        },
        {
          src: `${W}/10.jpg`,
          alt: 'Wide view of the computer lab with rows of monitors and opened PC cases on the chairs.',
          caption: 'Computer lab maintenance',
        },
        {
          src: `${W}/03.jpg`,
          alt: 'Writing simultaneous equations on a whiteboard in front of a class.',
          caption: 'Classroom teaching',
        },
        {
          src: `${W}/11.jpg`,
          alt: 'Teaching a geometry problem on a blackboard in an open-sided classroom while students take notes.',
          caption: 'Classroom teaching',
        },
        {
          src: `${W}/12.jpg`,
          alt: 'Closer view of the geometry lesson on the blackboard with students writing at their desks.',
          caption: 'Classroom teaching',
        },
        {
          src: `${W}/05.jpg`,
          alt: 'Speaking at a microphone on the school assembly stage.',
          caption: 'Addressing the school assembly',
        },
        {
          src: `${W}/02.jpg`,
          alt: 'Receiving a wrapped gift from a staff member on the school stage, with two other staff members beside them.',
          caption: 'Token of appreciation from the school',
        },
        {
          src: `${W}/01.jpg`,
          alt: 'Group photo of students in white uniforms with staff and volunteers in front of the school building.',
          caption: 'With students and staff',
        },
        {
          src: `${W}/04.jpg`,
          alt: 'Group photo of students, teachers and volunteers beside a large pot cooking over an open fire.',
          caption: 'School community event',
        },
      ],
    },
    {
      id: 'trcsl-ceremony',
      label: 'Recognition',
      title: 'Certificate Awarding Ceremony – ICT Volunteer Programme 2025',
      period: '2025',
      periodStart: '2025',
      place: 'Faculty of Engineering, University of Ruhuna',
      description:
        'A memorable day celebrating the successful completion of the ICT Volunteer Programme 2025, with the certificate awarding ceremony organized by the Telecommunications Regulatory Commission of Sri Lanka at the Faculty of Engineering, University of Ruhuna. Grateful for the opportunity and for the experiences, learning and memories gained throughout the programme.',
      cover: 1,
      photos: [
        {
          src: `${A}/01.jpg`,
          alt: 'Volunteers seated in a lecture hall during the certificate awarding ceremony.',
          caption: 'Volunteers at the ceremony',
        },
        {
          src: `${A}/02.jpg`,
          alt: 'A certificate being handed over at the front of the hall during the ceremony.',
          caption: 'Certificate presentation',
        },
        {
          src: `${A}/03.jpg`,
          alt: 'Group photo of the volunteers with officials and faculty members in the lecture hall.',
          caption: 'Volunteers with officials and faculty',
        },
        {
          src: `${A}/04.jpg`,
          alt: 'Selfie of four volunteers after the ceremony, one holding a TRCSL certificate.',
          caption: 'With fellow volunteers after the ceremony',
        },
      ],
    },
  ],
};
