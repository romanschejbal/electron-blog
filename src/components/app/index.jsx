import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
import moment from 'moment';

import * as actions from '../../actions';
import styles from './styles.css';
import StoryList from '../story-list';

export default class App extends Component {

  handleClick(story) {
    return (e) => {
      e.preventDefault();
      electron.shell.openExternal(story.url);
      this.props.dispatch(actions.clickedStory(story));
    };
  }

  render() {
    const { stories, filter } = this.props.getState();
    const storiesBeingLoaded = stories.filter(s => s.loading).length;

    const filteredStories = stories.filter(s => s.loaded && s.score >= filter.scoreLimit);

    return (
      <div>
        <div className={styles.header}>
          <h1 onClick={() => electron.shell.openExternal(`https://news.ycombinator.com/`)}>
            Hacker News
          </h1>
          <button className={styles.infoBtn} />
          <button className={styles.settingsBtn} />
          <div className={styles.filter}>
            {storiesBeingLoaded >= 0 && <small>updating {storiesBeingLoaded} stories</small>}
            <span className={styles.scoreLimit}>{filter.scoreLimit}</span>
            <input type="range" min="0" max="1000" value={filter.scoreLimit} onChange={(e) => this.props.dispatch(actions.updateScoreLimit(e.target.value))} />
          </div>
        </div>
        <div className={styles.subHeader}>
          <button className={styles.topStoriesBtn} />
          <button className={styles.favoriteStoriesBtn} />
        </div>

        <StoryList stories={filteredStories} handleClick={::this.handleClick} onScrollToEnd={() => this.props.dispatch(actions.requestStories())} />

        <div className={styles.footer}>
          <button className={styles.markAllAsReadBtn} onClick={() => this.props.dispatch(actions.markAllAsRead(filteredStories))}>Mark all as read</button>
          <button className={styles.quitBtn} onClick={() => ipcRenderer.send('quit')}>Quit</button>
        </div>
      </div>
    );
  }
}
