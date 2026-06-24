import React from 'react';

interface SectionHeadingProps {
  /** Small badge label rendered above the title */
  label: string;
  /** Main heading text */
  title: string;
  /** Optional body copy rendered below the title */
  subtitle?: string;
  /** Text alignment — defaults to "left" */
  align?: 'left' | 'center';
  /** Word within `title` to highlight in orange; must be a substring of `title` */
  accentWord?: string;
  className?: string;
}

/**
 * SectionHeading
 *
 * Consistent section title + label rendering with optional orange-highlighted
 * accent word. Consumes `--font-size-h1` / `--font-size-h2` design tokens for
 * fluid typography sizing.
 *
 * Requirements: 18.3, 18.7
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  title,
  subtitle,
  align = 'left',
  accentWord,
  className,
}) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  /**
   * Splits `title` around the first occurrence of `accentWord` (case-sensitive)
   * and returns an array of React nodes where the matched word is wrapped in an
   * orange <span>. Falls back to the plain title string when there is no match.
   */
  const renderTitle = (): React.ReactNode => {
    if (!accentWord || !title.includes(accentWord)) {
      return title;
    }

    const idx = title.indexOf(accentWord);
    const before = title.slice(0, idx);
    const after = title.slice(idx + accentWord.length);

    return (
      <>
        {before}
        <span className="text-orange-500">{accentWord}</span>
        {after}
      </>
    );
  };

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className ?? ''}`}>
      {/* Label */}
      <span className="text-xs font-sans font-medium tracking-wide text-orange-500 uppercase">
        {label}
      </span>

      {/* Title */}
      <h2
        className="font-display font-semibold tracking-tight text-slate-900 dark:text-white"
        style={{ fontSize: 'var(--font-size-h1)' }}
      >
        {renderTitle()}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
export type { SectionHeadingProps };
