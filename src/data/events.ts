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
  { id: 'all', label: 'All Programs' },
  { id: 'webinar', label: 'Live Webinars' },
  { id: 'mentorship', label: 'Mentorship Cohorts' },
  { id: 'workshop', label: 'Executive Workshops' },
];

export const eventsList: EventItem[] = [
  {
    id: 'ev-1',
    slug: 'nigerian-labour-law-compliance-2026',
    title: 'Navigating Nigerian Labour Law & Statutory Compliance in 2026',
    subtitle: 'A practical masterclass on contract structures, termination liabilities, and statutory employee benefits for African SMEs.',
    type: 'webinar',
    typeLabel: 'Live Webinar',
    date: 'Thursday, March 19, 2026',
    isoDate: '2026-03-19',
    time: '2:00 PM – 3:30 PM WAT',
    duration: '90 Minutes',
    format: 'Live Interactive Webinar (Google Meet / Zoom)',
    description: 'Operating in Nigeria requires navigating complex labour regulations, tax compliances, and industrial relations. This live executive webinar breaks down the critical compliance traps that expose growth-stage companies to costly litigation and regulatory fines.',
    detailedAgenda: [
      'De-risking employment contracts and probation clauses',
      'Statutory deductions: PAYE, Pension Reform Act, NSITF, and ITF guidelines',
      'Disciplining and terminating staff without triggering unlawful dismissal claims',
      'Interactive Q&A and statutory checklist distribution',
    ],
    learningOutcomes: [
      'Comprehensive audit framework for Nigerian employment contracts',
      'Step-by-step risk mitigation guide for employee separations',
      'Checklist of statutory compliance filings to avoid penal liabilities',
    ],
    targetAudience: 'Business Founders, Managing Directors, HR Managers, and In-House Legal Counsel',
    speaker: {
      name: 'Adewale Adeleke',
      title: 'Senior Partner, Regulatory & Compliance',
      organization: 'People Growth Africa',
    },
    seatsTotal: 150,
    seatsRemaining: 24,
    price: 'Complimentary Access',
    featured: true,
    status: 'upcoming',
  },
  {
    id: 'ev-2',
    slug: 'hr-leaders-mentorship-cohort-q2',
    title: 'People Leadership Accelerator: 6-Week Mentorship Cohort',
    subtitle: 'Intensive peer mentorship and tactical advisory for solo HR managers and People Operations leads scaling businesses to 100+ headcount.',
    type: 'mentorship',
    typeLabel: 'Mentorship Cohort',
    date: 'April 6 – May 18, 2026',
    isoDate: '2026-04-06',
    time: 'Saturdays, 11:30 AM – 1:30 PM WAT',
    duration: '6 Weeks (Bi-weekly Sessions + 1-on-1)',
    format: 'Cohort Mastermind & 1-on-1 Advisory Clinics',
    description: 'Moving from reactive administrative firefighting to strategic people leadership is the single highest leverage upgrade an HR lead can make. This 6-week cohort provides structured mentorship, practical templates, and direct coaching from veteran African people leaders.',
    detailedAgenda: [
      'Week 1-2: Designing Organizational Grading & Job Architecture',
      'Week 3-4: OKR Implementation & Performance Appraisals that Work',
      'Week 5: Total Rewards & Compensation Structuring in Volatile Markets',
      'Week 6: Culture Architecture & Executive Stakeholder Buy-in',
    ],
    learningOutcomes: [
      'Ready-to-deploy job descriptions, grading frameworks, and KPI templates',
      'Bi-weekly private 1-on-1 executive coaching sessions with PGA Partners',
      'Access to private African HR Leaders Network and resource library',
    ],
    targetAudience: 'Solo HR Managers, Heads of People, and Operations Directors',
    speaker: {
      name: 'Folashade Balogun',
      title: 'Head of Organizational Design & Advisory',
      organization: 'People Growth Africa',
    },
    seatsTotal: 20,
    seatsRemaining: 6,
    price: 'Application Required',
    featured: true,
    status: 'upcoming',
  },
  {
    id: 'ev-3',
    slug: 'agribusiness-workforce-optimization',
    title: 'Agribusiness Workforce Architecture: Seasonal & Permanent People Operations',
    subtitle: 'Structuring payroll, field supervisors, labor compliance, and productivity systems across agricultural enterprises.',
    type: 'webinar',
    typeLabel: 'Live Webinar',
    date: 'Wednesday, April 15, 2026',
    isoDate: '2026-04-15',
    time: '3:00 PM – 4:30 PM WAT',
    duration: '90 Minutes',
    format: 'Live Interactive Session & Case Study Breakdown',
    description: 'Agribusinesses face unique people challenges: extreme seasonality, remote farm workforce dispersion, high turnover, and field labor relations. Learn how structured HR architectures convert volatile field teams into dependable operational engines.',
    detailedAgenda: [
      'Structuring contracts for seasonal casuals vs permanent farm supervisors',
      'Incentive and performance pay designs for outgrowers and processing teams',
      'Health, safety, and rural community stakeholder management',
      'Real-world agribusiness transformation case studies',
    ],
    learningOutcomes: [
      'Model seasonal labor contract templates',
      'Productivity-linked compensation blueprints for farm operations',
      'Risk assessment matrix for agricultural workforce retention',
    ],
    targetAudience: 'Agribusiness CEOs, Farm Estate Managers, and Agro-processing Operations Leads',
    speaker: {
      name: 'Babajide Ogundele',
      title: 'Practice Lead, Agribusiness & Enterprise Development',
      organization: 'People Growth Africa',
    },
    seatsTotal: 120,
    seatsRemaining: 41,
    price: 'Complimentary Access',
    featured: false,
    status: 'upcoming',
  },
  {
    id: 'ev-4',
    slug: 'executive-okr-performance-masterclass',
    title: 'Building OKR & Performance Systems That Drive Revenue',
    subtitle: 'Executive workshop on aligning daily tasks with company-wide strategic objectives in high-pace environments.',
    type: 'workshop',
    typeLabel: 'Executive Workshop',
    date: 'Saturday, May 2, 2026',
    isoDate: '2026-05-02',
    time: '12:00 PM – 3:00 PM WAT',
    duration: '3 Hours Intensive',
    format: 'Executive Virtual Workshop + Interactive Workbook',
    description: 'Most annual reviews fail because they measure past activity instead of driving forward momentum. In this hands-on workshop, leadership teams learn how to deploy quarterly Objectives and Key Results (OKRs) that cascade seamlessly from board goals to frontline teams.',
    detailedAgenda: [
      'The anatomy of effective OKRs vs traditional KPIs',
      'Cascading strategic priorities across cross-functional departments',
      'Running effective weekly check-ins and quarterly retrospective reviews',
      'Hands-on OKR drafting clinic for participating organizations',
    ],
    learningOutcomes: [
      'Customized OKR framework ready for immediate deployment',
      'Manager coaching playbook for quarterly continuous feedback',
      'Performance calibration guidelines and compensation linkages',
    ],
    targetAudience: 'C-Suite Executives, Founders, and Department Heads',
    speaker: {
      name: 'Ngozi Chukwuma',
      title: 'Executive Advisory Partner',
      organization: 'People Growth Africa',
    },
    seatsTotal: 40,
    seatsRemaining: 11,
    price: 'Executive Pass Available',
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
