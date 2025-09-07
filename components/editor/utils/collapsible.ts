/* eslint-disable @typescript-eslint/ban-ts-comment */
export function setDomHiddenUntilFound(dom: HTMLElement): void {
  // @ts-expect-error
  dom.hidden = "until-found"
}

export function domOnBeforeMatch(dom: HTMLElement, callback: () => void): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dom as any).onbeforematch = callback
}
