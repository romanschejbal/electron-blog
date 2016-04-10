import React from 'react';
import moment from 'moment';
import electron from 'electron';

import styles from './styles.css';

export default function (props) {
  const time = moment.unix(props.story.time).fromNow();
  const site = props.story.url.replace(/(https?:\/\/)(www\.)?([^\/]+)(.+)/, '$3');
  const userUrl = props.story.url;
  let style = [styles.story];
  if (props.story.seen) {
    style.push(styles.seenStory);
  }
  if (props.isFavorite) {
    style.push(styles.favoriteStory);
  }
  return (
    <li className={style.join(' ')} key={props.story.id}>
      <div className={styles.scoreWrapper} onClick={props.onFavoriteClick}>
        <button className={styles.favoriteBtn} />
        <span className={styles.score}>{props.story.score}</span>
      </div>
      <div className={styles.body} onClick={props.onClick}>
        <div className={styles.title}>{props.story.title}</div>
        <div className={styles.subtitle}>
          {site}
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          by <a href="#" onClick={(e) => electron.shell.openExternal(userUrl)}>{props.story.by}</a>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          {time}
        </div>
      </div>
      <div className={styles.commentsWrapper} onClick={props.onCommentsClick}>
        <span>{props.story.kids && props.story.kids.length}</span>
      </div>
    </li>
  );
}
