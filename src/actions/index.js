export const REQUEST_STORIES = 'REQUEST_STORIES';
export const FETCHED_STORIES = 'FETCHED_STORIES';

export const FETCHING_STORY = 'FETCHING_STORY';
export const FETCHED_STORY = 'FETCHED_STORY';

export function requestStories() {
  return {
    type: REQUEST_STORIES
  };
}

export function fetchedStories(stories) {
  return {
    type: FETCHED_STORIES,
    stories
  };
}

export function fetchingStory(story) {
  return {
    type: FETCHING_STORY,
    story
  };
}

export function fetchedStory(story) {
  return {
    type: FETCHED_STORY,
    story
  };
}
