import React, { Component } from 'react';
import electron from 'electron';
import moment from 'moment';

import * as actions from '../../actions';
import styles from './styles.css';

export default class App extends Component {

  componentDidMount() {
    const rootEl = document.getElementById('root');
    rootEl.onscroll = () => {
      if (rootEl.scrollTop + rootEl.offsetHeight >= rootEl.scrollHeight) {
        this.props.dispatch(actions.requestStories(50));
      }
    };
  }

  handleClick(story) {
    return (e) => {
      e.preventDefault();
      electron.shell.openExternal(story.url);
      this.props.dispatch(actions.clickedStory(story));
    };
  }

  renderStory(story) {
    const time = moment.unix(story.time).fromNow();

    if (story.dead) {
      return (
        <li className={styles.story} onClick={this.handleClick(story)} key={story.id}>
          <del className={styles.storyTitle}>{story.title}</del>
        </li>
      )
    }

    return (
      <li className={story.seen ? styles.story + ' ' + styles.seenStory : styles.story} onClick={this.handleClick(story)} key={story.id}>
        <span className={styles.storyTitle}>{story.title}</span>
        <span className={styles.storyScore}>{story.score} points by {story.by}</span>
        <span className={styles.storyTime}>{time}</span>
      </li>
    );
  }

  render() {
    const { stories, filter } = this.props.getState();
    const storiesBeingLoaded = stories.filter(s => s.loading).length;

    return (
      <div>
        <div className={styles.header}>
          <h1 onClick={() => electron.shell.openExternal(`https://news.ycombinator.com/`)}>
            Hacker News
          </h1>
          {storiesBeingLoaded > 0 && <small>updating {storiesBeingLoaded} more stories</small>}
          <span className={styles.scoreLimit}>{filter.scoreLimit}</span>
          <input type="range" min="0" max="1000" value={filter.scoreLimit} onChange={(e) => this.props.dispatch(actions.updateScoreLimit(e.target.value))} />
        </div>
        <ol className={styles.storyList}>
          {stories
            .filter(s => s.loaded && s.score >= filter.scoreLimit)
            .map(::this.renderStory)}
        </ol>
      </div>
    );
  }
}
