# HackerNews app made with Electron

I built this app when I was learning about Electron. There is a blog post about it [here](http://red-badger.com/blog/2016/04/18/building-desktop-apps-with-electron-webpack-and-redux/).

## Download
[Releases](https://github.com/romanschejbal/electron-blog/releases)

## The Article

### Building Desktop Apps With Electron, Webpack and Redux

In March 2016, as a part my annual training budget - a perk that every badger gets - I had the opportunity to go all the way to the Fluent Conf, which was in sunny San Francisco. You can read the best bits from the conference in Alex's [blog](http://red-badger.com/blog/2016/03/29/oreilly-fluent-2016-impressions-and-trends/).

One of the workshops I attended was about building a basic desktop application with Electron, that’d be compiled for every major OS and I’d like to share the knowledge and the takeaways I grasped during a 3 hour long session. 

We’ll take a high level look at how Electron works, but we’ll also use [ES2015/16](https://themeteorchef.com/blog/what-is-es2015/), [Git](https://en.wikipedia.org/wiki/Git_(software)), [Webpack](https://webpack.github.io/), [Babel](http://babeljs.io) and a bit of [Redux](http://redux.js.org/), therefore it’s good to have a clue about what those are so we can focus on our topic and it’s not too overwhelming. We’ll see how we can implement live reloading and get that fast-paced development cycle that most of today’s developers are used to.
### What we’ll be building
To highlight some of the things that a desktop application excels in from a normal web app, we’ll need to build something using the native features. Electron provides many APIs above the native functionality and I’ve decided to build a simple HackerNews app or a watcher, that’ll let me know when there is a popular post (>= XXX votes), because I don’t want to miss those and it’s quite reasonable size of a project for this purpose. Well, at least I thought so when I started writing this blog. ¯\_(ツ)_/¯ You can download the app (for Mac) [here](https://github.com/romanschejbal/electron-blog/releases).

![app](https://static1.squarespace.com/static/5783a7e19de4bb11478ae2d8/t/5821d56009e1c4674873b0ce/1478614150421/Screenshot-2016-04-12-15.25.26.png?format=750w)

If we go to the Electron [homepage](http://electron.atom.io/), we’ll find quick startup instructions at the bottom of that page; so startup your terminal and let’s get on with it!

_Note: make sure you have the latest node and npm installed to avoid any potential errors_

```
# Clone the Quick Start repository
$ git clone https://github.com/atom/electron-quick-start

# Go into the repository
$ cd electron-quick-start

# Install the dependencies and run
$ npm install && npm start
```

After running those commands you should have a Hello World app running on your desktop.

### Main Process
What you see is genuinely a browser window, in electron we call them renderers and they are created by the main process. By main process we mean the __main script defined inside package.json__. You can think of it like a parent of all it’s children (renderers) that is responsible for creating instances of the BrowserWindow class. This is also the place where you’d work with file system operations for example.

### Renderer Process
The browser window you see is one renderer process. Electron uses Chromium for displaying pages, but it’s topped with some Node.js APIs allowing interactions on a lower level.

Now that we know the entry point, let’s have a look into it. It’s pretty well commented out of the box so should give you a good idea what’s going on in there.

_main.js_

```
'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
```

On the application `ready` event we call the createWindow function that’ll instantiate a new BrowserWindow (a renderer process) and load url `'file://' + __dirname + '/index.html;'` which is our main html file, from there on we are in our very known single-page application land. Also, we programmatically open the Developer Tools by calling `mainWindow.webContents.openDevTools();` since Cmd+Alt+J does not do anything inside Electron.

Looking into the index.html we can see there is a usage of the __global `process` variable__ and as you know this is not available in a normal browser window. It carries all the environment values that can come in handy as we’ll see in our app. 

_index.html_

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using node <script>document.write(process.versions.node)</script>,
    Chromium <script>document.write(process.versions.chrome)</script>,
    and Electron <script>document.write(process.versions.electron)</script>.
  </body>
</html>
```

I mentioned that the renderer is topped with some Node.JS APIs, the `process` variable is one of them. The other one worth mentioning is that __you can actually use `require` on the client__ and load modules as you do in Node environment, but we’ll go a slightly different direction today. 

### The setup
We’ll use Webpack with it’s hot module replacement (HMR for short) for live reloading. So we need to build a little server that’ll host and reload our code while we develop.

In order to do that, we need to install a few node modules:

```
npm i —save-dev express webpack webpack-dev-middleware webpack-hot-middleware webpack-target-electron-renderer
```

Then we create a basic webpack configuration:

_webpack.config.development.js_

```
var webpack = require('webpack');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

var config = {
  entry: [
    'webpack-hot-middleware/client?reload=true&path=http://localhost:9000/__webpack_hmr',
    './src/index',
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }, {
      test: /\.png|\.svg$/,
      loaders: ['file-loader']
    }]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: 'http://localhost:9000/dist/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ]
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
```

Since the electron index.html page is running from the file system, we need to provide a correct path for the webpack-hot-middleware so it knows where to connect. Same goes with the `output.publicPath` for the webpack-dev-middleware so the reload of scripts works properly. The webpack-target-electron-renderer is needed to set all of __electron built-in modules as externals__ plus some other bits here and there. You can find out what exactly it’s doing in the [npm package](https://github.com/chentsulin/webpack-target-electron-renderer) itself.
Also, as you can see we’ll use babel and css-modules so we actually need to install a few more modules which you can do with this command:

```
npm i —save-dev babel-cli babel-loader babel-polyfill babel-preset-es2015 babel-preset-stage-0 babel-preset-react css-loader style-loader postcss-loader
```

Now that we have our config, let’s write up the server and connect it to Webpack.

_server.js_

```
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from './webpack.config.development';

const compiler = webpack(config);
const app = express();

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

app.use(webpackHotMiddleware(compiler));

app.listen(9000);
```

Update the index.html to use the built javascript.

_index.html_

```
...
  <body>
    <div id="root">
      We are using node <script>document.write(process.versions.node)</script>,
      Chromium <script>document.write(process.versions.chrome)</script>,
      and Electron <script>document.write(process.versions.electron)</script>.
    </div>
    <script>
      (function() {
        const script = document.createElement('script');
        script.src = process.env.ENV === 'development' ? 'http://localhost:9000/dist/bundle.js' : './dist/bundle.js';
        document.write(script.outerHTML);
      }());
    </script>
  </body>
...
```

Then tweak the package.json for a babel configuration and a startup script:

_package.json_

```
{
  ...
  "main": "index.js",
  "scripts": {
    "start": "ENV=development electron .",
    "server": "babel-node server.js"
  },
  "babel": {
    "presets": [
      "es2015",
      "stage-0",
      "react"
    ]
  }
  ...
}
```

But now we have to run two scripts to startup the app.

```
npm start
npm run server
```

Let’s get rid of that by installing the [concurrently module](https://www.npmjs.com/package/concurrently ) `npm i —save-dev concurrently`, update the package.json once more and we are back to one command:
`npm run dev`

_package.json_

```
{
  ...
  "scripts": {
    "start": "ENV=development electron .",
    "dev": "concurrently -k 'babel-node server.js' 'npm start'"
  },
  ...
}
```

### Engage dev
Until this point, we were setting up the development environment to have this convenient developer experience. From here we’ll actually start building our app, but I want to apologize for omitting (on purpose) quite a lot of app-specific stuff just because we want to primarily focus on the electron APIs and see the usage of it. In any case, you can find the full source code on [my github](http://github.com/romanschejbal/electron-blog).

Inside the webpack config we’ve set the entry point to `./src/index`, so here is the content of it. 

_src/index.js_

```
import 'babel-polyfill'; // generators
import React from 'react';
import { render as renderReact } from 'react-dom';
import debounce from 'debounce';
import configureStore from './store/configureStore';

const state = JSON.parse(localStorage.getItem('state'));
const store = configureStore(state || {});

let App = require('./components/app').default;
const render = (Component) => {
  renderReact(<Component {...store} />, document.getElementById('root'));
};

if (module.hot) {
  module.hot.accept('./components/app', function() {
    let newApp = require('./components/app').default;
    render(newApp);
  });
}

const saveState = debounce(() => {
  localStorage.setItem('state', JSON.stringify(store.getState()));
}, 1000);
store.subscribe(() => {
  saveState();
  render(App);
  if (process.env.ENV === 'development') {
    console.log('state', store.getState());
  }
});
store.dispatch({ type: 'APP_INIT', store });
```

Since we are using Redux and having a global state of the app on one place, we can use this minimal HMR mechanism that’s inspired by Dan Abramov’s [blog](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf).
Basically we re-render the app every time when something that’s imported under the App or even the App component itself changes. If it’s something else, we then refresh the whole page as this is set by query parameter `reload=true` inside our webpack config. Additionally we could write a reducer replacement mechanism so the webpack doesn’t have to refresh the page when we update actions, reducers or sagas. On any change of the state we save it into the localStorage, therefore we don’t really care about losing the state after refresh.

### Moving on

_src/sagas/index.js_

```
function fetchTopStoriesApi() {
  return fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`)
          .then(response => response.json())
          .then(stories => stories.map(storyId => ({ id: storyId, loaded: false, loading: false })));
}
```

I’m using [redux-saga](https://github.com/yelouafi/redux-saga) but feel free to use anything else like [redux-thunk](https://github.com/gaearon/redux-thunk) or not redux at all! The key thing to see here is the native `fetch` function for collecting HackerNews stories. I want to point out that in a normal web application I wouldn’t be able to do this (at least on the client side) because of [CORS](https://www.w3.org/TR/cors/). But since we are in a native-like application, __there’s no restriction on CORS in Electron__.

Once we have the stories inside our state, we can print them out and attach some onClick handlers. In a normal web application we’d just create the anchor tag and give it a href, but if we do this inside an electron application and then click on the link, electron would load the page inside giving us no option to go back! What we want instead is to open the story in the user’s default web broswer. That’s where the electron’s [shell module](http://electron.atom.io/docs/v0.37.5/api/shell/) comes into play. 

_src/components/app/index.jsx_

```
import electron from 'eletron';
...
handleClick(story) {
    return (e) => {
      electron.shell.openExternal(story.url);
      this.props.dispatch(actions.clickedStory(story));
    };
  }
```

Now let’s just skip all the other components, reducers and have a look at one particular action.

_src/actions/index.js_

```
export function notifyAboutStory(story, onClick) {
  const notification = new Notification(`Hacker News ${story.score} 👍💥 votes`, {
    body: story.title
  });
  notification.onclick = onClick;
  ...
}
```

This is where we trigger the native notification to pop up. It follows the [Web\Notification](https://developer.mozilla.org/en/docs/Web/API/notification) API so if you, for example, want to make it silent, you’d just add that as an option inside the options parameter within the constructor.

### Communication between processes
Sometimes, depending on what we’re building we might need to communicate from the renderer process to the main process. It could be anything from a native open-file [dialog](http://electron.atom.io/docs/v0.37.5/api/dialog/) that’s available only on the main process, or simply quitting the application with `app.quit()` as we have here.

Processes may communicate by messaging each other via [ipcRenderer](http://electron.atom.io/docs/v0.37.5/api/ipc-renderer/) or [ipcMain](http://electron.atom.io/docs/v0.37.5/api/ipc-main/) (depending on what side is being implemented) which is basically an instance of EventEmitter and we use it like this:

Event emitting:
_src/components/app/index.jsx_

```
import electron, { ipcRenderer } from 'eletron';
...
<button className={styles.quitBtn} onClick={() => ipcRenderer.send('quit')}>Quit App</button>
```

Listening on event and taking an action:
_main.js_

```
...
var ipcMain = electron.ipcMain;
ipcMain.on('quit', () => {
  app.quit();
});
```

### Driving this home
From the screenshot above you can see we have the app inside the OSX menubar, we’ll use this [menubar](https://github.com/maxogden/menubar) package for it’s ease of use and all we have to do is to update our main.js to implement it.

_main.js_

```
...
var menubar = require('menubar');
const mb = menubar({
  'width': 500,
  'height': 700,
  'preload-window': true,
  'resizable': false
});
mb.on('ready', function ready () {
  console.log('app is ready')
  // your app code here
});
```

### Building the app
For building the app we have a special webpack production config, that just overrides some of the development configuration and saves the build into a dist folder.

Then we use [electron-packager](https://github.com/electron-userland/electron-packager) to get the actual executable build.

Our final scripts section inside package.json looks like this:

_package.json_

```
...
  "scripts": {
    "start": "ENV=development electron .",
    "dev": "concurrently -k 'babel-node server.js' 'npm start'",
    "build": "webpack --config webpack.config.production.js && electron-packager . HackerNews --platform=darwin --arch=all --overwrite"
  },
...
```

And that’s it! If you have any questions, use the comments below or get in touch on [twitter](http://twitter.com/romanschejbal).
