import { StorySubscriber } from "./StorySubscriber";

// Concrete Subscriber for Scroll Progress ( observer pattern my guy)
export class ScrollProgressSubscriber extends StorySubscriber {
  constructor(setScrollProgress) {
    super();
    this.setScrollProgress = setScrollProgress;
  }

  update(state) {
    this.setScrollProgress(state.scrollProgress);
  }
}
