
// A world where creatures move around. 
// "#" represents a wall or rock
// "o" represents a creatures

// GLOBAL VARIABLES
var directions = {
    "n": new Vector(0, -1),
    "ne": new Vector(1, -1),
    "e": new Vector(1, 0),
    "se": new Vector(1, 1),
    "s": new Vector(0, 1),
    "sw": new Vector(-1, 1),
    "w": new Vector(-1, 0),
    "nw": new Vector(-1, -1),
}

var directionNames = "n ne e se s sw w nw".split(" ");

// HELPER FUNCTIONS
// Returns a random element from the passed array
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
// creates an object element for the world from the grid representation
function elementFromChar(legend, ch) {
    if (ch == " ")
        return null;
    // make an element (Wall or bouncingCritter object) from the passed legend
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}
// creates a grid representation of an object from the world
function charFromElement(element) {
    if (element == null)
        return " ";
    else
        return element.originChar;
}
function vectorFromNumber(grid, number) {
    var x = number % grid.width;
    var y = Math.floor(number / grid.width);
    return new Vector(x, y)
}

// VECTOR OBJECT (a location in the world/grid)
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

// GRID OBJECT (representation of the World)
function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}
Grid.prototype.isInside = function(vector) {
    return vector.x >= 0 && vector.x < this.width &&
           vector.y >= 0 && vector.y < this.height;
};
Grid.prototype.get = function(vector) {
    return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function(vector, value) {
    return this.space[vector.x + this.width * vector.y] = value;
}

// BOUNCING_CRITTER OBJECT
function bouncingCritter() {
    this.direction = randomElement(directionNames);
};
bouncingCritter.prototype.act = function(view) {
    if (view.look(this.direction) != " ")
        this.direction = view.find(" ") || "s";  // "s" prevents null if trapped
    return {type: "move", direction: this.direction};
}

// WALL OBJECT
function Wall(argument) {}

// WORLD OBJECT
// map is array of world elements in grid
// legend is a legend of symbols in grid
function World(map, legend) {
    var grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach(function (line, y) {
        for (var x = 0; x < line.length; x++)
            grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
    });
}
World.prototype.toString = function() {
    var output = "";
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var element = this.grid.get(new Vector(x, y));
            output += charFromElement(element);
        }
        output += "\n";
    }
    return output;
};
World.prototype.turn = function() {
    var acted = [];
    this.grid.space.forEach(function (critter, vector) {
        if (critter != null && critter.act && acted.indexOf(critter) == -1) {
            acted.push(critter);
            var newVector = vectorFromNumber(this.grid, vector);
            this.letAct(critter, newVector);
        }
    }, this);
};
World.prototype.letAct = function(critter, Vector) {
    var action = critter.act(new View(this, Vector));
    if (action && action.type == "move") {
        var dest = this.checkDestination(action, Vector);
        if (dest && this.grid.get(dest) == null) {
            this.grid.set(Vector, null);
            this.grid.set(dest, critter);
        }
    }
};
World.prototype.checkDestination = function(action, Vector) {
    if (directions.hasOwnProperty(action.direction)) {
        var dest = Vector.plus(directions[action.direction]);
        return dest;
    }
};

// VIEW OBJECT
function View(world, vector) {
    this.world = world;
    this.vector = vector;
}
//figured out coordinates critter tries to look at. If outside, pretend wall. 
View.prototype.look = function(dir) {
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target))
        return charFromElement(this.world.grid.get(target));
    else
        return "#";
};
View.prototype.findAll = function(ch) {
    var found = [];
    for (var dir in directions)
        if (this.look(dir) == ch)
            found.push(dir);
    return found;
};
View.prototype.find = function(ch) {
    var found = this.findAll(ch);
    if (found.length == 0) return null;
    return randomElement(found);
};

// Make world
var plan = [
    "############################",
    "#      #    #      o      ##",
    "#                          #",
    "#          ####            #",
    "##         #  #     #      #",
    "###          ##     #      #",
    "#          ###      #      #",
    "#  ####                    #",
    "#  ##       o              #",
    "# o #         o        ### #",
    "#   #                      #",
    "############################"
]
var world = new World(plan, {"#": Wall, "o": bouncingCritter});
console.log(world.toString());
// Make World move
for (var i = 0; i < 5; i++) {
    world.turn();
    console.log(world.toString());
}




