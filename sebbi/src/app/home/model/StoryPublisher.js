// Subject/Publisher Interface - Observer Pattern
export class StoryPublisher {
  constructor() {
    this.subscribers = [];
    this.state = {
      visibleSections: new Set(),
      activeSection: 0,
      scrollProgress: 0,
    };
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  notifySubscribers() {
    this.subscribers.forEach((subscriber) => {
      subscriber.update(this.state);
    });
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }
}
