export interface ScoringSkin {
  readonly id: string;
  readonly orientation: 'vertical' | 'horizontal';
  readonly rendered: boolean;
  render(container: HTMLElement): void;
  show(): void;
  hide(): void;
  destroy(): void;
}
