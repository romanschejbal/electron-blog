import { combineReducers } from 'redux';
import * as actions from '../actions';

const storiesInitialState = [];
const storiesReducer = (state = storiesInitialState, action) => {
  switch (action.type) {
    case actions.FETCHED_STORIES:
      return action.stories;
    case actions.FETCHING_STORY:
      return state;
    case actions.FETCHED_STORY:
      return state.map(story => {
        if (story.id === action.story.id) {
          return action.story;
        }
        return story;
      });
    default:
      return state;
  }
};

export default combineReducers({
  stories: storiesReducer
});
