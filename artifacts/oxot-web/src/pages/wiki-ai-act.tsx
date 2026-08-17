import { aiActRecitalsData, aiActArticlesData, aiActAnnexesData } from '@/data/aiActCorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'ai-act')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={aiActRecitalsData}
      articles={aiActArticlesData}
      annexes={aiActAnnexesData}
    />
  );
}
