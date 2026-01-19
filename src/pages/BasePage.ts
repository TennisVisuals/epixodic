/**
 * Base Page
 * 
 * Abstract base class for all page components.
 * Pages are route-level components that manage their own sub-components.
 */

export interface PageOptions {
  params?: Record<string, any>;
  query?: Record<string, any>;
}

export abstract class BasePage {
  protected container: HTMLElement;
  protected options: PageOptions;
  protected mounted: boolean = false;
  protected components: Map<string, any> = new Map();

  constructor(container: HTMLElement, options: PageOptions = {}) {
    this.container = container;
    this.options = options;
  }

  /**
   * Mount the page
   */
  async mount(): Promise<void> {
    if (this.mounted) {
      console.warn('Page already mounted');
      return;
    }

    await this.onBeforeMount();
    await this.render();
    await this.onMounted();
    
    this.mounted = true;
  }

  /**
   * Unmount the page
   */
  async unmount(): Promise<void> {
    if (!this.mounted) return;

    await this.onBeforeUnmount();
    
    // Unmount all child components
    for (const [, component] of this.components) {
      if (component.unmount) {
        await component.unmount();
      }
    }
    this.components.clear();
    
    // Cleanup
    this.cleanup();
    await this.onUnmounted();
    
    this.mounted = false;
  }

  /**
   * Abstract render method
   */
  protected abstract render(): Promise<void> | void;

  /**
   * Lifecycle hooks
   */
  protected async onBeforeMount(): Promise<void> {}
  protected async onMounted(): Promise<void> {}
  protected async onBeforeUnmount(): Promise<void> {}
  protected async onUnmounted(): Promise<void> {}

  /**
   * Cleanup
   */
  protected cleanup(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Register a child component
   */
  protected registerComponent(name: string, component: any): void {
    this.components.set(name, component);
  }

  /**
   * Get registered component
   */
  protected getComponent(name: string): any {
    return this.components.get(name);
  }

  /**
   * Utility: Create element
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Record<string, any> = {},
    children: (HTMLElement | string)[] = []
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }

  /**
   * Check if mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }
}
