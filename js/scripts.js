var square_size;
$(document).ready(
    function() {
        document.oncontextmenu = function() {return false;};

        $('.bateau').dragdrop({
            makeClone: false,
            revertOnDrop: false,
            dragClass: "whileDragging",
            canDrop: function($dst) {
                // @TODO detect if the boat is over the table
                return true;
            },
            didDrop: boatDropped
        });

        $('.bateau').on('mousedown', function(event) {
            if (event.button == 2) {
                rotateBoat($(this));
                return false;
            }
            return true;
        });

        init();

        $('#table').resize(onTableResized);
    }
);

var onTableResized = function() {
    var $table = $('#table');
    var table_size = $table.height();
    square_size = table_size / 11;
    resizeBoats();
    $('.bateau').each(function(index, bateau) {
        placeBoat($(bateau));
    });
};

function init() {
    var $table = $('#table');
    var table_size = $table.height();
    square_size = table_size / 11;

    $('.bateau.s2').data('size', 2);
    $('.bateau.s3').data('size', 3);
    $('.bateau.s4').data('size', 4);
    $('.bateau.s5').data('size', 5);

    resizeBoats();

    $('.bateau').removeClass('hidden');
}

// Resize boats to fit in table
function resizeBoats($boats) {
    if (typeof $boats == 'undefined') {
        $boats = $('.bateau');
    }
    $boats.each(function(index, bateau) {
        var $bateau = $(bateau);
        var size = $bateau.data('size');
        var orientation = $bateau.data('orientation');
        if (orientation == 'horizontal') {
            $bateau.css('width', (size*square_size) + 'px');
            $bateau.css('height', square_size + 'px');
        } else {
            $bateau.css('height', (size*square_size) + 'px');
            $bateau.css('width', square_size + 'px');
        }
    });
}

function rotateBoat($bateau) {
    if ($bateau.data('orientation') == 'vertical') {
        $bateau.data('orientation', 'horizontal');
    } else {
        $bateau.data('orientation', 'vertical');
    }

    if (detectBoatOutOfTable($bateau) || detectBoatsCollisions()) {
        // Undo
        if ($bateau.data('orientation') == 'vertical') {
            $bateau.data('orientation', 'horizontal');
        } else {
            $bateau.data('orientation', 'vertical');
        }
        return;
    }

    $bateau.toggleClass('vertical');
    $bateau.toggleClass('horizontal');

    resizeBoats($bateau);

    console.log($bateau.data());
}

function boatDropped($bateau, $dst) {
    var x = parseInt($bateau.css('left'));
    var y = parseInt($bateau.css('top'));

    // Snap to grid
    var closest_row = -1, closest_col = -1;
    var min_dist_x = 99999, min_dist_y = 99999;
    for (var i=1; i<=10; i++) {
        var dist_x = Math.abs(x - (i * square_size));
        var dist_y = Math.abs(y - (i * square_size));
        if (dist_x < min_dist_x) {
            min_dist_x = dist_x;
            closest_col = i;
        }
        if (dist_y < min_dist_y) {
            min_dist_y = dist_y;
            closest_row = i;
        }
    }

    var previous_pos = {row:  $bateau.data('row'), col: $bateau.data('col')};

    $bateau.data('row', closest_row);
    $bateau.data('col', closest_col);

    // Check end of boat!
    while (detectBoatOutOfTable($bateau)) {
        if ($bateau.data('orientation') == 'horizontal') {
            $bateau.data('col', $bateau.data('col')-1);
        } else {
            $bateau.data('row', $bateau.data('row')-1);
        }
    }

    if (detectBoatsCollisions()) {
        $bateau.data('row', previous_pos.row);
        $bateau.data('col', previous_pos.col);
    }

    placeBoat($bateau);

    console.log($bateau.data());
}

function detectBoatOutOfTable($bateau) {
    var boat_size = $bateau.data('size');
    if ($bateau.data('orientation') == 'horizontal' && $bateau.data('col') + boat_size > 11) {
        return true;
    }
    if ($bateau.data('orientation') == 'vertical' && $bateau.data('row') + boat_size > 11) {
        return true;
    }
    return false;
}

function placeBoat($bateau) {
    $bateau.css({
        left: ($bateau.data('col') * square_size) +'px',
        top: ($bateau.data('row') * square_size) +'px'
    });
    console.log($bateau.data());
}

function detectBoatsCollisions() {
    var cells_used = [];
    var boats = $('.bateau').toArray();
    for (var b=0; b<boats.length; b++) {
        var $bateau = $(boats[b]);
        var size = $bateau.data('size');
        var col = $bateau.data('col');
        var row = $bateau.data('row');
        if (col == 0) {
            continue;
        }
        var orientation = $bateau.data('orientation');
        if (orientation == 'horizontal') {
            for (var i=col; i<col+size; i++) {
                var key = row+','+i;
                if (cells_used.indexOf(key) > -1) {
                    return true;
                }
                cells_used.push(key);
            }
        } else {
            for (var j=row; j<row+size; j++) {
                var key = j + ',' + col;
                if (cells_used.indexOf(key) > -1) {
                    return true;
                }
                cells_used.push(key);
            }
        }
    }
    return false;
}
