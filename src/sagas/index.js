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

function* requestUpdateStory() {
  while (true) {
    const { story } = yield take(actions.REQUEST_UPDATE_STORY);
    yield fork(updateStory, story);
  }
}

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

function* autoRequestStories() {
  while (true) {
    yield call(delay, 3600 * 1000); // fetch new stories every hour
    yield put(actions.requestStories());
  }
}

function* autoUpdateStories(getState) {
  while (true) {
    yield getState().stories
      .filter(story => // update stories that haven't been updated within the past hour and are not older than 1 day
        story.loaded && moment().diff(moment(story.updated)) > 3600 * 1000 && moment().diff(moment.unix(story.time)) < 3600 * 1000 * 24)
      .slice(0, 10) // limit to update 10 stories at a time
      .map(story => call(updateStory, story));
    yield call(delay, 60 * 10 * 1000); // update loaded stories every 10 minutes
  }
}

function* notificationAboutStory(getState) {
  while (true) {
    const { story } = yield take(actions.FETCHED_STORY);
    const { scoreLimit } = getState().filter;
    if (story.score >= scoreLimit) {
      const notification = new Notification(`Hacker News ${story.score} 👍💥 votes`, {
        body: story.title
      });
      notification.onclick = () => {
        electron.shell.openExternal(story.url);
      };
    }
  }
}

export default function* root() {
  const { store } = yield take('APP_INIT');
  yield fork(fetchTopStories, store.getState);
  yield fork(autoRequestStories);
  yield fork(requestUpdateStory);
  yield fork(autoUpdateStories, store.getState);
  yield fork(notificationAboutStory, store.getState);
  yield put(actions.requestStories());
}
