class ThemeSwitcherComponent extends HTMLElement {
  private _themes: Array<{ id: number; name: string; className: string }> = [];
  private _selected?: number;
  constructor() {
    super();
  }
  set themes(t: any[]) { this._themes = t; this.render(); }
  set selectedTheme(id: number) { this._selected = id; this.applyTheme(); }
  connectedCallback() { this.render(); }
  render() {
    const btns = this._themes.map((th) => `<button data-id="${th.id}">${th.name}</button>`).join('');
    this.innerHTML = `
      <div class="theme-switcher" aria-label="切换主题">${btns}</div>
    `;
    this.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        const id = Number((b as HTMLElement).dataset['id']);
        this.selectedTheme = id;
        const event = new CustomEvent('themechange', { detail: { themeId: id } });
        this.dispatchEvent(event);
        // apply
        this.applyTheme();
      });
    });
  }
  applyTheme() {
    if (typeof document === 'undefined') return;
    // remove existing theme classes from body
    for (let i = 1; i <= 9; i++) {
      document.body.classList.remove(`theme-${i}`);
    }
    if (this._selected) {
      document.body.classList.add(`theme-${this._selected}`);
    }
  }
}

customElements.define('tw-theme-switcher', ThemeSwitcherComponent);

export { ThemeSwitcherComponent }
