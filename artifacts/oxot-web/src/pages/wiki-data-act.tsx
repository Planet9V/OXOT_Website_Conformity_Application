import { dataActRecitalsData, dataActArticlesData, dataActAnnexesData } from '@/data/dataActCorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'data-act')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={dataActRecitalsData}
      articles={dataActArticlesData}
      annexes={dataActAnnexesData}
    />
  );
}
