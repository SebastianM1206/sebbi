import { StorySubscriber } from "./StorySubscriber";

// Concrete Subscriber for Progress Indicator
export class ProgressIndicatorSubscriber extends StorySubscriber {
  constructor(setActiveSection) {
    super();
    this.setActiveSection = setActiveSection;
  }

  update(state) {
    this.setActiveSection(state.activeSection);
  }
}
