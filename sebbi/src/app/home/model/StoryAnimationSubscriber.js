import { StorySubscriber } from "./StorySubscriber";

// Concrete Subscriber for Story Animations ( observer pattern my guy)
export class StoryAnimationSubscriber extends StorySubscriber {
  constructor(setVisibleSections) {
    super();
    this.setVisibleSections = setVisibleSections;
  }

  update(state) {
    this.setVisibleSections(state.visibleSections);
  }
}
