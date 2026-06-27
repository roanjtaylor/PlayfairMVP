export interface PortfolioFounder {
  name: string;
  role: string;
  photo?: string;
  github?: string;
  linkedin?: string;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  logoUrl?: string;
  sector: string;
  subsector?: string;
  description: string;
  founders: PortfolioFounder[];
  githubOrg?: string;
  domains: string[];
  website?: string;
  stage: string;
  year?: number;
  hq?: string;
  accentColor?: string;
  custom?: boolean;
}

export interface GitHubContributor {
  login: string;
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  avatarUrl: string;
  profileUrl: string;
  publicRepos?: number;
  followers?: number;
  contributions?: number;
  repo?: string;
  repoStars?: number;
  repoDescription?: string;
  source: 'org-member' | 'repo-contributor' | 'search';
}

export interface AcademicAuthor {
  id: string;
  name: string;
  institution?: string;
  country?: string;
  citationCount?: number;
  worksCount?: number;
  openAlexUrl?: string;
  orcid?: string;
  papers: {
    title: string;
    year?: number;
    citedBy?: number;
    doi?: string;
  }[];
}

export interface Candidate {
  id: string;
  name: string;
  photo?: string;
  currentRole: string;
  currentOrg: string;
  founderReadiness: number;
  relationshipDistance: 1 | 2;
  technicalArea: string;
  summary: string;
  connectionPath: string[];
  whyThisPerson: string;
  whyPlayfair: string;
  whyNow: string;
  founderSignals: {
    github?: string;
    research?: string[];
    projects?: string[];
    talks?: string[];
  };
  currentEmployer: string;
  technicalThemes: string[];
  publicActivity: string[];
  evidenceTimeline: { year: number; event: string }[];
  suggestedNextStep: string;
  readinessEvidence: string[];
  links: {
    github?: string;
    linkedin?: string;
    openAlex?: string;
    google?: string;
    website?: string;
    email?: string;
  };
  source: 'github' | 'academic' | 'web';
}

export interface StudyReport {
  candidateId: string;
  candidateName: string;
  deepAssessment: string;
  strengths: string[];
  concerns: string[];
  outreachMessage: string;
  dueDiligenceQuestions: string[];
  verdict: 'strong' | 'interesting' | 'monitor';
}

export interface ExpansionResult {
  company: PortfolioCompany;
  candidates: Candidate[];
  githubData: GitHubContributor[];
  academicData: AcademicAuthor[];
  error?: string;
}

export interface StudyResult {
  reports: StudyReport[];
}
