import React from 'react';
import moment from 'moment';
import electron from 'electron';

import styles from './styles.css';

export default function (props) {
  const time = moment.unix(props.story.time).fromNow();
  const site = props.story.url.replace(/(https?:\/\/)(www\.)?([^\/]+)(.+)/, '$3');
  const userUrl = props.story.url;
  return (
    <li className={props.story.seen ? styles.story + ' ' + styles.seenStory : styles.story} onClick={props.onClick} key={props.story.id}>
      <div className={styles.scoreWrapper}>
        <button className={styles.favoriteBtn} />
        <span className={styles.score}>{props.story.score}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{props.story.title}</div>
        <div className={styles.subtitle}>
          {site}
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          by <a href="#" onClick={(e) => electron.shell.openExternal(userUrl)}>{props.story.by}</a>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          {time}
        </div>
      </div>
      <div className={styles.commentsWrapper}>
        <span>{props.story.kids && props.story.kids.length}</span>
      </div>
    </li>
  );
}
