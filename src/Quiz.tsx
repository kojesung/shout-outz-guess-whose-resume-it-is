import { useId, useState, type ReactNode } from 'react';

import { jobRolesOf, maskerOf, serviceUrlOf, type Card, type Project, type Source } from './projects';

const cn = (...values: (string | false | undefined)[]) => values.filter(Boolean).join(' ');

/** 문제 화면. 정답을 보기 전에는 팀 이름을 가리고 출처를 누를 수 없다. */
export function Quiz({ project, initialJobRole }: { project: Project; initialJobRole?: string }) {
  const jobRoles = jobRolesOf(project);
  const [selected, setSelected] = useState(
    jobRoles.some(({ jobRole }) => jobRole === initialJobRole)
      ? initialJobRole
      : jobRoles[0]?.jobRole,
  );
  const [revealed, setRevealed] = useState(false);
  const mask = maskerOf(project);
  const text = (value: string) => (revealed ? value : mask(value));
  const serviceUrl = serviceUrlOf(project);

  return (
    <>
      <main className="mx-auto w-full max-w-240 px-4 pt-10 pb-36 md:px-6 md:pt-14">
        {revealed ? (
          <header className="flex items-center gap-4">
            {project.thumbnailUrl && (
              <img
                src={project.thumbnailUrl}
                alt=""
                className="size-16 shrink-0 rounded-2xl border border-gray-200 object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-primary-600 text-sm font-semibold">정답 · {project.cohort}기</p>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                {project.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{project.tagline}</p>
            </div>
          </header>
        ) : (
          <header>
            <p className="text-primary-600 text-sm font-semibold">shout-outz 이력서 퀴즈</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
              이 이력서, 어느 팀 걸까요?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
              우테코 한 팀의 PR과 팀 문서, 블로그를 모아 이력서 문장으로 정리했어요. 읽어 보고 어느
              팀의 경험인지 맞혀 보세요.
            </p>
          </header>
        )}

        <div
          role="tablist"
          aria-label="직군"
          className="mt-8 mb-5 flex flex-wrap gap-4.5 border-b border-gray-200 pb-3.5"
        >
          {jobRoles.map(({ jobRole, label }) => (
            <DotTab
              key={jobRole}
              selected={selected === jobRole}
              onSelect={() => setSelected(jobRole)}
            >
              {label}
            </DotTab>
          ))}
        </div>

        <ul aria-label="경험">
          {project.cards
            .filter((card) => card.jobRole === selected)
            .map((card, index) => (
              <li key={card.cardId} className="border-t border-gray-100 first:border-t-0">
                {/* 서비스 경험 탭처럼 첫 경험의 출처만 펼쳐 둔다. */}
                <ExperienceItem
                  card={card}
                  text={text}
                  revealed={revealed}
                  defaultOpen={index === 0}
                />
              </li>
            ))}
        </ul>
      </main>

      <div className="bg-background/90 fixed inset-x-0 bottom-0 border-t border-gray-200 backdrop-blur">
        <div className="mx-auto flex w-full max-w-240 items-center justify-between gap-3 px-4 py-3 md:px-6">
          <a
            href="#/"
            className="focus-visible:outline-primary-600 rounded-sm text-sm font-medium text-gray-500 hover:text-gray-800 focus-visible:outline-2"
          >
            {revealed ? '← 다음 방문자' : '← 팀 다시 고르기'}
          </a>
          {/* 정답을 보면 이 화면의 가림을 풀고, 서비스의 그 팀 페이지를 새 탭으로 연다. */}
          <a
            href={serviceUrl}
            target="_blank"
            rel="noopener"
            onClick={() => setRevealed(true)}
            className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600 inline-flex h-12 items-center rounded-xl px-6 text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {revealed ? `shout-outz에서 ${project.title} 보기 ↗` : '정답 보기'}
          </a>
        </div>
      </div>
    </>
  );
}

function DotTab({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'focus-visible:outline-primary-600 inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2',
        selected ? 'font-semibold text-gray-900' : 'font-medium text-gray-400 hover:text-gray-700',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', selected ? 'bg-gray-900' : 'bg-transparent')}
      />
      {children}
    </button>
  );
}

function ExperienceItem({
  card,
  text,
  revealed,
  defaultOpen,
}: {
  card: Card;
  /** 정답을 보기 전에는 팀 이름을 가려서 돌려준다. */
  text: (value: string) => string;
  revealed: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sourcesId = useId();

  return (
    <article className="flex flex-col gap-2.5 py-7">
      <span className="text-sm font-medium text-gray-500">{text(card.category)}</span>
      <h2 className="text-lg font-bold text-gray-900">{text(card.title)}</h2>
      <ul className="flex flex-col gap-2">
        {card.resumeBullets.map((bullet) => (
          <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-gray-600">
            <span
              aria-hidden="true"
              className="mt-[calc((1lh-4px)/2)] size-1 shrink-0 rounded-full bg-gray-400"
            />
            <span className="min-w-0">{text(bullet)}</span>
          </li>
        ))}
      </ul>
      {card.sources.length > 0 && (
        <div className="mt-1.5 flex flex-col items-start gap-2">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={sourcesId}
            onClick={() => setOpen((value) => !value)}
            className="focus-visible:outline-primary-600 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pr-3 pl-1 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus-visible:outline-2"
          >
            <span aria-hidden="true" className="flex">
              {card.sources.map((source, index) => (
                <SourceBadge
                  key={source.resourceId}
                  source={source}
                  className={index > 0 ? '-ml-1.5' : undefined}
                />
              ))}
            </span>
            출처 {card.sources.length}개
            <span aria-hidden="true" className="text-xs text-gray-400">
              {open ? '▴' : '▾'}
            </span>
          </button>
          {open && (
            <div
              id={sourcesId}
              className="w-full max-w-140 rounded-xl border border-gray-200 bg-white p-1.5 shadow-md"
            >
              <ul className="flex flex-col">
                {card.sources.map((source) => (
                  <li key={source.resourceId}>
                    <SourceRow source={source} text={text} revealed={revealed} />
                  </li>
                ))}
              </ul>
              {!revealed && (
                <p className="px-2.5 pt-1.5 pb-1 text-xs text-gray-400">
                  출처 원문은 정답을 본 뒤에 열 수 있어요.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

const isPullRequest = (source: Source) => source.source === 'github-pr';
const isGithub = (source: Source) => source.source.startsWith('github-');

/** PR 주소 끝의 번호. 예: .../pull/513 → 513 */
const pullRequestNumberOf = (source: Source) =>
  isPullRequest(source) ? (/\/pull\/(\d+)/.exec(source.url)?.[1] ?? null) : null;

function SourceRow({
  source,
  text,
  revealed,
}: {
  source: Source;
  text: (value: string) => string;
  revealed: boolean;
}) {
  const number = pullRequestNumberOf(source);
  const content = (
    <>
      <SourceBadge source={source} />
      <span className="min-w-0 truncate">{text(source.title)}</span>
      {number !== null && <span className="ml-auto shrink-0 text-xs text-gray-400">#{number}</span>}
    </>
  );
  const rowClass = 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-600';

  // 정답을 보기 전에는 링크로 만들지 않는다. 주소에 저장소 이름(팀 이름)이 들어 있어 마우스를 올리기만 해도 드러난다.
  if (!revealed) return <div className={rowClass}>{content}</div>;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(rowClass, 'focus-visible:outline-primary-600 hover:bg-gray-50 focus-visible:outline-2')}
    >
      {content}
    </a>
  );
}

/** 출처 동그라미. PR은 PR, GitHub 팀 문서는 문서 아이콘, 블로그는 B */
function SourceBadge({ source, className }: { source: Source; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-primary-50 text-primary-600 flex size-5 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-extrabold ring-2 ring-white',
        className,
      )}
    >
      {isPullRequest(source) ? (
        'PR'
      ) : isGithub(source) ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-2.5 text-green-600"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      ) : (
        'B'
      )}
    </span>
  );
}
