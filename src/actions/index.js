export const REQUEST_STORIES = 'REQUEST_STORIES';
export const FETCHED_STORIES = 'FETCHED_STORIES';

export const FETCHING_STORY = 'FETCHING_STORY';
export const FETCHED_STORY = 'FETCHED_STORY';

export const REQUEST_UPDATE_STORY = 'REQUEST_UPDATE_STORY';

export const UPDATE_SCORE_LIMIT = 'UPDATE_SCORE_LIMIT';

export function requestStories(limit = 10) {
  return {
    type: REQUEST_STORIES,
    limit
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

export function updateScoreLimit(newScoreLimit) {
  return {
    type: UPDATE_SCORE_LIMIT,
    newScoreLimit
  }
}

export function requestUpdateStory(story) {
  return {
    type: REQUEST_UPDATE_STORY,
    story
  }
}
