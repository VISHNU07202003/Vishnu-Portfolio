export type VisualKind = 'lab' | 'events' | 'android' | 'federated' | 'map' | 'plant';
export interface PublicLink { label: string; href: string; }
export interface Story { id: string; organization: string; title: string; dates?: string; classification?: string; heading: string; summary: string; tags: string[]; kind: VisualKind; caseStudy?: string; }
export interface Project { id: string; name: string; category: string; classification: string; heading: string; summary: string; featured: boolean; kind: VisualKind; sections: { title: string; body: string }[]; links: PublicLink[]; }
export interface PublicAnswer { id: string; title: string; body: string; link: PublicLink; }
export interface PortfolioContent {
  certifications: { name: string; issuer: string; dates: string; status: string }[];
  contact: PublicLink[];
  profile: { name: string; headline: string; introduction: string; bio: string; education: { institution: string; degree: string; dates: string }[]; strengths: string[]; skills: { area: string; items: string }[] };
  experiences: Story[];
  projects: Project[];
  answers: PublicAnswer[];
}
