import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

let mermaidInitialized = false;

export function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          background: '#090d16',
          primaryColor: '#3b82f6',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#60a5fa',
          lineColor: '#94a3b8',
          secondaryColor: '#f59e0b',
          tertiaryColor: '#10b981',
          fontSize: '13px',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif'
        },
        securityLevel: 'loose'
      });
      mermaidInitialized = true;
    }

    let isMounted = true;
    const renderId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    if (!chart || !chart.trim()) {
      setSvgContent('');
      return;
    }

    const cleanChart = chart.trim();

    mermaid
      .render(renderId, cleanChart)
      .then(({ svg }) => {
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Mermaid rendering fallback:', err);
          setError(err.message || 'Diagram syntax error');
          setSvgContent('');
        }
      });

    return () => {
      isMounted = false;
      // Clean up temporary DOM element mermaid might have inserted
      const el = document.getElementById(renderId);
      if (el) el.remove();
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
        <div className="text-amber-500 font-bold mb-2">Architecture Diagram Spec:</div>
        <pre className="text-[11px] leading-relaxed text-foreground">{chart}</pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="p-6 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-xs text-muted-foreground animate-pulse font-mono">
        Rendering technical architecture diagram…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`p-5 rounded-2xl bg-slate-950/90 border border-border shadow-inner overflow-x-auto flex justify-center [&_svg]:max-w-full [&_svg]:h-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
