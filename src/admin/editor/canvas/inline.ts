// Inline plain-text editing of a single text node inside the canvas.
// The element keeps React's own text node: on finish the original node is put back (with its
// original data) so React's fiber still matches the DOM and no remount is needed.

export interface InlineSession {
  target: string;
  el: HTMLElement;
  /** Ends the session. `commit` false = cancel. Returns the new value when it changed. */
  finish: (commit: boolean) => string | null;
}

let plaintextSupported: boolean | null = null;
function setEditable(el: HTMLElement) {
  if (plaintextSupported !== false) {
    try {
      el.contentEditable = 'plaintext-only';
      plaintextSupported = el.contentEditable === 'plaintext-only';
      if (plaintextSupported) return;
    } catch {
      plaintextSupported = false;
    }
  }
  el.contentEditable = 'true';
}

/** True when the element shows exactly `value` as its only child text node. */
export function canInlineEdit(el: HTMLElement, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const nodes = el.childNodes;
  return nodes.length === 1 && nodes[0].nodeType === Node.TEXT_NODE && nodes[0].textContent === value;
}

export function startInline(
  el: HTMLElement,
  target: string,
  maxLength: number,
  onEnd: (commit: boolean) => void,
): InlineSession {
  const node = el.firstChild as Text;
  const original = node.data;
  const prevOutline = el.style.outline;
  const prevOutlineOffset = el.style.outlineOffset;
  let done = false;

  setEditable(el);
  el.spellcheck = true;
  el.style.outline = '2px solid #00abf0';
  el.style.outlineOffset = '3px';
  el.focus({ preventScroll: true });
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);

  const selectionLength = () => {
    const s = window.getSelection();
    return s && s.rangeCount && el.contains(s.anchorNode) ? s.toString().length : 0;
  };
  const room = () => maxLength - ((el.textContent ?? '').length - selectionLength());

  const onBeforeInput = (e: InputEvent) => {
    if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
      e.preventDefault();
      return;
    }
    if (e.inputType.startsWith('insert') && e.data && e.data.length > room()) e.preventDefault();
  };
  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text/plain') ?? '').replace(/\s*[\r\n]+\s*/g, ' ');
    const allowed = text.slice(0, Math.max(0, room()));
    if (allowed) document.execCommand('insertText', false, allowed);
  };
  const onDrop = (e: DragEvent) => e.preventDefault();
  const onBlur = () => onEnd(true);
  const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();

  el.addEventListener('beforeinput', onBeforeInput);
  el.addEventListener('paste', onPaste);
  el.addEventListener('drop', onDrop);
  el.addEventListener('blur', onBlur);
  window.addEventListener('beforeunload', onBeforeUnload);

  return {
    target,
    el,
    finish(commit) {
      if (done) return null;
      done = true;
      const value = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      el.removeEventListener('beforeinput', onBeforeInput);
      el.removeEventListener('paste', onPaste);
      el.removeEventListener('drop', onDrop);
      el.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.style.outline = prevOutline;
      el.style.outlineOffset = prevOutlineOffset;
      if (!el.getAttribute('style')) el.removeAttribute('style');
      window.getSelection()?.removeAllRanges();
      // Put React's text node back.
      node.data = original;
      el.replaceChildren(node);
      if (!commit || value === original) return null;
      return value;
    },
  };
}
