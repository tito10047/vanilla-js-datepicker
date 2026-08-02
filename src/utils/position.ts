import type { PositionOption } from '../core/types';

export interface PositionResult {
  top: number;
  left: number;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

export function computePosition(
  anchor: HTMLElement,
  dropdown: HTMLElement,
  position: PositionOption,
  container?: HTMLElement,
): PositionResult {
  const anchorRect = anchor.getBoundingClientRect();
  const dropRect = dropdown.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const containerRect = container
    ? container.getBoundingClientRect()
    : { top: 0, left: 0 };

  const spaceBelow = vh - anchorRect.bottom;
  const spaceAbove = anchorRect.top;

  let placement: PositionResult['placement'] = 'bottom';

  if (position === 'auto') {
    placement = spaceBelow >= dropRect.height || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  } else if (position === 'top') {
    placement = 'top';
  } else if (position === 'bottom') {
    placement = 'bottom';
  } else {
    placement = position as PositionResult['placement'];
  }

  let top: number;
  let left: number;

  if (placement === 'top') {
    top = anchorRect.top - dropRect.height - 4 - containerRect.top;
  } else {
    top = anchorRect.bottom + 4 - containerRect.top;
  }

  left = anchorRect.left - containerRect.left;

  // Clamp horizontally
  const maxLeft = vw - dropRect.width - 8;
  if (left > maxLeft) left = maxLeft;
  if (left < 8) left = 8;

  return { top, left, placement };
}
