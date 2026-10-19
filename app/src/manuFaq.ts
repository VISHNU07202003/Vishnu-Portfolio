import content from './publicContent';
import type { PublicAnswer } from './types';
export type ManuAnswer = PublicAnswer;
const answers: Record<string, ManuAnswer> = {
  work: { id: 'work', title: 'Take a closer look', body: 'The Work section is the place to explore selected projects. Open an available case study for its story.', link: { label: 'Explore Work', href: '/#work' } },
  experience: { id: 'experience', title: 'Explore the chapters', body: 'Visit Experience for the scroll presentation. You can also choose Read without motion on desktop; smaller screens show a reading layout.', link: { label: 'Visit Experience', href: '/#experience' } },
  contact: { id: 'contact', title: 'Start a conversation', body: 'The Contact section has Vishnu’s email, GitHub, LinkedIn and phone. The email link opens your mail app.', link: { label: 'Go to Contact', href: '/#contact' } },
  guide: { id: 'guide', title: 'A small, local guide', body: 'I’m Manu, a guide to this portfolio. My answers are curated and run in your browser; your questions aren’t sent to an AI service or saved between page loads.', link: { label: 'Start with Work', href: '/#work' } },
  unknown: { id: 'unknown', title: 'I don’t have that detail yet', body: 'I don’t have verified information about that. I can help you find Work, Experience, About or Contact.', link: { label: 'Explore the portfolio', href: '/#work' } },
};
for (const answer of content.answers) answers[answer.id] = answer;
export const suggestions = ['What is TransGIS?', 'What is FedGuard?', 'What are your main skills?', 'What is your education?'];
export const greeting: ManuAnswer = { id: 'hello', title: 'Hi, I’m Manu.', body: 'A little curiosity is a good place to start. Pick a question below, or ask me where to go.', link: { label: 'Explore Work', href: '/#work' } };
export function answerManu(question: string): ManuAnswer {
  const q = question.trim().toLowerCase().slice(0, 300);
  // Withheld topics and unsupported results take precedence over broad navigation aliases.
  if (/\b(salary|gpa|credentials?|resume|cv|address|metrics?|accuracy|score|revenue|customers?|clients?|audience|users?|participants?|launch(?:ed)?|deployment|deployed|production|present|current|today|now)\b/.test(q) || /how (many|much)|still used|ongoing use/.test(q)) return answers.unknown;
  if (/\b(certifications?|certificates?|aws|azure|coursera)\b/.test(q)) return answers.certifications;
  if (/\bplant cropper\b/.test(q)) return answers.plant;
  if (/\b(depgraph|road damage|potholes?|cropper)\b/.test(q)) return answers.unknown;
  if (/\b(uf|ifas|laboratory|lab|blueberry|cell counter)\b/.test(q)) return answers.uf;
  if (/\b(android|smartinternz|snack squad|externship)\b/.test(q)) return answers.android;
  if (/\b(transgis|transportation|spatial|geospatial)\b/.test(q)) return answers.transgis;
  if (/\b(fedguard|federated|fedavg|fedprox|opacus)\b/.test(q)) return answers.fedguard;
  if (/\b(vit|vit-ap|campus|student assistant|faculty)\b/.test(q)) return answers.campus;
  if (/\b(education|degree|studying|study|graduate|graduation|university|masters?|bachelor)\b/.test(q)) return answers.education;
  if (/\b(skills?|stack|technologies|languages)\b/.test(q)) return answers.skills;
  if (/research interests|research focus|interested in/.test(q)) return answers.research;
  if (/\b(manu|privacy|ai|chatbot|store|saved)\b/.test(q)) return answers.guide;
  if (/\b(contact|email|phone|touch|reach)\b/.test(q)) return answers.contact;
  if (/\b(experience|chapters|motion|scroll)\b/.test(q)) return answers.experience;
  if (/\b(about|vishnu|background)\b/.test(q)) return answers.about;
  if (/\b(work|projects?|case stud(?:y|ies))\b/.test(q)) return answers.work;
  return answers.unknown;
}


