import { take, put, call, fork } from 'redux-saga/effects';
import moment from 'moment';
import electron from 'electron';
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

function* watchRequestTopStories(getState) {
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
      return false;
    }).slice(0, limit);

    yield stories.map(function* (story) {
      yield call(updateStory, story);
    });
  }
}

function* updateStory(story) {
  yield put(actions.fetchingStory(story));
  const data = yield call(fetchStory, story.id);
  yield put(actions.fetchedStory(data));
}

function* watchRequestUpdateStory() {
  while (true) {
    const { story } = yield take(actions.REQUEST_UPDATE_STORY);
    yield fork(updateStory, story);
  }
}

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

function* startAutoRequestStories() {
  while (true) {
    yield call(delay, 3600 * 1000); // fetch new stories every hour
    yield put(actions.requestStories());
  }
}

function* startAutoUpdateStories(getState) {
  while (true) {
    yield getState().stories
      .filter(story => // update stories that haven't been updated within the past hour and are not older than 1 day
        story.loaded && moment().diff(moment(story.updated)) > 3600 * 1000)// && moment().diff(moment.unix(story.time)) < 3600 * 1000 * 24)
      .map(story => call(updateStory, story));
    yield call(delay, 60 * 10 * 1000); // update loaded stories every 10 minutes
  }
}

function* notifyAboutStory(story, dispatch) {
  yield put(actions.notifyAboutStory(story, () => {
    console.log(story)
    electron.shell.openExternal(story.url);
    dispatch(actions.clickedStory(story));
  }));
}

function* watchFetchedStory(getState, dispatch) {
  while (true) {
    const { story } = yield take(actions.FETCHED_STORY);
    const { scoreLimit } = getState().filter;
    if (story.score >= scoreLimit && getState().seenStories.indexOf(story.id) === -1) {
      yield fork(notifyAboutStory, story, dispatch);
    }
  }
}

export default function* root() {
  const { store } = yield take('APP_INIT');
  yield fork(watchRequestTopStories, store.getState);
  yield fork(watchRequestUpdateStory);
  yield fork(startAutoUpdateStories, store.getState);
  yield fork(watchFetchedStory, store.getState, store.dispatch);
  yield fork(startAutoRequestStories);
  yield put(actions.requestStories());
}
