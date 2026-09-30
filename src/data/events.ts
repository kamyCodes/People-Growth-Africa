export type EventType = 'webinar' | 'mentorship' | 'workshop';

export interface EventSpeaker {
  name: string;
  title: string;
  organization: string;
  avatar?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: EventType;
  typeLabel: string;
  date: string;
  isoDate: string;
  time: string;
  duration: string;
  format: string;
  description: string;
  detailedAgenda?: string[];
  learningOutcomes: string[];
  targetAudience: string;
  speaker: EventSpeaker;
  seatsTotal: number;
  seatsRemaining: number;
  price: string;
  featured?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export const eventCategories = [
  { id: 'all', label: 'All Programmes' },
  { id: 'webinar', label: 'Live Webinars' },
  { id: 'mentorship', label: 'Mentorship Cohorts' },
  { id: 'workshop', label: 'Executive Workshops' },
];

export const eventsList: EventItem[] = [
  {
    id: 'ev-1',
    slug: 'nigerian-labour-law-compliance-2026',
    title: 'Navigating Nigerian Labour Law & Statutory Compliance in 2026',
    subtitle: 'A practical masterclass on contracts, termination risk and statutory employee benefits for African SMEs.',
    type: 'webinar',
    typeLabel: 'Live Webinar',
    date: 'Thursday, March 19, 2026',
    isoDate: '2026-03-19',
    time: '2:00 PM – 3:30 PM WAT',
    duration: '90 Minutes',
    format: 'Live Interactive Webinar (Google Meet / Zoom)',
    description: 'Running a business in Nigeria means keeping up with complex labour rules, tax filings and industrial relations. This live webinar walks through the compliance gaps that most often lead to litigation and fines, and how to close them.',
    detailedAgenda: [
      'Making employment contracts and probation clauses safe',
      'Statutory deductions: PAYE, the Pension Reform Act, NSITF and ITF',
      'Disciplining and dismissing staff without triggering an unlawful dismissal claim',
      'Live Q&A, plus a statutory compliance checklist to take away',
    ],
    learningOutcomes: [
      'A framework for auditing your Nigerian employment contracts',
      'A step-by-step guide to managing employee exits safely',
      'A checklist of the statutory filings that carry penalties if you miss them',
    ],
    targetAudience: 'Business Founders, Managing Directors, HR Managers, and In-House Legal Counsel',
    speaker: {
      name: 'Adewale Adeleke',
      title: 'Senior Partner, Regulatory & Compliance',
      organization: 'People Growth Africa',
    },
    seatsTotal: 150,
    seatsRemaining: 24,
    price: 'Free to attend',
    featured: true,
    status: 'upcoming',
  },
  {
    id: 'ev-2',
    slug: 'hr-leaders-mentorship-cohort-q2',
    title: 'People Leadership Accelerator: 6-Week Mentorship Cohort',
    subtitle: 'Six weeks of peer mentorship and practical advice for the one person holding HR together in a growing business.',
    type: 'mentorship',
    typeLabel: 'Mentorship Cohort',
    date: 'April 6 – May 18, 2026',
    isoDate: '2026-04-06',
    time: 'Saturdays, 11:30 AM – 1:30 PM WAT',
    duration: '6 Weeks (Bi-weekly Sessions + 1-on-1)',
    format: 'Cohort Mastermind & 1-on-1 Advisory Clinics',
    description: 'If you are the only HR person in the business, you spend most of your week firefighting. This six-week cohort gives you the frameworks, templates and coaching to work on the business, not just in it.',
    detailedAgenda: [
      'Week 1–2: Designing organisational grades and job architecture',
      'Week 3–4: OKRs and appraisals your managers will actually use',
      'Week 5: Pay and reward structures that hold up in a volatile market',
      'Week 6: Building culture and winning over your leadership team',
    ],
    learningOutcomes: [
      'Job descriptions, grading frameworks and KPI templates you can use straight away',
      'Private coaching sessions with PGA partners every two weeks',
      'Access to a private network of African HR leaders, plus our resource library',
    ],
    targetAudience: 'Solo HR Managers, Heads of People, and Operations Directors',
    speaker: {
      name: 'Folashade Balogun',
      title: 'Head of Organisational Design & Advisory',
      organization: 'People Growth Africa',
    },
    seatsTotal: 20,
    seatsRemaining: 6,
    price: 'Application required',
    featured: true,
    status: 'upcoming',
  },
  {
    id: 'ev-3',
    slug: 'agribusiness-workforce-optimization',
    title: 'Agribusiness Workforce Planning: Managing Seasonal and Permanent Staff',
    subtitle: 'Payroll, field supervisors, labour compliance and productivity systems for agricultural businesses.',
    type: 'webinar',
    typeLabel: 'Live Webinar',
    date: 'Wednesday, April 15, 2026',
    isoDate: '2026-04-15',
    time: '3:00 PM – 4:30 PM WAT',
    duration: '90 Minutes',
    format: 'Live Interactive Session & Case Study Breakdown',
    description: 'Agribusinesses face unique people challenges: extreme seasonality, remote farm workers, high turnover and field labour relations. Learn how structured HR turns an unpredictable field team into a dependable operation.',
    detailedAgenda: [
      'Structuring contracts for seasonal workers versus permanent farm supervisors',
      'Incentive and performance pay for outgrowers and processing teams',
      'Health, safety and rural community relations',
      'Real-world agribusiness transformation case studies',
    ],
    learningOutcomes: [
      'Seasonal labour contract templates you can adapt',
      'Pay structures linked to what your farm actually produces',
      'A way to assess and reduce workforce risk on your farms',
    ],
    targetAudience: 'Agribusiness CEOs, Farm Estate Managers, and Agro-processing Operations Leads',
    speaker: {
      name: 'Babajide Ogundele',
      title: 'Practice Lead, Agribusiness & Enterprise Development',
      organization: 'People Growth Africa',
    },
    seatsTotal: 120,
    seatsRemaining: 41,
    price: 'Free to attend',
    featured: false,
    status: 'upcoming',
  },
  {
    id: 'ev-4',
    slug: 'executive-okr-performance-masterclass',
    title: 'Building OKR & Performance Systems That Drive Revenue',
    subtitle: 'An executive workshop on connecting everyday work to company-wide objectives in a fast-moving environment.',
    type: 'workshop',
    typeLabel: 'Executive Workshop',
    date: 'Saturday, May 2, 2026',
    isoDate: '2026-05-02',
    time: '12:00 PM – 3:00 PM WAT',
    duration: '3 Hours Intensive',
    format: 'Executive Virtual Workshop + Interactive Workbook',
    description: 'Most annual reviews measure what already happened. In this hands-on workshop, leadership teams learn to set quarterly objectives and key results (OKRs) that run all the way from board goals to frontline work.',
    detailedAgenda: [
      'What makes OKRs work, and where they beat traditional KPIs',
      'Connecting priorities across departments',
      'Weekly check-ins and quarterly reviews that stay useful',
      'A hands-on OKR drafting clinic for your organisation',
    ],
    learningOutcomes: [
      'A customised OKR framework you can use immediately',
      'A manager playbook for ongoing feedback',
      'Guidelines for calibrating performance and linking it to pay',
    ],
    targetAudience: 'C-Suite Executives, Founders, and Department Heads',
    speaker: {
      name: 'Ngozi Chukwuma',
      title: 'Executive Advisory Partner',
      organization: 'People Growth Africa',
    },
    seatsTotal: 40,
    seatsRemaining: 11,
    price: 'Executive pass available',
    featured: false,
    status: 'upcoming',
  },
  {
    id: 'ev-5',
    slug: 'founders-people-mentorship-circle',
    title: 'Founders People Circle: Building Culture from Day 1 to Series A',
    subtitle: 'Exclusive monthly mentorship roundtable for African startup founders and scale-up executives.',
    type: 'mentorship',
    typeLabel: 'Mentorship Cohort',
    date: 'Last Saturday of Every Month',
    isoDate: '2026-05-30',
    time: '1:00 PM – 3:00 PM WAT',
    duration: 'Monthly Ongoing Circle',
    format: 'Private Executive Roundtable (Hybrid: Apapa Lagos + Zoom)',
    description: 'A confidential forum for startup founders and chief executives to discuss leadership hurdles, executive hiring, equity structures, founder conflict resolution, and institutional culture building.',
    detailedAgenda: [
      'Navigating executive co-founder dynamics and equity vesting',
      'Hiring your first 20 employees: Avoiding early cultural dilution',
      'Compensation benchmarking in high-inflation African economies',
      'Open floor peer problem-solving clinic',
    ],
    learningOutcomes: [
      'Direct feedback on active internal people challenges',
      'Peer benchmarking data across West and East African startups',
      'Quarterly executive leadership assessment',
    ],
    targetAudience: 'Tech Founders, Early-Stage CEOs, and Managing Partners',
    speaker: {
      name: 'Adewale Adeleke',
      title: 'Senior Partner, People Strategy',
      organization: 'People Growth Africa',
    },
    seatsTotal: 15,
    seatsRemaining: 3,
    price: 'Invitation / Application Only',
    featured: true,
    status: 'upcoming',
  },
];
