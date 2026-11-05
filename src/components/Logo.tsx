/** Монограмма: «u», правая стойка которой уходит вверх как галочка, и мигающий курсор терминала. */
export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="logo-in">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="8" className="logo-box" />
        <path d="M9 10v6.5a5.5 5.5 0 0 0 11 0V7" className="logo-u" />
        <rect x="22.5" y="21" width="5" height="2.6" rx="1" className="logo-cursor" />
      </svg>
      {withText && (
        <span className="logo-text" aria-hidden="true">
          utkir<span className="logo-dot">.dev</span>
        </span>
      )}
    </span>
  );
}
