angular.module('mahjongg', []).

controller('TileController', ['$scope', $scope => {
  var item = $scope.tile;
  $scope.isSelected = false;
  $scope.isClickable = $scope.$parent.isTileFree(item);

  $scope.clickTile = () => {
    if ($scope.isClickable) {
      $scope.$emit('clickedTile', { scope: $scope, item: item });
    }
  };
  $scope.$on('tilesChanged', (evt, $boardScope) => {
    $scope.isClickable = $boardScope.isTileFree(item);
  });
}]).

factory('Helpers', () => {
  return {};


}).


controller('BoardController', ['$scope', 'Helpers', ($scope, Helpers) => {
  var tilesOnStage = [];
  $scope.tiles = [];
  $scope.selectedTiles = [];
  $scope.width = 30;
  $scope.height = 16;
  $scope.depth = 5;

  // check if i coordinate is valid
  var isCoordValid = (i, j, k) => {
    return i >= 0 && i < $scope.width && j >= 0 && j < $scope.height && k >= 0 && k < $scope.depth;
  };


  // generate tiles array
  $scope.generate = () => {
    var tiles = [],i,j,k,tile;
    for (i = 0; i < $scope.width; i++) {
      tiles[i] = [];
      for (j = 0; j < $scope.height; j++) {
        tiles[i][j] = [];
        for (k = 0; k < $scope.depth; k++) {
          tiles[i][j][k] = undefined;
        }
      }
    }
    tilesOnStage.length = 0;
    Array.prototype.push.apply(tilesOnStage, tiles);
  };

  // create classic mahjongg layout
  $scope.createLayout = () => {
    var i, j;
    for (i = 1; i <= 12; i++) {
      $scope.putTile(i * 2, 0 * 2, 0);
      $scope.putTile(i * 2, 3 * 2, 0);
      $scope.putTile(i * 2, 4 * 2, 0);
      $scope.putTile(i * 2, 7 * 2, 0);
    }
    for (i = 3; i <= 10; i++) {
      $scope.putTile(i * 2, 1 * 2, 0);
      $scope.putTile(i * 2, 6 * 2, 0);
    }
    for (i = 2; i <= 11; i++) {
      $scope.putTile(i * 2, 2 * 2, 0);
      $scope.putTile(i * 2, 5 * 2, 0);
    }
    $scope.putTile(0 * 2, 3 * 2 + 1, 0);
    $scope.putTile(13 * 2, 3 * 2 + 1, 0);
    $scope.putTile(14 * 2, 3 * 2 + 1, 0);
    // Layer 1
    for (i = 4; i <= 9; i++) {
      for (j = 1; j <= 6; j++) {
        $scope.putTile(i * 2, j * 2, 1);
      }
    }
    // Layer 2
    for (i = 5; i <= 8; i++) {
      for (j = 2; j <= 5; j++) {
        $scope.putTile(i * 2, j * 2, 2);
      }
    }
    // Layer 3
    for (i = 6; i <= 7; i++) {
      for (j = 3; j <= 4; j++) {
        $scope.putTile(i * 2, j * 2, 3);
      }
    }
    // Layer 4
    $scope.putTile(6 * 2 + 1, 3 * 2 + 1, 4);
  };

  // randomize tiles, set up all objects
  $scope.randomizeLayout = () => {
    var N, idx, i, j, k;
    var tiles = tilesOnStage;
    var width = $scope.width;
    var height = $scope.height;
    var depth = $scope.depth;
    var count = 0;
    for (N = 1; N <= 34; N++) {
      for (idx = 0; idx < 4; idx++) {
        do
        {
          i = Math.floor(Math.random() * width);
          j = Math.floor(Math.random() * height);
          k = Math.floor(Math.random() * depth);
        } while (!tiles[i][j][k] || tiles[i][j][k] != -1);
        tiles[i][j][k] = {
          position: { x: i, y: j, z: k },
          tile: N,
          value: ++count };

      }
    }
    for (N = 35; N <= 42; N++) {
      do
      {
        i = Math.floor(Math.random() * width);
        j = Math.floor(Math.random() * height);
        k = Math.floor(Math.random() * depth);
      } while (!tiles[i][j][k] || tiles[i][j][k] != -1);
      tiles[i][j][k] = {
        position: { x: i, y: j, z: k },
        tile: N,
        value: ++count };

    }
  };

  $scope.putTile = (x, y, z) => {
    var tiles = tilesOnStage;
    tiles[x][y][z] = -1;
  };

  $scope.$on('clickedTile', (evt, data) => {
    var index = $scope.selectedTiles.indexOf(data.scope);
    if (index > -1) {
      $scope.selectedTiles.splice(index, 1);
      data.scope.isSelected = false;
    } else {
      if ($scope.selectedTiles.length < 2) {
        $scope.selectedTiles.push(data.scope);
        data.scope.isSelected = true;
      }
    }

    if ($scope.selectedTiles.length === 2) {
      var tile1 = $scope.selectedTiles[0];
      var tile2 = $scope.selectedTiles[1];
      tile1.isSelected = false;
      tile2.isSelected = false;

      $scope.selectedTiles.length = 0;

      if ($scope.areTilesEqual(tile1.tile, tile2.tile)) {
        var p1 = tile1.tile.position,p2 = tile2.tile.position;
        tilesOnStage[p1.x][p1.y][p1.z] = undefined;
        tilesOnStage[p2.x][p2.y][p2.z] = undefined;
        $scope.tiles.splice($scope.tiles.indexOf(tile1.tile), 1);
        $scope.tiles.splice($scope.tiles.indexOf(tile2.tile), 1);
      }
    }
  });

  $scope.$watch('tiles.length', (oldVal, newVal) => {
    $scope.$broadcast('tilesChanged', $scope);
  });

  $scope.initialize = () => {
    $scope.generate();
    $scope.createLayout();
    $scope.randomizeLayout();

    $scope.tiles.length = 0;
    for (var i = 0, len = tilesOnStage.length; i < len; i++) {
      for (var j = 0, jlen = tilesOnStage[i].length; j < jlen; j++) {
        for (var k = 0, klen = tilesOnStage[i][j].length; k < klen; k++) {
          if (tilesOnStage[i][j][k])
          $scope.tiles.push(tilesOnStage[i][j][k]);
        }
      }
    }
  };


  $scope.isTileFree = tile => {
    var i0, j0;
    var i = tile.position.x;
    var j = tile.position.y;
    var k = tile.position.z;
    var tiles = tilesOnStage;

    // check upper layer
    if (k < $scope.depth - 1) {
      for (i0 = -1; i0 <= 1; i0++) {
        for (j0 = -1; j0 <= 1; j0++) {
          if (isCoordValid(i + i0, j + j0, k + 1)) {
            if (tiles[i + i0][j + j0][k + 1])
            return false;
          }
        }
      }
    }
    var hasLeft = false;
    var hasRight = false;
    for (j0 = -1; j0 <= 1; j0++) {
      if (isCoordValid(i - 2, j + j0, k)) {
        if (tiles[i - 2][j + j0][k]) {
          hasLeft = true;
        }
      }
      if (isCoordValid(i + 2, j + j0, k)) {
        if (tiles[i + 2][j + j0][k]) {
          hasRight = true;
        }
      }
    }
    // Check left/right
    if (hasLeft && hasRight)
    return false;

    return true;
  };


  // compare two tile values
  $scope.areTilesEqual = (tile1, tile2) => {
    var t1 = tile1.tile;
    var t2 = tile2.tile;
    // ordinary tiles
    if (t1 < 35 && t2 < 35)
    return t1 == t2;
    // seasons
    if (t1 >= 35 && t1 <= 38 && t2 >= 35 && t2 <= 38)
    return true;
    // flowers
    if (t1 >= 39 && t1 <= 42 && t2 >= 39 && t2 <= 42)
    return true;

    return false;
  };
}]);