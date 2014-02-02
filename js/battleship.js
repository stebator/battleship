var battleship = {
    move: 'user',
    init: function(settings) {
        this.config = {
            title: "Морской бой",
            $container: $("#main"),
            $templates: $("#bsTemplates"),
            opponentName: "AI"
        };

        $.extend(this.config, settings);
        this._renderMain();
        this.renderGetUserName();
    },
    renderGetUserName: function() {
        if(this._checkStorage()) {
            username = localStorage.getItem('username');
            if(username) {
                this.run({username: username});
            }
            else {
                this._renderContent(this._getTemplate('.bsGetUserName'));
                $(document).on("submit", "#formGetUserName", this.submitGetUserName);
            }
        }

    },
    renderGame: function() {
        this._renderContent(this._getTemplate('.bsRun'));
        var $c = this.config.$container;
        $c.find('.user .name').text(this.user.username);
        $c.find('.opponent .name').text(this.opponent.username);
    },
    renderUserField: function() {
        var $c = this.config.$container;
        $c.find('.user .field').remove();
        $c.find('.user').append(this.user.renderField(true));

        this.renderUserStats();
    },
    renderOpponentField: function() {
        var $c = this.config.$container;
        $c.find('.opponent .field').remove();
        $c.find('.opponent').append(this.opponent.renderField(false,true));
        this.renderOpponentStats();
    },
    renderUserStats: function() {
        var $c = this.config.$container;
        $c.find('.user .stats').html(this.user.renderStats());
    },
    renderOpponentStats: function() {
        var $c = this.config.$container;
        $c.find('.opponent .stats').html(this.opponent.renderStats());
    },
    run: function(params) {
        this.user = new User(params.username);
        this.opponent = new AI(this.config.opponentName);

        this.renderGame();

        this.user.init(this.renderUserField);

        this.config.$container.on("click", ".opponent .cell", this, this.clickOpponentCell);

        this.opponent.init(this.renderOpponentField);


    },
    win: function() {
        alert('win!');
    },
    gameOver: function() {
        alert('game over!');
    },
    submitGetUserName: function(e) {
        console.log(e);
        e.preventDefault();
        var username = $(this).find('input[name=username]').val();
        if(username.length) {
            localStorage.setItem('username', username);
            battleship.run({username: username});
        }
        else {
            alert("Пожалуйста, введите имя пользователя!");
        }

    },
    clickOpponentCell: function(e) {
        var bs = e.data;
        bs.user.moves++;
        console.log("ход: " + bs.move + " #" + bs.user.moves);
        var x = $(this).data('x');
        var y = $(this).data('y');
        var shoot_result = bs.opponent.shoot(x,y);
        if(shoot_result.result == bs.opponent.configCells.SHIP) {
            $(this).addClass('hit');
            if(shoot_result.ship.status == 2) {
                bs.opponent.shipShadow(shoot_result.ship, bs.opponent.field);
                bs.renderOpponentField();
            }
        }
        else {
            bs._toggleMove();
            $(this).addClass('miss');
        };

        if(bs.opponent.status == 1) {
            bs.win();
        }
    },
    shootUserCell: function() {
        var bs = battleship;
        bs.opponent.moves++;
        console.log("ход: " + bs.move + " #" + bs.opponent.moves);
        console.log("================ < SHOOT > ==================");
        console.log(bs.opponent.strategy);
        bs.opponent.searchUserShips(bs.user.ships, function(shoot) {

            var shoot_result = bs.user.shoot(shoot[0],shoot[1]);
            // разбор результата выстрела
            console.log("shoot: " + shoot);
            console.log("shoot_result: ");
            console.log(shoot_result);


            console.log("FINISH THIS SHIP:");
            console.log(bs.opponent.finishShip);

            // попадание
            if(shoot_result.result == bs.user.configCells.SHIP) {

                bs.opponent.finishShip = shoot_result.ship;


                bs.opponent.enemyField[shoot[0]][shoot[1]] = bs.opponent.configCells.HIT;
                bs.opponent.lastSuccessShoot = shoot;

                bs.config.$container.find('.user .cell-'+shoot[0]+'-'+shoot[1]).addClass('hit');

                // если ранили, пытаемся добить, смена стратегии изменяет алгоритм поиска
                if(shoot_result.ship.status == 1) {
                    bs.opponent.setFinishingStrategy();

                    console.log("ПОДБИТ");
                    console.log(shoot_result);

                    // если это первое попадание, фиксируем значение
                    if(shoot_result.ship.damage_count == 1) {
                        bs.opponent.firstSuccessShoot = shoot;
                    }

                }
                // если добили, переходим к дальнейшиму поиску к
                else if(shoot_result.ship.status == 2) {
                    bs.opponent.shipShadow(shoot_result.ship, bs.opponent.enemyField);
                    bs.user.shipShadow(shoot_result.ship, bs.user.field);
                    bs.opponent.finishShip = {};
                    console.log("УБИТ");
                    bs.renderUserField();
                    bs.opponent.setSearchStrategy();
                    if(bs.user.status == 1) {
                        bs.gameOver();
                    }
                }
                delete shoot_result;
                bs.opponent.current_timeout = setTimeout(bs.shootUserCell, bs.opponent.timeout);

            }
            // промах
            else if(shoot_result.result == bs.user.configCells.MISS) {
                bs.opponent.enemyField[shoot[0]][shoot[1]] = bs.opponent.configCells.MISS;
                bs.config.$container.find('.user .cell-'+shoot[0]+'-'+shoot[1]).addClass('miss');

                // если промахиваемся в процессе добивание, разворачиваем пушку для следующего хода
                if(bs.opponent.strategy == 'finishing' && bs.opponent.finishShip.damage_count > 1) {
                    console.log("ПОВОРОТ");
                    bs.opponent.turnWeapon();
                }
                bs._toggleMove();
            }

        });
        console.log("================ </SHOOT > ==================");

    },
    _toggleMove: function() {
        if(this.move == 'user') {
            this.move = 'opponent';
            this.config.$container.find('.opponent .field').addClass('active');
            this.config.$container.find('.user .field').removeClass('active');
            this.config.$container.off("click", ".opponent .cell");
//            this.shootUserCell();
            this.opponent.current_timeout = setTimeout(this.shootUserCell, this.opponent.timeout);
            console.log("move toggle: " + this.move);
        }
        else {
            this.move = 'user';
            this.config.$container.find('.user .field').addClass('active');
            this.config.$container.find('.opponent .field').removeClass('active');
            this.config.$container.on("click", ".opponent .cell", this, this.clickOpponentCell);
            console.log("move toggle: " + this.move);
        }
    },
    _getTemplate: function(name) {
        return this.config.$templates.find(name).html();
    },
    _renderMain: function() {
        this.config.$container
            .append(this._getTemplate('.bsMain'));
        this._setTitle();
    },
    _setTitle: function(title) {
        var title = title || this.config.title;
        this.config.$container.find("h1").html(title);
    },
    _renderContent: function(html) {
        this.config.$container.find(".content").html(html);
    },
    _checkStorage: function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }
}