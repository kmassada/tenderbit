## Node Version 6
```
nvm install 6
nvm use 6
```

## Dependencies
```
npm install gulp typings typescript@beta --global
npm install jscs jshint --global
npm install --save express
tsc  --init --module commonjs --target es5
typings init
typings install dt~express dt~mime dt~serve-static dt~express-serve-static-core env~node --global
```
## Project
→ npm run
```
Lifecycle scripts included in node6:
  start
    node dist/app.js
  postinstall
    typings install
  test
    echo "Error: no test specified" && exit 1

available via `npm run-script`:
  build
    tsc
  clean
    rm -rf dist
  tsc
    tsc
  tsc:w
    tsc -w
  typings
    typings
```