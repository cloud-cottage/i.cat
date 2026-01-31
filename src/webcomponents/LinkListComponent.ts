class LinkListComponent extends HTMLElement {
  private _data: Array<{ label: string; url: string; }>=[];
  private shadow: ShadowRoot | null = null;
  private _dragIndex: number | null = null;

  set data(val: Array<{ label: string; url: string; }>) {
    this._data = val || [];
    this.render();
  }
  get data() {
    return this._data;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    if (!this.shadow) return;
    // clear
    this.shadow.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = `
      .link-item { display:flex; align-items:center; gap:8px; padding:6px; border-radius:6px; border:1px solid #333; background: rgba(0,0,0,.05); }
      .link-item.drag { opacity: .5; }
      a { color: var(--link); text-decoration: none; }
      a:hover { text-decoration: underline; }
    `;
    this.shadow!.appendChild(style);
    const container = document.createElement('div');
    container.className = 'link-list';
    this._data.forEach((d, idx) => {
      const div = document.createElement('div');
      div.className = 'link-item';
      div.draggable = true;
      div.dataset.index = String(idx);
      div.innerHTML = `<span>${idx + 1}.</span> <a href="${d.url}" target="_blank" rel="noreferrer">${d.label}</a>`;
      // drag events
      div.addEventListener('dragstart', (e) => {
        this._dragIndex = idx;
        (e.dataTransfer as DataTransfer).setData('text/plain', String(idx));
        div.classList.add('drag');
      });
      div.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = this._dragIndex ?? idx;
        const to = idx;
        if (from === to) return;
        const moved = this._data.splice(from, 1)[0];
        this._data.splice(to, 0, moved);
        this.render();
        // dispatch change to host
        this.dispatchEvent(new CustomEvent('change', { detail: { links: this._data } }));
        this._dragIndex = null;
      });
      container.appendChild(div);
    });
    this.shadow!.appendChild(container);
  }
}

customElements.define('lc-link-list', LinkListComponent);
export { LinkListComponent }
