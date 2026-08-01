type Listener<T = unknown> = (detail: T) => void;

export class EventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on<T = unknown>(event: string, handler: Listener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler as Listener);
    return () => this.off(event, handler);
  }

  off<T = unknown>(event: string, handler: Listener<T>): void {
    this.listeners.get(event)?.delete(handler as Listener);
  }

  emit<T = unknown>(event: string, detail: T): void {
    this.listeners.get(event)?.forEach((h) => h(detail));
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
