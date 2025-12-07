declare module 'lenis' {
  export default class Lenis {
    constructor(options?: {
      wrapper?: HTMLElement | Window;
      content?: HTMLElement;
      wheelEventsTarget?: HTMLElement | Window;
      eventsTarget?: HTMLElement | Window;
      smoothWheel?: boolean;
      syncTouch?: boolean;
      syncTouchLerp?: number;
      touchInertiaMultiplier?: number;
      duration?: number;
      easing?: (t: number) => number;
      direction?: 'vertical' | 'horizontal';
      gestureDirection?: 'vertical' | 'horizontal' | 'both';
      smoothTouch?: boolean;
      touchMultiplier?: number;
      wheelMultiplier?: number;
      infinite?: boolean;
      lerp?: number;
    });

    // Methods
    raf(time: number): void;
    on(event: string, callback: (e: any) => void): void;
    off(event: string, callback: (e: any) => void): void;
    start(): void;
    stop(): void;
    destroy(): void;
    onWindowResize(): void;
    scrollTo(
      target: HTMLElement | number | string | { top?: number; left?: number },
      options?: {
        offset?: number;
        immediate?: boolean;
        duration?: number;
        easing?: (t: number) => number;
      }
    ): void;
    setScroll(x: number, y: number): void;
    getScroll(): { x: number; y: number };
    getLimit(): { x: number; y: number };
    getVelocity(): { x: number; y: number };
    isStopped(): boolean;
    isScrolling(): boolean;
  }
}
