class TweetWidgetComponent extends HTMLElement {
  private _tweets: string[] = [];
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  set tweets(ts: string[]) { this._tweets = ts || []; this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const list = this._tweets.map((t) => `<li>${t}</li>`).join('');
    this.shadowRoot!.innerHTML = `
      <style>
        ul { padding-left: 1.2em; }
        li { margin: 6px 0; }
        a { color: var(--link); }
      </style>
      <div class="tweet-widget">
        <div>最近推文</div>
        <ul>${list}</ul>
        ${this._tweets.length ? '' : '<div class="muted">无法获取推文，请前往 Twitter 互动</div>'}
      </div>
    `;
  }
}

customElements.define('tw-tweet-widget', TweetWidgetComponent);

export { TweetWidgetComponent }
