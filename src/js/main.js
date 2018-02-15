'use strict';

var PlayScene = require('./play_scene.js');

window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('play', PlayScene);

  game.state.start('play');
};
