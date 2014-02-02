var AI = function(username) {

    this.username = username;
    this.id = 'ai';
    this.lastSuccessShoot = [];
    this.firstSuccessShoot = [];
    this.turn = false;
    this.strategy = "search";
    this.finishShip = {};
    this.timeout = 500;

    this.generateShoots = function(step) {
        var shoots = [];
        var offset = - step - 1;

        for(var i = 0; i < this.enemyField.length; i++) {
            var j = offset;
            while(j + step <= this.enemyField[i].length) {
                j = j + step;
                if(j >= 0 && this.enemyField[i][j] == this.configCells.EMPTY) {
                    shoots.push([i,j]);
                }
            }

            offset--;
        }
        return shoots;
    }

    this.searchUserShips = function(ships, callback) {
        if(this.strategy == "search") {
            // смотрим корабли игрока
            for(var i = 0; i < ships.length; i++) {
                // корабли отсортированы по размеру
                // если большой корабль не найден, пытаемся найти
                if(ships[i].status != 2) {
                    var shoots = this.generateShoots(ships[i].size);

                    callback(shoots.shift());
                    break;
                }
            }
        }
        else if (this.strategy == "finishing") {

            var n, e, w, s;
            n=e=w=s=false;

            var lss = this.lastSuccessShoot;
            // осматриваемся
            console.log("lastSuccessShoot: " + lss);

            if(!this.turn) {
                console.log("БЕЗ ПОВОРОТА");
                // на север
                if( (lss[1] - 1) >= 0 ) if ( this.enemyField[lss[0]][lss[1] - 1] == this.configCells.HIT ) s = true;
                // на юг
                if( (lss[1] + 1) <= 9 ) if ( this.enemyField[lss[0]][lss[1] + 1] == this.configCells.HIT ) n = true;
                // на запад
                if( (lss[0] - 1) >= 0 ) if ( this.enemyField[lss[0] - 1][lss[1]] == this.configCells.HIT ) e = true;
                // на восток
                if( (lss[0] + 1) <= 9 ) if ( this.enemyField[lss[0] + 1][lss[1]] == this.configCells.HIT ) w = true;

                console.log("n: " + n + "\ns: " + s + "\nw: " + w + "\ne: " + e );
            }
            // разворачиваемся
            else if(this.turn) {
                console.log("С ПОВОРОТОМ");
                this.turn = false;
                var fss = this.firstSuccessShoot;
                console.log("firstSuccessShoot: " + fss);
                if( fss[1] - 1 >= 0 ) if(this.enemyField[fss[0]][fss[1] - 1] == this.configCells.HIT) callback([fss[0], fss[1] + 1]);
                if( fss[1] + 1 <= 9 ) if(this.enemyField[fss[0]][fss[1] + 1] == this.configCells.HIT) callback([fss[0], fss[1] - 1]);
                if( fss[0] - 1 >= 0 ) if(this.enemyField[fss[0] - 1][fss[1]] == this.configCells.HIT) callback([fss[0] + 1, fss[1]]);
                if( fss[0] + 1 <= 9 ) if(this.enemyField[fss[0] + 1][fss[1]] == this.configCells.HIT) callback([fss[0] - 1, fss[1]]);

                console.log("n: " + n + "\ns: " + s + "\nw: " + w + "\ne: " + e );

            }


            // если неизвество как расположен корабль
            if(!n && !s && !w && !e) {
                console.log("random fire");
                var orientation = [];
                if(lss[1] - 1 >= 0) if(this.enemyField[lss[0]][lss[1] - 1] != this.configCells.MISS) orientation.push('n');
                if(lss[1] + 1 <= 9) if(this.enemyField[lss[0]][lss[1] + 1] != this.configCells.MISS) orientation.push('s');
                if(lss[0] - 1 >= 0) if(this.enemyField[lss[0] - 1][lss[1]] != this.configCells.MISS) orientation.push('w');
                if(lss[0] + 1 <= 9) if(this.enemyField[lss[0] + 1][lss[1]] != this.configCells.MISS) orientation.push('e');
                // бьём наотмашь
                switch(orientation[Math.floor(Math.random()*orientation.length)]) {
                    case 'n':
                        callback([lss[0], lss[1] - 1]);
                        break;
                    case 's':
                        callback([lss[0], lss[1] + 1]);
                        break;
                    case 'w':
                        callback([lss[0] - 1, lss[1]]);
                        break;
                    case 'e':
                        callback([lss[0] + 1, lss[1]]);
                        break;
                }
            }
            else {
                if(w) callback([lss[0] - 1, lss[1]]);
                if(e) callback([lss[0] + 1, lss[1]]);
                if(n) callback([lss[0], lss[1] - 1]);
                if(s) callback([lss[0], lss[1] + 1]);
            }
        }

    },
    this.setFinishingStrategy = function() {
        this.strategy = 'finishing';
    },
    this.setSearchStrategy = function() {
        this.strategy = 'search';
    }
    this.turnWeapon = function() {
        this.turn = true;
    }
}

AI.prototype = Gamer;