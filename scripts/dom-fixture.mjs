// Minimal DOM fixture: exercise the real renderer and event handlers without dependencies.
let document;
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.handlers = {}; this.className = ''; }
  get classList() { return { contains: c => this.className.split(' ').includes(c), add: (...cs) => cs.forEach(c => this.classList.toggle(c, true)), remove: (...cs) => cs.forEach(c => this.classList.toggle(c, false)), toggle: (c, on) => { const cs = new Set(this.className.split(' ').filter(Boolean)); on ? cs.add(c) : cs.delete(c); this.className = [...cs].join(' '); } }; }
  set innerHTML(value) { this.children = []; this.html = value; }
  get parentNode() { return this.parentElement; }
  get firstElementChild() { return this.children[0]; }
  appendChild(child) { child.parentElement = this; this.children.push(child); }
  replaceChild(child, old) { this.children[this.children.indexOf(old)] = child; child.parentElement = this; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, handler) { (this.handlers[name] ??= []).push(handler); }
  dispatchEvent(event) { event.target ??= this; for (const handler of this.handlers[event.type] ?? []) handler(event); }
  contains(child) { return child === this || this.children.some(c => c.contains(child)); }
  focus() { document.activeElement = this; this.dispatchEvent({ type: 'focus' }); }
  blur() { document.activeElement = null; this.dispatchEvent({ type: 'blur' }); }
  select() {}
  closest(selector) { return this.classList.contains(selector.slice(1)) ? this : this.parentElement?.closest(selector); }
  querySelectorAll(selector) {
    const all = this.children.flatMap(c => [c, ...c.querySelectorAll('*')]);
    if (selector === '*') return all;
    return all.filter(el => {
      if (selector === '.tv-row:not(.tv-disabled)') return el.classList.contains('tv-row') && !el.classList.contains('tv-disabled');
      if (selector === '.tv-row[tabindex="0"]') return el.classList.contains('tv-row') && el.tabIndex === 0;
      return el.classList.contains(selector.slice(1));
    });
  }
  querySelector(selector) {
    if (selector.startsWith(':scope')) return this.children.find(c => c.classList.contains('tv-list'))?.children.map(c => c.firstElementChild).find(c => !c.classList.contains('tv-disabled'));
    return this.querySelectorAll(selector)[0] ?? null;
  }
}
document = { activeElement: null, createElement: tag => new Element(tag), addEventListener(){}, removeEventListener(){} };
const context = { document, console, CustomEvent: class { constructor(type, options) { this.type = type; Object.assign(this, options); } } };
context.window = context;

export { Element, document, context };
