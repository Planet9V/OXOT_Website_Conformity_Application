import { redRecitalsData, redArticlesData, redAnnexesData } from '@/data/redCorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'red')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={redRecitalsData}
      articles={redArticlesData}
      annexes={redAnnexesData}
    />
  );
}
