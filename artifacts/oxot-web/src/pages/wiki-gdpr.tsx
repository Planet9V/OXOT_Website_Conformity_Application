import { gdprRecitalsData, gdprArticlesData, gdprAnnexesData } from '@/data/gdprCorpusData';
import { WikiActShell } from './wiki-acts';
import { WIKI_ACT_META } from './wiki-meta';

const act = WIKI_ACT_META.find((a) => a.slug === 'gdpr')!;

export default function Page() {
  return (
    <WikiActShell
      act={act}
      recitals={gdprRecitalsData}
      articles={gdprArticlesData}
      annexes={gdprAnnexesData}
    />
  );
}
