var Gamer = {
    configShips: {
        BATTLESHIP: {
            size: 4,
            count: 1
        },
        CRUISER: {
            size: 3,
            count: 2
        },
        DESTROYER: {
            size: 2,
            count: 3
        },
        SUBMARINE: {
            size: 1,
            count: 4
        }
    },
    configCells: {
        EMPTY: 0,
        SHIP:  1,
        HIT:   2,
        MISS:  3
    },
    moves: 0,
    ships: [],
    field: {},
    enemyField: {},
    init: function(callback) {
        var g = this;
        this.ships = [];
        this._clearField(function(arr) {
            g.enemyField = arr;
        });
        this._clearField(function(arr) {
            g.field = arr;
            console.log(g.field);
            for(var ship in g.configShips) {
                g._placeShip(ship, g.configShips[ship], g.configShips[ship].count);
            }
            callback.call(battleship);
        });

    },
    renderField: function(active, hidden) {
        var hidden = hidden || false;
        var $field = $(document.createElement('div'));
        $field.addClass('field');
        console.log(this.field);
        if(active) $field.addClass('active');
        for(var i = 0; i < this.field.length; i++) {
            var $row = $(document.createElement('div'));
            $row.addClass('row');
            for(var j = 0; j < this.field[i].length; j++) {
                var $cell = $(document.createElement('div'));
                $cell.addClass('cell');
                if(this.field[j][i] == this.configCells.SHIP && !hidden) {
                    $cell.addClass('ship');
                }
                if(this.field[j][i] == this.configCells.HIT) {
                    $cell.addClass('hit');
                }
                if(this.field[j][i] == this.configCells.MISS) {
                    $cell.addClass('miss');
                }
                $cell.data('x',j);
                $cell.data('y',i);
                $cell.addClass('cell-'+j+'-'+i);
                $cell.appendTo($row);
            }
            $row.appendTo($field);
        }
        return $field;
    },
    shoot: function(x,y) {

        var out = {};

        if( this.field[x][y] == this.configCells.SHIP)  {
            out.ship = this._updateShips(x,y);
            out.result = this.configCells.SHIP;
            this.field[x][y] = this.configCells.HIT;
            console.log(this.field[x][y]);
        }
        else if( this.field[x][y] == this.configCells.HIT) {
            out.result = this.configCells.HIT;
            this.field[x][y] = this.configCells.HIT;
        }
        else {
            out.result = this.configCells.MISS;
            this.field[x][y] = this.configCells.MISS;

        }
        return out;
    },
    shipShadow: function(ship, field) {
        for(var p = 0; p < ship.position.length; p++) {
            var x = ship.position[p][0];
            var y = ship.position[p][1];

            var x0 = x - 1 >= 0;
            var x9 = x + 1 <= 9;
            var y0 = y - 1 >= 0;
            var y9 = y + 1 <= 9;

            if(ship.orientation == 0) {
                if(p == 0) {
                    if(x0 && y0)    field[x-1]  [y-1] = this.configCells.MISS;
                    if(y0)          field[x]    [y-1] = this.configCells.MISS;
                    if(x0)          field[x-1]  [y] = this.configCells.MISS;
                    if(x0 && y9)    field[x-1]  [y+1] = this.configCells.MISS;
                    if(y9)          field[x]    [y+1] = this.configCells.MISS;
                } else {
                    if(y0)          field[x]    [y-1] = this.configCells.MISS;
                    if(y9)          field[x]    [y+1] = this.configCells.MISS;
                }
                if( p  == ship.size - 1) {
                    if(y0)          field[x]    [y-1] = this.configCells.MISS;
                    if(x9 && y0)    field[x+1]  [y-1] = this.configCells.MISS;
                    if(x9)          field[x+1]  [y] = this.configCells.MISS;
                    if(y9)          field[x]    [y+1] = this.configCells.MISS;
                    if(x9 && y9)    field[x+1]  [y+1] = this.configCells.MISS;
                }
            } else if(ship.orientation == 1) {
                if(p == 0) {
                    if(x0)          field[x-1]  [y] = this.configCells.MISS;
                    if(x0 && y0)    field[x-1]  [y-1] = this.configCells.MISS;
                    if(y0)          field[x]    [y-1] = this.configCells.MISS;
                    if(x9 && y9)    field[x+1]  [y-1] = this.configCells.MISS;
                    if(x9)          field[x+1]  [y] = this.configCells.MISS;
                } else {
                    if(x0)          field[x-1]  [y] = this.configCells.MISS;
                    if(x9)          field[x+1]  [y] = this.configCells.MISS;
                }
                if( p  == ship.size - 1) {
                    if(x0)          field[x-1]  [y] = this.configCells.MISS;
                    if(x0 && y9)    field[x-1]  [y+1] = this.configCells.MISS;
                    if(y9)          field[x]    [y+1] = this.configCells.MISS;
                    if(x9 && y9)    field[x+1]  [y+1] = this.configCells.MISS;
                    if(x9)          field[x+1]  [y] = this.configCells.MISS;
                }
            }
        }
    },
    _clearField: function(callback) {
        var f = [];
        for(var i = 0; i < 10; i++){
            f[i] = [];
            for(var j = 0; j < 10; j++) {
                f[i][j] = this.configCells.EMPTY;
            }
        }
        callback(f);
    },
    _checkCellEnv: function(x,y) {
        var ne,e,se,s,sw,w,nw,n;

        ne=e=se=s=sw=w=nw=n=true;

        if(x > 9 || y > 9) return false;

        if(x==0) w=nw=sw=false;
        if(x==9) e=ne=se=false;
        if(y==0) n=nw=ne=false;
        if(y==9) s=sw=se=false;

        if( this.field[x][y] != 0 ||
            (ne && this.field[x+1][y-1] != this.configCells.EMPTY) ||
            (e  && this.field[x+1][y] != this.configCells.EMPTY) ||
            (se && this.field[x+1][y+1] != this.configCells.EMPTY) ||
            (s  && this.field[x][y+1] != this.configCells.EMPTY) ||
            (sw && this.field[x-1][y+1] != this.configCells.EMPTY) ||
            (w  && this.field[x-1][y] != this.configCells.EMPTY) ||
            (nw && this.field[x-1][y-1] != this.configCells.EMPTY) ||
            (n  && this.field[x][y-1] != this.configCells.EMPTY) ) {

            return false;
        }
        return true;
    },
    _placeShip: function(name, ship,count) {
        // пытаемся разместить корабль на воде

        // ищем варианты размещения
        var variants = [],
            resultH,
            resultV,
            x,y;
        for(var i = 0; i < this.field.length; i++) {
            for(var j = 0; j < this.field[i].length; j++) {
                // то есть у каждого будет "тень" шириной в одну клетку

                resultH = true;
                resultV = true;

                // проверка возможности размещения по горизонтали

                for(var s = 0; s < ship.size; s++) {
                    y = j + s;
                    x = i;
                    // смотрим как с соседними клетками, по правилам корабли не могут соприкасаться друг с другом
                    if(!this._checkCellEnv(x, y)) {
                        resultV = false;
                        break;
                    }
                }

                if(resultV) {
                    variants.push([i,j,1]);
                }

                // проверка возможности размещения по вертикали

                for(var s = 0; s < ship.size; s++) {
                    y = j;
                    x = i + s;
                    // смотрим как с соседними клетками, по правилам корабли не могут соприкасаться друг с другом
                    if(!this._checkCellEnv(x, y)) {
                        resultH = false;
                        break;
                    }
                }
                if(resultH) {
                    variants.push([i,j,0]);
                }
            }
        }
        // добавляем случайный вариант на воду
        var rv = variants[Math.floor(Math.random() * variants.length)];

        var position = [];
        for(var s = 0; s < ship.size; s++) {
            if(rv[2]) {
                position.push([rv[0],rv[1] + s,0]);
                this.field[rv[0]][rv[1] + s] = 1;
            } else {
                position.push([rv[0] + s,rv[1],0]);
                this.field[rv[0] + s][rv[1]] = 1;
            }

        }

        this.ships.push({ name: name, position: position, status: 0, size: ship.size, orientation: rv[2] });

        if(count > 1) {
            this._placeShip(name, ship, count - 1);
        }

    },
    _updateShips: function(x,y) {

        var updated_ship, damage_count;

        for(var i in this.ships) {

            var ship = this.ships[i];

            damage_count = 0;
            // проверяем расположение кораблся
            for(var p in ship.position) {
                var position = ship.position[p];
                // если в него попали текущим выстрелом, то отмечаем
                if(position[0] == x && position[1] == y && position[2] == 0) {
                    updated_ship = ship;
                    ship.status = 1; // ранен
                    position[2] = 1; // вот в этой точке =)
                }
                // считаем число ранений
                if(position[2] == 1) {
                    damage_count = damage_count + 1;
                }
            }

            if(ship.size == damage_count) {
                ship.status = 2; // убит
            }
            if(updated_ship) {
                updated_ship.damage_count = damage_count;
                return updated_ship;
            }


        }
    }
};