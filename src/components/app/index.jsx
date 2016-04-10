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

  handleFavoriteClick(story) {
    return (e) => {
      if (this.props.getState().favoriteStories[story.id]) {
        this.props.dispatch(actions.removeFromFavorites(story));
      } else {
        this.props.dispatch(actions.addToFavorites(story));
      }
    };
  }

  render() {
    const { stories, filter, favoriteStories } = this.props.getState();
    const storiesBeingLoaded = stories.filter(s => s.loading).length;

    let content, filteredStories;
    switch (filter.activeTab) {
      case 'topStories':
        filteredStories = stories.filter(s => s.loaded && s.score >= filter.scoreLimit);
        content = <StoryList
          stories={filteredStories}
          favoriteStories={favoriteStories}
          handleClick={::this.handleClick}
          handleFavoriteClick={::this.handleFavoriteClick}
          onScrollToEnd={() => this.props.dispatch(actions.requestStories())} />
        break;
      case 'favoriteStories':
        content = <StoryList
          stories={Object.keys(favoriteStories).map(key => favoriteStories[key])}
          favoriteStories={favoriteStories}
          handleClick={::this.handleClick}
          handleFavoriteClick={::this.handleFavoriteClick}
          onScrollToEnd={() => this.props.dispatch(actions.requestStories())} />
        break;
      case 'info':
        content = (
          <div className={styles.page}>
            <p>
              <strong>
                Hacker News is a social news website focusing on computer science and entrepreneurship.
                It is run by Paul Graham's investment fund and startup incubator, Y Combinator.
                In general, content that can be submitted is defined as "anything that gratifies one's intellectual curiosity".
              </strong>
            </p>
            <p>
              This is an unofficial app that helps you filter the most interesting stories and has been created in educational manner.
              It also gives you the option to mark story as a favorite or save it for later this way.
            </p>
            <p>
              Please report any bugs and issues to <a href="http://github.com/romanschejbal/electron-blog">Github</a>
            </p>
          </div>
        );
        break;
      default:
        break;
    }

    return (
      <div>
        <div className={styles.header}>
          <h1 onClick={() => electron.shell.openExternal(`https://news.ycombinator.com/`)}>
            Hacker News
          </h1>
          <button className={styles.infoBtn} onClick={() => this.props.dispatch(actions.switchTab('info'))} />
          {storiesBeingLoaded > 0 && <div className={styles.updatingStories}>updating<br />{storiesBeingLoaded} stories</div>}
        </div>
        <div className={styles.subHeader}>
          <button className={styles.topStoriesBtn} onClick={() => this.props.dispatch(actions.switchTab('topStories'))} />
          <button className={styles.favoriteStoriesBtn} onClick={() => this.props.dispatch(actions.switchTab('favoriteStories'))} />
        </div>

        {content}

        <div className={styles.footer}>
          <button hidden={filter.activeTab !== 'topStories'} className={styles.markAllAsReadBtn} onClick={() => this.props.dispatch(actions.markAllAsRead(filteredStories))}>Mark all as read</button>
          <div className={styles.filter}>
            <div className={styles.scoreLimit}>{filter.scoreLimit}</div>
            <input type="range" min="0" max="1000" value={filter.scoreLimit} onChange={(e) => this.props.dispatch(actions.updateScoreLimit(e.target.value))} />
          </div>
          <button className={styles.quitBtn} onClick={() => ipcRenderer.send('quit')}>Quit App</button>
        </div>
      </div>
    );
  }
}
