import React, { Component } from 'react';
import electron from 'electron';
import moment from 'moment';

import styles from './styles.css';

export default class App extends Component {

  state = {
    scoreLimit: 0
  };

  componentDidMount() {
    // new Notification(item.score + ' 💥 VOTES 💥', {
    //   body: item.title,
    //   silent: true
    // });
  }

  handleClick(story) {
    return (e) => {
      e.preventDefault();
      electron.shell.openExternal(story.url);
    };
  }

  renderStory(story) {
    if (!story.loaded) {
      return <div key={story.id}>loading</div>;
    }

    const time = moment.unix(story.time).fromNow();

    return (
      <li className={styles.story} onClick={this.handleClick(story)} key={story.id}>
        <span className={styles.storyTitle}>{story.title}</span>
        <span className={styles.storyScore}>{story.score} points by {story.by}</span>
        <span className={styles.storyTime}>{time}</span>
      </li>
    );
  }

  render() {
    const { stories } = this.props.getState();
    const storiesBeingLoaded = stories.filter(s => !s.loaded).length;

    return (
      <div>
        <div className={styles.header}>
          <h1>Hacker News</h1>
          <input type="range" min="0" max="1000" value={this.state.scoreLimit} onChange={(e) => this.setState({ scoreLimit: e.target.value })} />
        </div>

        {storiesBeingLoaded > 0 && <h4>loading {storiesBeingLoaded} more stories</h4>}
        <ol className={styles.storyList}>
          {stories
            .filter(s => s.loaded && s.score >= this.state.scoreLimit)
            //.sort((a, b) => b.score - a.score)
            .map(::this.renderStory)}
        </ol>
      </div>
    );
  }
}
