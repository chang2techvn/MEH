/**
 * Process message content that contains HTML highlights for user names
 * This utility handles both markdown and HTML content for proper rendering
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

export interface ProcessedContentProps {
  content: string;
  isDarkMode: boolean;
  className?: string;
}

/**
 * Component to render message content with proper HTML and Markdown support
 */
export const ProcessedMessageContent: React.FC<ProcessedContentProps> = ({
  content,
  isDarkMode,
  className = ""
}) => {
  // Check if content contains HTML span tags for user highlighting
  const hasHTMLHighlights = /<span[^>]*class="text-green-600[^"]*"[^>]*>.*?<\/span>/i.test(content);
  
  if (hasHTMLHighlights) {
    // Process content to convert HTML highlights to React components
    const processedContent = processHTMLHighlights(content, isDarkMode);
    
    return (
      <div className={`min-w-0 ${className}`}>
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
          <div 
            className="mb-2 sm:mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words word-break-break-word overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </div>
    );
  }
  
  // Regular markdown processing for content without HTML highlights
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for markdown elements with mobile-first responsive design
            strong: ({ children }) => (
              <strong className="text-orange-600 dark:text-orange-400 font-semibold break-words word-break-break-word">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="text-blue-600 dark:text-blue-400 break-words word-break-break-word">
                {children}
              </em>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono break-all word-break-break-all overflow-wrap-anywhere">
                {children}
              </code>
            ),
            p: ({ children }) => (
              <p className="mb-2 sm:mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words word-break-break-word overflow-wrap-anywhere">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside space-y-1 sm:space-y-2 ml-2 sm:ml-3 my-2 sm:my-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-normal break-words overflow-hidden">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside space-y-1 sm:space-y-2 ml-2 sm:ml-3 my-2 sm:my-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-normal break-words overflow-hidden">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-normal mb-1 pl-1 sm:pl-2 break-words word-break-break-word overflow-wrap-anywhere">
                {children}
              </li>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2 sm:mt-3 mb-1 sm:mb-2 break-words leading-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-orange-600 dark:text-orange-400 mt-2 sm:mt-3 mb-1 sm:mb-2 break-words leading-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-orange-600 dark:text-orange-400 mt-1 sm:mt-2 mb-1 break-words leading-snug">
                {children}
              </h3>
            ),
            // Handle blockquotes with custom styling
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-orange-300 dark:border-orange-600 pl-2 sm:pl-3 my-2 sm:my-3 italic text-gray-600 dark:text-gray-400 text-sm sm:text-base break-words overflow-wrap-anywhere">
                {children}
              </blockquote>
            ),
            // Handle tables with responsive design
            table: ({ children }) => (
              <div className="overflow-x-auto my-2 sm:my-3">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs sm:text-sm break-words">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left break-words">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 sm:py-2 break-words word-break-break-word overflow-wrap-anywhere">
                {children}
              </td>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

/**
 * Process HTML highlights in content to use proper Tailwind classes
 */
function processHTMLHighlights(content: string, isDarkMode: boolean): string {
  // Replace HTML spans with proper Tailwind classes for user name highlighting
  let processedContent = content;
  
  // Convert green user name highlights to proper styling with spacing
  processedContent = processedContent.replace(
    /<span\s+class="text-green-600\s+font-medium"([^>]*)>(.*?)<\/span>/gi,
    (match, attributes, innerText) => {
      const classes = isDarkMode 
        ? "text-green-400 font-semibold bg-green-900/20 px-2 py-0.5 rounded-md ml-1"
        : "text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-md ml-1";
      return ` <span class="${classes}">${innerText}</span>`;
    }
  );
  
  // Convert blue user name highlights to proper styling with spacing
  processedContent = processedContent.replace(
    /<span\s+class="text-blue-600\s+font-medium"([^>]*)>(.*?)<\/span>/gi,
    (match, attributes, innerText) => {
      const classes = isDarkMode
        ? "text-blue-400 font-semibold bg-blue-900/20 px-2 py-0.5 rounded-md ml-1"
        : "text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-md ml-1";
      return ` <span class="${classes}">${innerText}</span>`;
    }
  );
  
  // Handle any other color variations with spacing
  processedContent = processedContent.replace(
    /<span\s+class="text-(\w+)-600\s+font-medium"([^>]*)>(.*?)<\/span>/gi,
    (match, color, attributes, innerText) => {
      const classes = isDarkMode
        ? `text-${color}-400 font-semibold bg-${color}-900/20 px-2 py-0.5 rounded-md ml-1`
        : `text-${color}-600 font-semibold bg-${color}-100 px-2 py-0.5 rounded-md ml-1`;
      return ` <span class="${classes}">${innerText}</span>`;
    }
  );
  
  return processedContent;
}
