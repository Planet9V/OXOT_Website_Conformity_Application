import { nis2RecitalsData, nis2ArticlesData, nis2AnnexesData } from '@/data/nis2CorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'nis2')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={nis2RecitalsData}
      articles={nis2ArticlesData}
      annexes={nis2AnnexesData}
    />
  );
}
