import { mount, unmount } from 'svelte';
import ViewHeader from '../components/nav/ViewHeader.svelte';

interface NavItem {
  iconClass: string;
  onclick: () => void;
  visible?: boolean;
}

interface ViewHeaderProps {
  title: string;
  navItems: NavItem[];
}

const WRAPPER_CLASS = 'svelte-view-header-wrapper';

export function mountViewHeader(container: HTMLElement, props: ViewHeaderProps): Record<string, any> {
  const wrapper = document.createElement('div');
  wrapper.className = WRAPPER_CLASS;
  container.insertBefore(wrapper, container.firstChild);

  return mount(ViewHeader, { target: wrapper, props });
}

export function unmountViewHeader(instance: Record<string, any>, container: HTMLElement): void {
  unmount(instance);
  const wrapper = container.querySelector(`.${WRAPPER_CLASS}`);
  if (wrapper) wrapper.remove();
}
