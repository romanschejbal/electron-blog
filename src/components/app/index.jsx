import React, { Component } from 'react';

export default class App extends Component {

  state = {
    scoreLimit: 0
  };

  componentDidMount() {
  }

  handleClick(story) {
    return (e) => {
      e.preventDefault();
      // new Notification(item.score + ' 💥 VOTES 💥', {
      //   body: item.title,
      //   silent: true
      // });
      // console.log(this.props);
      // this.props.dispatch({
      //   type: 'DELETE',
      //   item
      // });
    };
  }

  renderStory(story) {
    if (!story.loaded) {
      return <div key={story.id}>loading</div>;
    }

    return (
      <div onClick={this.handleClick(story)} key={story.id}>
        <button>{story.score}</button>
        {' '}
        <span>{story.title}</span>
      </div>
    );
  }

  render() {
    const { stories } = this.props.getState();
    const storiesBeingLoaded = stories.filter(s => !s.loaded).length;

    return (
      <div>
        <h3>Hacker News</h3>
        <input type="range" min="0" max="1000" value={this.state.scoreLimit} onChange={(e) => this.setState({ scoreLimit: e.target.value })} />
        {this.state.scoreLimit}

        {storiesBeingLoaded > 0 && <h4>loading {storiesBeingLoaded} more stories</h4>}
        {stories
          .filter(s => s.loaded && s.score >= this.state.scoreLimit)
          .sort((a, b) => b.score - a.score)
          .map(::this.renderStory)}
      </div>
    );
  }
}
