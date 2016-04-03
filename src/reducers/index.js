import { combineReducers } from 'redux';
import * as actions from '../actions';

const filterInitialState = {
  scoreLimit: 0
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
        loading: true,
        loaded: false
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
        loading: false,
        loaded: true
      };
      return state.map(story => {
        if (story.id === action.story.id) {
          return action.story;
        }
        return story;
      });
    case 'DELETE':
      return state.filter(s => s.id !== action.story.id);
    default:
      return state;
  }
};

export default combineReducers({
  filter: filterReducer,
  stories: storiesReducer
});
