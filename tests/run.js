var test_user = new User("test_user");
test_user.init(function(result) {});

test_user.field = [
    [0,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
];

var test_ai = new AI("test_ai");

test_ai.init(function(result) {
});
var ships = [
    {size: 4}
];

test("ai searchUserShips step 1", function() {
    // первый выстрел
    test_ai.searchUserShips(ships, function(shoot) {
        var shoot_result = test_user.shoot(shoot[0],shoot[1]);
        ok(shoot_result.result == 1, "first shoot");
        if(shoot_result.result == 1) {
            test_ai.setFinishingStrategy();
        }
    });
});
test("ai searchUserShips step 2", function() {
    // второй выстрел
    test_ai.searchUserShips(ships, function(shoot) {
        var shoot_result = test_user.shoot(shoot[0],shoot[1]);
        console.log(shoot_result);
    });
});


