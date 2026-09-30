import type { ReactNode } from 'react';

export type HoverPillAlign = 'right' | 'left' | 'center';
export type HoverPillPlacement = 'bottom' | 'top';

/**
 * A brand styled hover message, used in place of the browser's native `title`
 * tooltip (which is slow to appear, cannot be styled, and renders differently
 * on every OS).
 *
 * The pill is decorative: the element it belongs to must already carry its own
 * accessible name (`aria-label`) or visible text, and the pill itself is hidden
 * from assistive technology so the label is never announced twice.
 *
 * Usage: the parent has to be `relative` and carry `group`, so the pill can be
 * revealed on both pointer hover and keyboard focus:
 *
 *   <Link className="group relative ...">
 *     <AccountIcon />
 *     <HoverPill label="Sign up or log in" align="right" />
 *   </Link>
 */
export default function HoverPill({
  label,
  align = 'center',
  placement = 'bottom',
  className = '',
  children,
}: {
  label: string;
  /** Which edge of the parent the pill is pinned to. */
  align?: HoverPillAlign;
  /** Use 'top' for controls near the foot of the page, or the pill renders
   *  below the viewport and is never seen. */
  placement?: HoverPillPlacement;
  className?: string;
  children?: ReactNode;
}) {
  const anchor =
    align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
  const caretSide =
    align === 'right' ? 'right-4' : align === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';
  const above = placement === 'top';

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 ${
        above ? 'bottom-[calc(100%+12px)]' : 'top-[calc(100%+12px)]'
      } ${anchor} inline-flex translate-y-1 items-center whitespace-nowrap rounded-full bg-charcoal px-3.5 py-1.5 font-[family-name:var(--font-body)] text-xs font-semibold tracking-wide text-white opacity-0 shadow-elevated transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none ${className}`}
    >
      {/* Rotated square forms the little pointer back to the control. */}
      <span
        aria-hidden="true"
        className={`absolute h-2.5 w-2.5 rotate-45 rounded-[2px] bg-charcoal ${
          above ? '-bottom-[5px]' : '-top-[5px]'
        } ${caretSide}`}
      />
      <span className="relative flex items-center gap-1.5">
        {children}
        {label}
      </span>
    </span>
  );
}
