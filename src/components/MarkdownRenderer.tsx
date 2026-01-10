import React, { useMemo } from 'react';
import katex from 'katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Componente per renderizzare math inline
const InlineMath: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\$[^$]+\$)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          try {
            const math = part.slice(1, -1);
            const html = katex.renderToString(math, { 
              displayMode: false, 
              throwOnError: false 
            });
            return (
              <span 
                key={i} 
                className="inline-block px-1 text-indigo-700 bg-indigo-50 rounded"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          } catch {
            return <span key={i} className="text-red-500">{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Gestione blocchi di codice
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          // Language identifier after ``` is available but not currently used
          codeContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <pre 
              key={idx} 
              className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4 font-mono text-sm"
            >
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
        }
        return;
      }
      
      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }
      
      // Display math ($$...$$)
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        try {
          const math = trimmed.slice(2, -2);
          const html = katex.renderToString(math, { 
            displayMode: true, 
            throwOnError: false 
          });
          elements.push(
            <div 
              key={idx} 
              className="my-6 overflow-x-auto py-4 bg-gray-50 rounded-2xl px-6 border border-gray-100"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        } catch {
          elements.push(<p key={idx} className="text-red-500">{trimmed}</p>);
        }
        return;
      }
      
      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            <InlineMath text={trimmed.slice(4)} />
          </h3>
        );
        return;
      }
      
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
            <InlineMath text={trimmed.slice(3)} />
          </h2>
        );
        return;
      }
      
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-3xl font-black text-gray-900 mt-8 mb-6 pb-3 border-b-4 border-indigo-100">
            <InlineMath text={trimmed.slice(2)} />
          </h1>
        );
        return;
      }
      
      // Liste
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={idx} className="ml-6 mb-2 list-disc text-gray-700">
            <InlineMath text={trimmed.slice(2)} />
          </li>
        );
        return;
      }
      
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={idx} className="ml-6 mb-2 list-decimal text-gray-700">
            <InlineMath text={text} />
          </li>
        );
        return;
      }
      
      // Bold e italic
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        elements.push(
          <p key={idx} className="font-bold text-gray-900 my-2">
            <InlineMath text={trimmed.slice(2, -2)} />
          </p>
        );
        return;
      }
      
      // Linea vuota
      if (!trimmed) {
        elements.push(<div key={idx} className="h-3" />);
        return;
      }
      
      // Paragrafo normale
      elements.push(
        <p key={idx} className="text-gray-700 leading-relaxed my-2">
          <InlineMath text={trimmed} />
        </p>
      );
    });
    
    return elements;
  }, [content]);
  
  if (!content) {
    return <p className="text-gray-400 italic">Nessun contenuto disponibile.</p>;
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {renderedContent}
    </div>
  );
};

export default MarkdownRenderer;
