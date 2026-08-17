import { machineryRecitalsData, machineryArticlesData, machineryAnnexesData } from '@/data/machineryCorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'machinery')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={machineryRecitalsData}
      articles={machineryArticlesData}
      annexes={machineryAnnexesData}
    />
  );
}
