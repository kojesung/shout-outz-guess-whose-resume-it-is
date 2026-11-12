import data from './data/projects.json';

export interface Source {
  resourceId: number;
  /** github-pr, github-teamdoc, github-wiki, github-discussion, blog-post */
  source: string;
  title: string;
  url: string;
}

export interface Card {
  cardId: number;
  jobRole: string;
  category: string;
  title: string;
  resumeBullets: string[];
  sources: Source[];
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  cohort: number;
  thumbnailUrl: string | null;
  members: string[];
  cards: Card[];
}

export const projects = data as Project[];

// 서버가 주는 직군 순서(BE, FE, AN)와 같다.
export const JOB_ROLES = [
  { jobRole: 'BE', label: '백엔드' },
  { jobRole: 'FE', label: '프론트엔드' },
  { jobRole: 'AN', label: '안드로이드' },
];

export const jobRolesOf = (project: Project) =>
  JOB_ROLES.filter(({ jobRole }) => project.cards.some((card) => card.jobRole === jobRole));

export const serviceUrlOf = (project: Project) => `https://shout-ou.tz/projects/@${project.slug}`;

/**
 * 주소창에 팀 이름(slug)이 보이면 정답이 드러나서, 주소에는 slug로 만든 짧은 코드만 쓴다.
 * 예: jachwi-sunbae → 1k3x9az
 */
export const codeOf = (project: Project) => {
  let hash = 0;
  for (const char of project.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(36);
};

const projectByCode = new Map(projects.map((project) => [codeOf(project), project]));
export const findProjectByCode = (code: string) => projectByCode.get(code);

const MASK = '■■■';
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 경험 문장과 출처 제목에 나오는 팀 이름을 가리는 함수를 만든다.
 * 예: "자취선배 매물 조회 개선" → "■■■ 매물 조회 개선". 글자 수로 짐작하지 못하게 길이와 상관없이 세 칸으로 가린다.
 */
export const maskerOf = (project: Project) => {
  // slug는 저장소 이름으로 PR 제목에 나올 수 있다. 너무 짧은 slug는 다른 낱말을 가릴 수 있어 뺀다.
  const words = [project.title, project.title.replace(/\s+/g, ''), project.slug]
    .filter((word, index) => (index === 2 ? word.length >= 4 : word.length > 0))
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);
  const pattern = new RegExp(words.join('|'), 'gi');
  return (text: string) => text.replace(pattern, MASK);
};
