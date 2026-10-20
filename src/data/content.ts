export interface ServicePrimary {
  id: string;
  title: string;
  badgeColor: 'navy' | 'purple' | 'scarlet';
  description: string;
  scope: string[];
  placeholderLabel: string;
}

export interface SecondaryService {
  id: string;
  title: string;
  description: string;
}

export interface CredentialShield {
  id: string;
  name: string;
  fullTitle: string;
  badgeColor: 'navy' | 'purple' | 'scarlet';
  description: string;
  regPlaceholder: string;
}

export const siteContent = {
  company: {
    legalName: 'Yacht Properties (Pty) Ltd',
    shortName: 'Yacht Properties',
    slogan: 'We are You',
    summary: 'South African property and construction specialists built on stewardship, integrity, and enduring community value.',
    phone: '063 759 0216',
    phoneTel: '0637590216',
    email: 'sam@yachtmaripane.co.za',
    address: 'Falcon Haven, Terenure, 1619',
    city: 'Kempton Park, Gauteng',
    country: 'South Africa',
    hours: 'Monday to Friday: 08:00 - 17:00',
  },
  
  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Credentials', href: '#credentials' },
    { label: 'Contact', href: '#contact' },
  ],

  purpose: {
    title: 'Our Purpose',
    quote: "Stewardship for God's provision to the people less blessed than me.",
    narrative: 'We view property development and asset management not as transactions, but as a solemn trust. Every brick laid and every home managed reflects our commitment to dignity, honest service, and long-term community upliftment across South Africa.',
  },

  primaryServices: [
    {
      id: 'construction',
      title: 'Construction',
      badgeColor: 'navy',
      description: 'Turnkey structural building, commercial fit-outs, residential developments, and general contracting built with disciplined workmanship.',
      scope: [
        'Civil works and structural builds',
        'Residential and commercial contracting',
        'Quality assurance and site supervision',
      ],
      placeholderLabel: 'Photo placeholder: Construction works',
    },
    {
      id: 'property-management',
      title: 'Property Management',
      badgeColor: 'purple',
      description: 'End-to-end administration, facilities maintenance, tenant retention, and financial oversight for private and commercial assets.',
      scope: [
        'Comprehensive facilities upkeep',
        'Lease administration and collections',
        'Asset preservation and tenant care',
      ],
      placeholderLabel: 'Photo placeholder: Property operations',
    },
    {
      id: 'real-estate-services',
      title: 'Real Estate Services',
      badgeColor: 'scarlet',
      description: 'Strategic property acquisitions, sales advisory, leasing representation, and professional valuation alignment for buyers and investors.',
      scope: [
        'Residential and commercial sales',
        'Property leasing and advisory',
        'Portfolio placement and market guidance',
      ],
      placeholderLabel: 'Photo placeholder: Real estate advisory',
    },
  ] as ServicePrimary[],

  secondaryServices: [
    { id: 'investment', title: 'Property Investment', description: 'Capital structuring and strategic asset placement.' },
    { id: 'commercial', title: 'Commercial & Retail', description: 'Retail hubs, office parks, and business premises.' },
    { id: 'housing', title: 'Residential & Student Housing', description: 'Affordable family living and campus accommodation.' },
    { id: 'industrial', title: 'Industrial & Mixed-Use', description: 'Warehousing, logistics yards, and integrated hubs.' },
    { id: 'rental', title: 'Rental & Leasing', description: 'Verified tenant vetting, contracts, and dispute care.' },
    { id: 'project-mgmt', title: 'Project Management', description: 'Rigorous schedule control, budgeting, and site milestones.' },
    { id: 'tendering', title: 'Tendering & Contracting', description: 'Compliant tender submissions and public-private contracts.' },
    { id: 'smme', title: 'SMME Partnerships', description: 'Empowering local subcontractors and emerging trades.' },
  ] as SecondaryService[],

  credentials: [
    {
      id: 'cidb',
      name: 'CIDB',
      fullTitle: 'Construction Industry Development Board',
      badgeColor: 'navy',
      description: 'Statutory registration governing construction contractors, tender credibility, and technical delivery capacity in South Africa.',
      regPlaceholder: 'Registration Number: [Pending Verification / Record on File]',
    },
    {
      id: 'nhbrc',
      name: 'NHBRC',
      fullTitle: 'National Home Builders Registration Council',
      badgeColor: 'purple',
      description: 'Enforces structural warranty protection, home construction standards, and quality consumer safeguards across housing projects.',
      regPlaceholder: 'Registration Number: [Pending Verification / Record on File]',
    },
    {
      id: 'ppra',
      name: 'PPRA',
      fullTitle: 'Property Practitioners Regulatory Authority',
      badgeColor: 'scarlet',
      description: 'Regulatory oversight ensuring strict compliance, trust fund accountability, and ethics for property practitioners.',
      regPlaceholder: 'Registration Number: [Pending Verification / Record on File]',
    },
  ] as CredentialShield[],

  showcasePlaceholder: 'Project showcase coming soon. Complete project folios, technical specifications, and site photography will be published following handover certification.',

  footer: {
    copyrightNote: 'All rights reserved.',
    attribution: 'Preview prepared by CoreIQ Create',
  },
};
