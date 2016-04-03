import { take, put, call, fork, select } from 'redux-saga/effects';
import * as actions from '../actions'

function fetchStory(storyId) {
  return fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`)
          .then(response => response.json());
}

function fetchTopStoriesApi() {
  return fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`)
          .then(response => response.json())
          .then(stories => stories.map(storyId => ({ id: storyId, loaded: false })));
}

function* fetchTopStories(limit) {
  const stories = yield call(fetchTopStoriesApi);
  yield put(actions.fetchedStories(stories.slice(0, limit)));

  yield stories.slice(0, limit).map(function* (story) {
    yield put(actions.fetchingStory(story));
    const data = yield call(fetchStory, story.id);
    yield put(actions.fetchedStory({
      ...data,
      loaded: true
    }));
  });
}

export default function* root() {
  yield take('APP_INIT');
  yield fork(fetchTopStories, 500);
}
