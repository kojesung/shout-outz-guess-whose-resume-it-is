// 운영 API에서 프로젝트와 경험 카드를 받아 src/data/projects.json에 저장한다.
// 부스 화면은 이 파일만 읽는다. 데이터를 새로 받으려면 `pnpm fetch-data`를 실행한다.
import { writeFile } from 'node:fs/promises';

const API_ORIGIN = 'https://api.shout-ou.tz';

async function get(path) {
  const response = await fetch(`${API_ORIGIN}${path}`);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function fetchProjects() {
  const projects = [];
  let cursor;
  do {
    const query = new URLSearchParams({ sort: 'LATEST', size: '50', ...(cursor ? { cursor } : {}) });
    const page = await get(`/api/v1/projects?${query}`);
    projects.push(...page.data);
    cursor = page.meta?.hasNext ? page.meta.nextCursor : undefined;
  } while (cursor);
  return projects;
}

const projects = await fetchProjects();
const result = [];
for (const project of projects) {
  let cards = [];
  try {
    cards = (await get(`/api/v1/projects/@${project.slug}/career-cards`)).data;
  } catch (error) {
    console.warn(`경험 카드를 못 받았어요: ${project.slug} (${error.message})`);
  }
  result.push({
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    cohort: project.cohort,
    thumbnailUrl: project.thumbnailUrl,
    members: project.members.map((member) => member.displayName),
    cards: cards.map((card) => ({
      cardId: card.cardId,
      jobRole: card.jobRole,
      category: card.category,
      title: card.title,
      resumeBullets: card.resumeBullets,
      sources: card.sources.map((source) => ({
        resourceId: source.resourceId,
        source: source.source,
        title: source.title,
        url: source.url,
      })),
    })),
  });
}

await writeFile(new URL('../src/data/projects.json', import.meta.url), JSON.stringify(result));
const withCards = result.filter((project) => project.cards.length > 0).length;
console.log(`프로젝트 ${result.length}개 저장 (경험 있는 팀 ${withCards}개)`);
