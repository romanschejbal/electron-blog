import { combineReducers } from 'redux';
import * as actions from '../actions';

const filterInitialState = {
  scoreLimit: 200
};
const filterReducer = (state = filterInitialState, action) => {
  switch (action.type) {
    case actions.UPDATE_SCORE_LIMIT:
      return {
        scoreLimit: action.newScoreLimit
      }
    default:
      return state;
  }
};

const storiesInitialState = [];
const storiesReducer = (state = storiesInitialState, action) => {
  switch (action.type) {
    case actions.FETCHED_STORIES:
      return action.stories.map(story => {
        const stateStory = state.find(s => s.id === story.id);
        if (stateStory && stateStory.loaded) {
          return stateStory;
        }
        return story;
      });
    case actions.FETCHING_STORY:
      action.story = {
        ...action.story,
        loading: true
      };
      return state.map(story => {
        if (story.id === action.story.id) {
          return action.story;
        }
        return story;
      });
    case actions.FETCHED_STORY:
      action.story = {
        ...action.story,
        updated: new Date(),
        loading: false,
        loaded: true
      };
      if (!action.story.url) {
        action.story.url = `https://news.ycombinator.com/item?id=${action.story.id}`;
      }
      return state.map(story => {
        if (story.id === action.story.id) {
          return {
            ...story,
            ...action.story,
          };
        }
        return story;
      });
    case actions.CLICKED_STORY:
      return state.map(story => {
        if (story.id === action.story.id) {
          return {
            ...story,
            seen: true
          };
        }
        return story;
      });
    case actions.MARK_ALL_AS_READ:
      return state.map(story => {
        if (action.stories.find(s => s.id === story.id)) {
          return {
            ...story,
            seen: true
          };
        }
        return story;
      });
    case 'DELETE':
      return state.filter(s => s.id !== action.story.id);
    default:
      return state;
  }
};


const seenStoriesInitialState = [];
const seenStoriesReducer = (state = seenStoriesInitialState, action) => {
  switch (action.type) {
    case actions.NOTIFY_ABOUT_STORY:
      return state.concat([action.story.id]);
    case actions.MARK_ALL_AS_READ:
      return state
        .concat(action.stories.map(story => story.id))
        .filter(id => action.stories.some(s => s.id === id)) // remove old stories
        .sort()
        .reduce((arr, id) => (arr.length > 0 && arr[arr.length - 1] === id) ? arr : [...arr, id], []);
    default:
      return state;
  }
};

export default combineReducers({
  filter: filterReducer,
  stories: storiesReducer,
  seenStories: seenStoriesReducer
});
