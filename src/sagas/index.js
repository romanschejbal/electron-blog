import { take, put, call, fork, select } from 'redux-saga/effects';
import * as actions from '../actions'

function fetchStory(storyId) {
  return fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`)
          .then(response => response.json());
}

function fetchTopStoriesApi() {
  return fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`)
          .then(response => response.json())
          .then(stories => stories.map(storyId => ({ id: storyId, loaded: false, loading: false })));
}

function* fetchTopStories(getState) {
  while (true) {
    const { limit } = yield take(actions.REQUEST_STORIES);
    const allStories = yield call(fetchTopStoriesApi);
    yield put(actions.fetchedStories(allStories));

    const stories = allStories.filter(story => {
      const storyFromState = getState().stories.find(s => s.id === story.id);
      if (!storyFromState) {
        return true;
      }
      if (!storyFromState.loaded) {
        return true;
      }
      // if (storyFromState.updated)
      return false;
    }).slice(0, limit);

    yield stories.map(function* (story) {

      yield put(actions.fetchingStory(story));
      const data = yield call(fetchStory, story.id);
      yield put(actions.fetchedStory(data));
    });
  }
}

function* autoRequestStories() {
  const delay = () => {
    return new Promise((resolve) => setTimeout(() => resolve(), 3600 * 1000));
  }

  while(true) {
    yield call(delay);
    yield put(actions.requestStories());
  }
}

export default function* root() {
  const { store } = yield take('APP_INIT');
  yield fork(fetchTopStories, () => store.getState());
  yield put(actions.requestStories());
  yield fork(autoRequestStories);
}
