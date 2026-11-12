import { useState } from 'react';

import { codeOf, jobRolesOf, projects } from './projects';

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '');

/** 진행자 화면. 방문자가 말한 팀을 찾아 직군을 누르면 문제 화면으로 간다. */
export function HostSearch() {
  const [keyword, setKeyword] = useState('');
  const query = normalize(keyword);
  const matched = query
    ? projects.filter((project) =>
        [project.title, project.slug, ...project.members].some((value) =>
          normalize(value).includes(query),
        ),
      )
    : projects;

  return (
    <main className="mx-auto w-full max-w-240 px-4 pt-10 pb-24 md:px-6 md:pt-14">
      <p className="text-sm font-semibold text-gray-500">진행자 화면 · 방문자에게 보여 주지 마세요</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">어느 팀 방문자인가요?</h1>
      <input
        type="search"
        autoFocus
        aria-label="팀 이름 또는 크루 닉네임"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="팀 이름 또는 크루 닉네임"
        className="focus:border-primary-400 focus:ring-primary-100 mt-5 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none placeholder:text-gray-400 focus:ring-4"
      />
      <p className="mt-3 text-sm text-gray-500">
        {matched.length}개 팀 · 직군을 누르면 팀 이름을 가린 문제 화면이 열려요.
      </p>
      {matched.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          ‘{keyword.trim()}’에 맞는 팀이나 크루를 못 찾았어요.
        </p>
      ) : (
        <ul className="mt-4">
          {matched.map((project) => {
            const jobRoles = jobRolesOf(project);
            return (
              <li
                key={project.slug}
                className="flex flex-col gap-3 border-t border-gray-100 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="text-base font-bold">{project.title}</span>
                    <span className="shrink-0 text-sm text-gray-500">{project.cohort}기</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {project.members.join(', ')}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {jobRoles.length === 0 && (
                    <span className="text-sm text-gray-400">정리된 경험이 없어요</span>
                  )}
                  {jobRoles.map(({ jobRole, label }) => (
                    <a
                      key={jobRole}
                      href={`#/q/${codeOf(project)}/${jobRole}`}
                      className="focus-visible:outline-primary-600 hover:border-primary-400 hover:text-primary-600 inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 focus-visible:outline-2"
                    >
                      {label}
                      <span className="font-medium text-gray-400">
                        {project.cards.filter((card) => card.jobRole === jobRole).length}
                      </span>
                    </a>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
