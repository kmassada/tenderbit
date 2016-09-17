## Node Version 6
nvm install 6
nvm use 6

## Dependencies
npm install gulp typings typescript --global
npm install --save express
tsc  --init --module commonjs --target es5
typings init
typings install dt~express dt~mime dt~serve-static dt~express-serve-static-core env~node --global