declare global {
  interface HTMLElementTagNameMap {
    'lc-link-list': HTMLElement
    'tw-tweet-widget': HTMLElement
  }
  namespace JSX {
    interface IntrinsicElements {
      'lc-link-list': any
      'tw-tweet-widget': any
    }
  }
}

export {}
