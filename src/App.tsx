import { useEffect, useState } from 'react';

import { HostSearch } from './HostSearch';
import { Quiz } from './Quiz';
import { findProjectByCode } from './projects';

/** #/q/<팀 코드>/<직군> 이면 문제 화면, 아니면 진행자가 팀을 고르는 화면 */
const parseHash = () => {
  const [, page, code, jobRole] = window.location.hash.split('/');
  const project = page === 'q' && code ? findProjectByCode(code) : undefined;
  return project ? { project, jobRole } : null;
};

export function App() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="bg-background min-h-dvh text-gray-900">
      {route ? (
        // 팀이나 직군이 바뀌면 정답 공개 상태를 처음으로 되돌린다.
        <Quiz key={`${route.project.slug}/${route.jobRole}`} project={route.project} initialJobRole={route.jobRole} />
      ) : (
        <HostSearch />
      )}
    </div>
  );
}
