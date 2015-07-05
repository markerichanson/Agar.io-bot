// ==UserScript==
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/
// @version     3.31_meh4
// @grant       none
// @author      http://www.twitch.tv/apostolique
// @require		https://github.com/maxkueng/victor/raw/master/build/victor.js
// ==/UserScript==


Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

Array.prototype.peek = function() {
    return this[this.length - 1];
};

$.get('https://raw.githubusercontent.com/Apostolique/Agar.io-bot/master/bot.user.js?1', function(data) {
    var latestVersion = data.replace(/(\r\n|\n|\r)/gm,"");
    latestVersion = latestVersion.substring(latestVersion.indexOf("// @version")+11,latestVersion.indexOf("// @grant"));

    latestVersion = parseFloat(latestVersion + 0.0000);
    var myVersion = parseFloat(GM_info.script.version + 0.0000);

	if(latestVersion > myVersion)
	{
		alert("Update Available for bot.user.js: V" + latestVersion + "\nGet the latest version from the GitHub page.");
        window.open('https://github.com/Apostolique/Agar.io-bot/blob/master/bot.user.js','_blank');
	}
	console.log('Current bot.user.js Version: ' + myVersion + " on Github: " + latestVersion);
});

 Record = function (maxLength) {
 	this.maxLength = maxLength;
 	this.records = [];

 	this.push = function (item) {
 		this.records.push(item);
 		if (this.records.length > maxLength) this.records.shift();
 	}
 }

console.log("Running MEH Apos Bot!");
(function(f, g) {
    var splitDistance = 710;
    console.log("Apos Bot!");
    var MAX_HISTORY = 100;
	var lastOthers = {};
    var positionRecord = new Record(MAX_HISTORY);
    var targetRecord = new Record(MAX_HISTORY);
    var updateRecord = new Record(MAX_HISTORY);
	var foodTargetRecord = new Record(MAX_HISTORY);
	var worstThreatRecord = new Record(MAX_HISTORY);

    if (f.botList == null) {
        f.botList = [];
        g('#locationUnknown').append(g('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
        g('#locationUnknown').addClass('form-group');
    }

    f.botList.push(["MEHAposBot", findDestination]);

    var bList = g('#bList');
    g('<option />', {value: (f.botList.length - 1), text: "MEHAposBot"}).appendTo(bList);

    //Given an angle value that was gotten from valueAndleBased(),
    //returns a new value that scales it appropriately.
    function paraAngleValue(angleValue, range) {
        return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
    }

    function valueAngleBased(angle, range) {
        var leftValue = (angle - range[0]).mod(360);
        var rightValue = (rangeToAngle(range) - angle).mod(360);

        var bestValue = Math.min(leftValue, rightValue);

        if (bestValue <= range[1]) {
            return paraAngleValue(bestValue, range);
        }
        var banana = -1;
        return banana;

    }

    function computeDistance(x1, y1, x2, y2) {
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis);

        return distance;
    }

    function computerDistanceFromCircleEdge(x1, y1, x2, y2, s2) {
        var tempD = computeDistance(x2, y2, x1, y1);

        var offsetX = 0;
        var offsetY = 0;

        var ratioX = tempD / (x2 - x1);
        var ratioY = tempD / (y2 - y1);

        offsetX = x2 - (s2 / ratioX);
        offsetY = y2 - (s2 / ratioY);

        return computeDistance(x1, y1, offsetX, offsetY);
    }

    function getListBasedOnFunction(booleanFunction, listToUse) {
        var dotList = [];
        var interNodes = getMemoryCells();
        Object.keys(listToUse).forEach(function(element, index) {
            if (booleanFunction(element)) {
                dotList.push(interNodes[element]);
            }
        });

        return dotList;
    }


    function compareSize(player1, player2, ratio) {
        if (player1.size * player1.size * ratio < player2.size * player2.size) {
            return true;
        }
        return false;
    }

    function canSplit(player1, player2) {
        // (p1*p1*2.3<p2*p2<p1*p1*9)
        return compareSize(player1, player2, 2.30) ;//&& !compareSize(player1, player2, 9);
    }

    function processEverything(listToUse) {
        Object.keys(listToUse).forEach(function(element, index) {
            computeAngleRanges(listToUse[element], getPlayer()[0]);
        });
    }

    function getAll() {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            if (!isMe) {
                return true;
            }
            return false;
        }, interNodes);

        return dotList;
    }

    function getAllOthers(blob) {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            if (!isMe && (!interNodes[element].d )) {
                return true;
            }
            return false;
        }, interNodes);

        return dotList;
    }

    function getAllViruses(blob) {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            if (!isMe && interNodes[element].d && compareSize(interNodes[element], blob, 1.30)) {
                return true;
            }
            return false;
        }, interNodes);

        return dotList;
    }

    function getAllThreats(blob) {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            if (!isMe && (!interNodes[element].d && compareSize(blob, interNodes[element], 1.30))) {
                return true;
            }
            return false;
        }, interNodes);

        return dotList;
    }

    function getAllFood(blob) {
        var elementList = [];
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        elementList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            if (!isMe && !interNodes[element].d && compareSize(interNodes[element], blob, 1.30) || (interNodes[element].size <= 11)) {
                return true;
            } else {
                return false;
            }
        }, interNodes);

        for (var i = 0; i < elementList.length; i++) {
            dotList.push([elementList[i].x, elementList[i].y, elementList[i].size]);
        }

        return dotList;
    }

    function clusterFood(foodList, player) {
        var clusters = [];
        var addedCluster = false;

        //0: x
        //1: y
        //2: size or value
        //3: Angle, not set here.
        //4: food list indices of items clustered.

        for (var i = 0; i < foodList.length; i++) {
            for (var j = 0; j < clusters.length; j++) {
                if (computeDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < player.size * 1.5) {
                    totalSize = clusters[j][2] + foodList[i][2];
                    clusters[j][0] = (foodList[i][2]*foodList[i][0] + clusters[j][2]*clusters[j][0]) / totalSize;
                    clusters[j][1] = (foodList[i][2]*foodList[i][1] + clusters[j][2]*clusters[j][1]) / totalSize;
                    clusters[j][2] = totalSize;
                    clusters[j][3] = 0;
                    clusters[j][4].push(i);
                    addedCluster = true;
                    break;
                }
            }
            if (!addedCluster) {
                clusters.push([foodList[i][0], foodList[i][1], foodList[i][2], 0, [i]]);
            }
            addedCluster = false;
        }

		for (var i = 0; i < clusters.length; i++) {
			//This is the cost function. Higher is better.
			var clusterAngle = getAngle(clusters[i][0], clusters[i][1], player.x, player.y);
			clusters[i][3] = clusterAngle;
			// results are extremely sensitive to the utility function (duh!).
			// the logic of this one is
			// 0.  bigger clusters (in mass and members) are better, but the incremental betterness falls
			//     as the gross product of mass and membership grows (hence "log").
			// 1.  farther is worse, and it gets worse exponentially as distance grows.
			// Changing the base in either part might have interesting results.
			clusters[i][2] = Math.log(clusters[i][2]*clusters[i][4].length)/(1.1^computeDistance(clusters[i][0], clusters[i][1], player.x, player.y));
		}

        return clusters;
    }

    function getAngle(x1, y1, x2, y2) {
        //Handle vertical and horizontal lines.

        if (x1 == x2) {
            if (y1 < y2) {
                return 271;
                //return 89;
            } else {
                return 89;
            }
        }

        return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2)) / Math.PI * 180 + 180));
    }

    function slope(x1, y1, x2, y2) {
        var m = (y1 - y2) / (x1 - x2);

        return m;
    }

    function slopeFromAngle(degree) {
        if (degree == 270) {
            degree = 271;
        } else if (degree == 90) {
            degree = 91;
        }
        return Math.tan((degree - 180) / 180 * Math.PI);
    }

    //Given two points on a line, finds the slope of a perpendicular line crossing it.
    function inverseSlope(x1, y1, x2, y2) {
        var m = slope(x1, y1, x2, y2);
        return (-1) / m;
    }

    //Given a slope and an offset, returns two points on that line.
    function pointsOnLine(slope, useX, useY, distance) {
        var b = useY - slope * useX;
        var r = Math.sqrt(1 + slope * slope);

        var newX1 = (useX + (distance / r));
        var newY1 = (useY + ((distance * slope) / r));
        var newX2 = (useX + ((-distance) / r));
        var newY2 = (useY + (((-distance) * slope) / r));

        return [
            [newX1, newY1],
            [newX2, newY2]
        ];
    }

    function followAngle(angle, useX, useY, distance) {
        var slope = slopeFromAngle(angle);
        var coords = pointsOnLine(slope, useX, useY, distance);

        var side = (angle - 90).mod(360);
        if (side < 180) {
            return coords[1];
        } else {
            return coords[0];
        }
    }

    //Using a line formed from point a to b, tells if point c is on S side of that line.
    function isSideLine(a, b, c) {
        if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
            return true;
        }
        return false;
    }

    //angle range2 is within angle range2
    //an Angle is a point and a distance between an other point [5, 40]
    function angleRangeIsWithin(range1, range2) {
        if (range2[0] == (range2[0] + range2[1]).mod(360)) {
            return true;
        }
        //console.log("r1: " + range1[0] + ", " + range1[1] + " ... r2: " + range2[0] + ", " + range2[1]);

        var distanceFrom0 = (range1[0] - range2[0]).mod(360);
        var distanceFrom1 = (range1[1] - range2[0]).mod(360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 < distanceFrom1) {
            return true;
        }
        return false;
    }

    function angleRangeIsWithinInverted(range1, range2) {
        var distanceFrom0 = (range1[0] - range2[0]).mod(360);
        var distanceFrom1 = (range1[1] - range2[0]).mod(360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 > distanceFrom1) {
            return true;
        }
        return false;
    }

    function angleIsWithin(angle, range) {
        var diff = (rangeToAngle(range) - angle).mod(360);
        if (diff >= 0 && diff <= range[1]) {
            return true;
        }
        return false;
    }

    function rangeToAngle(range) {
        return (range[0] + range[1]).mod(360);
    }

    function anglePair(range) {
        return (range[0] + ", " + rangeToAngle(range) + " range: " + range[1]);
    }

    function computeAngleRanges(blob1, blob2) {
        var mainAngle = getAngle(blob1.x, blob1.y, blob2.x, blob2.y);
        var leftAngle = (mainAngle - 90).mod(360);
        var rightAngle = (mainAngle + 90).mod(360);

        var blob1Left = followAngle(leftAngle, blob1.x, blob1.y, blob1.size);
        var blob1Right = followAngle(rightAngle, blob1.x, blob1.y, blob1.size);

        var blob2Left = followAngle(rightAngle, blob2.x, blob2.y, blob2.size);
        var blob2Right = followAngle(leftAngle, blob2.x, blob2.y, blob2.size);

        var blob1AngleLeft = getAngle(blob2.x, blob2.y, blob1Left[0], blob1Left[1]);
        var blob1AngleRight = getAngle(blob2.x, blob2.y, blob1Right[0], blob1Right[1]);

        var blob2AngleLeft = getAngle(blob1.x, blob1.y, blob2Left[0], blob2Left[1]);
        var blob2AngleRight = getAngle(blob1.x, blob1.y, blob2Right[0], blob2Right[1]);

        var blob1Range = (blob1AngleRight - blob1AngleLeft).mod(360);
        var blob2Range = (blob2AngleRight - blob2AngleLeft).mod(360);

        var tempLine = followAngle(blob2AngleLeft, blob2Left[0], blob2Left[1], 400);
        //drawLine(blob2Left[0], blob2Left[1], tempLine[0], tempLine[1], 0);

        if ((blob1Range / blob2Range) > 1) {
            drawPoint(blob1Left[0], blob1Left[1], 3, "");
            drawPoint(blob1Right[0], blob1Right[1], 3, "");
            drawPoint(blob1.x, blob1.y, 3, "" + blob1Range + ", " + blob2Range + " R: " + (Math.round((blob1Range / blob2Range) * 1000) / 1000));
        }

        //drawPoint(blob2.x, blob2.y, 3, "" + blob1Range);
    }

    function debugAngle(angle, text) {
        var player = getPlayer();
        var line1 = followAngle(angle, player[0].x, player[0].y, 300);
        drawLine(player[0].x, player[0].y, line1[0], line1[1], 5);
        drawPoint(line1[0], line1[1], 5, "" + text);
    }

    function getEdgeLinesFromPoint(blob1, blob2) {
        // find tangents
        //
        // TODO: DON'T FORGET TO HANDLE IF BLOB1'S CENTER POINT IS INSIDE BLOB2!!!
        var px = blob1.x;
        var py = blob1.y;

        var cx = blob2.x;
        var cy = blob2.y;

        var radius = blob2.size;

        if (blob2.d) {
            radius = blob1.size;
        } else if(canSplit(blob1, blob2)) {
            radius += splitDistance;
        } else {
            radius += blob1.size * 2;
        }

        var shouldInvert = false;

        if (computeDistance(px, py, cx, cy) <= radius) {
            radius = computeDistance(px, py, cx, cy) - 5;
            shouldInvert = true;
        }

        var dx = cx - px;
        var dy = cy - py;
        var dd = Math.sqrt(dx * dx + dy * dy);
        var a = Math.asin(radius / dd);
        var b = Math.atan2(dy, dx);

        var t = b - a;
        var ta = {
            x: radius * Math.sin(t),
            y: radius * -Math.cos(t)
        };

        t = b + a;
        var tb = {
            x: radius * -Math.sin(t),
            y: radius * Math.cos(t)
        };

        var angleLeft = getAngle(cx + ta.x, cy + ta.y, px, py);
        var angleRight = getAngle(cx + tb.x, cy + tb.y, px, py);
        var angleDistance = (angleRight - angleLeft).mod(360);

        if (shouldInvert) {
            var temp = angleLeft;
            angleLeft = (angleRight + 180).mod(360);
            angleRight = (temp + 180).mod(360);
            angleDistance = (angleRight - angleLeft).mod(360);
        }

        return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
            [cx + ta.x, cy + ta.y]
        ];
    }

/* not used and appears to rely on some iffy variable scoping
    function invertAngle(range) {
        var angle1 = rangeToAngle(badAngles[i]);
        var angle2 = (badAngles[i][0] - angle1).mod(360);
        return [angle1, angle2];
    }
*/
    function addWall(listToUse, blob) {
        if (blob.x < f.getMapStartX() + 1000) {
            //LEFT
            //console.log("Left");

            listToUse.unshift([[135, true], [225, false]]);

            var lineLeft = followAngle(135, blob.x, blob.y, 190 + blob.size);
            var lineRight = followAngle(225, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.y < f.getMapStartY() + 1000) {
            //TOP
            //console.log("TOP");

            listToUse.unshift([[225, true], [315, false]]);

            var lineLeft = followAngle(225, blob.x, blob.y, 190 + blob.size);
            var lineRight = followAngle(315, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.x > f.getMapEndX() - 1000) {
            //RIGHT
            //console.log("RIGHT");

            listToUse.unshift([[315, true], [45, false]]);

            var lineLeft = followAngle(315, blob.x, blob.y, 190 + blob.size);
            var lineRight = followAngle(45, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }
        if (blob.y > f.getMapEndY() - 1000) {
            //BOTTOM
            //console.log("BOTTOM");

            listToUse.unshift([[45, true], [135, false]]);

            var lineLeft = followAngle(45, blob.x, blob.y, 190 + blob.size);
            var lineRight = followAngle(135, blob.x, blob.y, 190 + blob.size);
            drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
            drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
        }

        return listToUse;
    }

    //listToUse contains angles in the form of [angle, boolean].
    //boolean is true when the range is starting. False when it's ending.
    //range = [[angle1, true], [angle2, false]]

    function getAngleIndex(listToUse, angle) {
        if (listToUse.length == 0) {
            return 0;
        }

        for (var i = 0; i < listToUse.length; i++) {
            if (angle <= listToUse[i][0]) {
                return i;
            }
        }

        return listToUse.length;
    }

    function addAngle(listToUse, range) {
        //#1 Find first open element
        //#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
        //#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

        //TODO: Only add the new range at the end after the right stuff has been removed.

        var startIndex = 1;

        if (listToUse.length > 0 && !listToUse[0][1]) {
            startIndex = 0;
        }

        var startMark = getAngleIndex(listToUse, range[0][0]);
        var startBool = startMark.mod(2) != startIndex;

        var endMark = getAngleIndex(listToUse, range[1][0]);
        var endBool = endMark.mod(2) != startIndex;

        var removeList = [];

        if (startMark != endMark) {
            //Note: If there is still an error, this would be it.
            var biggerList = 0;
            if (endMark == listToUse.length) {
                biggerList = 1;
            }

            for (var i = startMark; i < startMark + (endMark - startMark).mod(listToUse.length + biggerList); i++) {
                removeList.push((i).mod(listToUse.length));
            }
        } else if (startMark < listToUse.length && endMark < listToUse.length) {
            var startDist = (listToUse[startMark][0] - range[0][0]).mod(360);
            var endDist = (listToUse[endMark][0] - range[1][0]).mod(360);

            if (startDist < endDist) {
                for (var i = 0; i < listToUse.length; i++) {
                    removeList.push(i);
                }
            }
        }

        removeList.sort(function(a, b){return b-a});

        for (var i = 0; i < removeList.length; i++) {
            listToUse.splice(removeList[i], 1);
        }

        if (startBool) {
            listToUse.splice(getAngleIndex(listToUse, range[0][0]), 0, range[0]);
        }
        if (endBool) {
            listToUse.splice(getAngleIndex(listToUse, range[1][0]), 0, range[1]);
        }

        return listToUse;
    }

    function getAngleRange(blob1, blob2, index) {
        var angleStuff = getEdgeLinesFromPoint(blob1, blob2);

        var leftAngle = angleStuff[0];
        var rightAngle = rangeToAngle(angleStuff);
        var difference = angleStuff[1];

        drawPoint(angleStuff[2][0], angleStuff[2][1], 3, "");
        drawPoint(angleStuff[3][0], angleStuff[3][1], 3, "");

        //console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

        var lineLeft = followAngle(leftAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);
        var lineRight = followAngle(rightAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);

        if (blob2.d) {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 6);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 6);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 6);
        } else if(getCells().hasOwnProperty(blob2.id)) {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 0);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 0);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 0);
        } else {
            drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 3);
            drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 3);
            drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 3);
        }

        return [leftAngle, difference];
    }

    //Given a list of conditions, shift the angle to the closest available spot respecting the range given.
    function shiftAngle(listToUse, angle, range) {
        //TODO: shiftAngle needs to respect the range!
        for (var i = 0; i < listToUse.length; i++) {
            if (angleIsWithin(angle, listToUse[i])) {
                //console.log("Shifting needed!");

                var angle1 = listToUse[i][0];
                var angle2 = rangeToAngle(listToUse[i]);

                var dist1 = (angle - angle1).mod(360);
                var dist2 = (angle2 - angle).mod(360);

                if (dist1 < dist2) {
                    return angle1;
                } else {
                    return angle2;
                }
            }
        }
        //console.log("No Shifting Was needed!");
        return angle;
    }

	function lineSegmentIntersectsCircle (
		x0, y0,
		x1, y1,
		cx, cy, radius
	  ) { // http://doswa.com/2009/07/13/circle-segment-intersectioncollision.html
		// Normalize to use x0,y0 as the origin
		var x0V = new Victor (x0, y0);
		var x1V = new Victor (x1, y1);
		var cV = new Victor (cx, cy);
		x1V = x1V.subtract(x0V);
		cV = cV.subtract(x0V)
		var x1UnitV = new Victor (x1, y1).normalize();
		// Project center vector onto x1 vector
		projectionLength = cV.dot(x1UnitV);

		var closest = null;
		if (projectionLength < 0) {
			closest = new Victor (0, 0); // means player is in the circle... probably need to ignore this case
		}
		else if (projectionLength > x1V.length()) {
			closest = new Victor (x1, y1);;
		} else {
			closest = new Victor (x1UnitV.x*projectionLength,x1UnitV.y*projectionLength);
		}
		return (closest.add(x0V));
	}


	function Threat (i, distance, splitThreat, threatRange) {
		this.i = i;
		this.distance = distance;
		this.splitThreat = splitThreat;
		this.threatRange = threatRange;
	}

    function findDestination(debugDump) {
        var player = getPlayer();
        var interNodes = getMemoryCells();

        var useMouseX = (getMouseX() - getWidth() / 2 + getX() * getRatio()) / getRatio();
        var useMouseY = (getMouseY() - getHeight() / 2 + getY() * getRatio()) / getRatio();
	    tempPoint = [useMouseX, useMouseY, 1];

        var tempMoveX = getPointX();
        var tempMoveY = getPointY();

        if ( debugDump ) {
			var toDumpList = {};
			toDumpList["update"] = getUpdate();
			toDumpList["updateRecord"] = updateRecord;
			toDumpList["positionRecord"] = positionRecord;
			toDumpList["targetRecord"] = targetRecord;
			toDumpList["foodTargetRecord"] =  foodTargetRecord;
			toDumpList["player"] =  player;
			toDumpList["lastOthers"] =  lastOthers;
			toDumpList["worstThreat"] =  worstThreatRecord;
			if (player.length > 0) {
				toDumpList["others"] =  getAllOthers (player[0]);
				toDumpList["food"] =  getAllFood(player[0]);
				toDumpList["viruses"] =  getAllViruses(player[0]);
				toDumpList["threats"] =  getAllThreats(player[0]);
			}
			var seen = [];
			console.log(JSON.stringify(toDumpList, function(key, val) {
				  if (val != null && typeof val == "object") {
					  if (seen.indexOf(val) >= 0) {
						  return;
					  }
					  seen.push(val);
				  }
				  return val;
			  }));
		}
		else {

            if (player.length > 0) {

				var allOthers = getAllOthers (player[0]);

/*
Pseudo-code for destination determination:
1. compute all the bad angles etc as before.
2. rank the enemies based on a few factors.
	a. time to collision (distance/(observed speed) OR dist to predict intersection of our current velocities)
		lower is higher priority
	b. much bigger than me
		much bigger (TBD "much") less likely to be interested.
	maybe just 2a...
3. if no good angles exist, disregard from least important to most until a good angle shows up.
4. hunt for food within that good angle

FFS:
1. generalizing for multiple instances (when split)
2. discounting food that is running away successfully.
*/
                for (var k = 0; k < player.length; k++) {
                    drawCircle(player[k].x, player[k].y, player[k].size + splitDistance, 5);

                    var allPossibleFood = getAllFood(player[k]);
                    var allPossibleThreats = getAllThreats(player[k]);
                    var allPossibleViruses = getAllViruses(player[k]);

                    var badAngles = [];
                    var stupidList = [];
					var realThreats = [];
                    var obstacleList = [];

					// draw obstacle circles and build obstacle list
                    for (var i = 0; i < allPossibleViruses.length; i++) {
                        var tempOb = getAngleRange(player[k], allPossibleViruses[i], i);
                        var angle1 = tempOb[0];
                        var angle2 = rangeToAngle(tempOb);
                        drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].size, 6);
                        obstacleList.push([[angle1, true], [angle2, false]]);
                    }

					// draw threat circles
                    for (var i = 0; i < allPossibleThreats.length; i++) {
						var splitThreat = canSplit(player[k], allPossibleThreats[i]);
						var threatRange = splitThreat ? allPossibleThreats[i].size + splitDistance : allPossibleThreats[i].size + 2*player[k].size;
						var drawColor   = splitThreat ? 0 : 3;
						drawCircle (allPossibleThreats[i].x, allPossibleThreats[i].y, threatRange, drawColor);
                    }

					// rank threats
                    for (var i = 0; i < allPossibleThreats.length; i++) {
						/*
						Is this guy a threat? Yes, iff:
						- we are inside his threatRange
						- we are moving toward each other as of last turn, i.e., velocities will lead to collision some day.

						*/
						var splitThreat = canSplit(player[k], allPossibleThreats[i])
						// not entirely clear why this is different for split threats here vs for circle drawing... maybe double check earlier source...
						// note extra "player[k].size" term for split threats here...
						var threatRange = player[k].size + (splitThreat ? allPossibleThreats[i].size + splitDistance : allPossibleThreats[i].size + player[k].size);

                    	var enemyDistance = computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y);

                    	if (enemyDistance < threatRange) {
                            //badAngles.push(getAngleRange(player[k], allPossibleThreats[i], i));
                            realThreats.push(new Threat(i, enemyDistance, splitThreat, threatRange));
						}
                    }
					// here's the crux of it... sort realThreats so least threatening are at the end.
					realThreats.sort(function(a, b){return (a.distance - a.threatRange)-(b.distance-b.threatRange)})
                    //NOTE: This is only bandaid wall code. It's not the best way to do it.
                    if (realThreats.length>0) {
						stupidList = addWall(stupidList, player[k]);
						// record the worst threat for debug (if there are any real threats).
						worstThreatRecord.push([getUpdate(), realThreats[0]]);
					}
					// ... build bad angle list based on real threats
					for (var i = 0; i < realThreats.length; i++) {
						badAngles.push(getAngleRange(player[k], allPossibleThreats[realThreats[i].i], i));
                        var angle1 = badAngles[i][0];
                        var angle2 = rangeToAngle(badAngles[i]);
                        stupidList.push([[angle1, true], [angle2, false]]);
					}

					// find perfect angle... if there is none, remove the stupid angle associated with the least threat and repeat until we find one.
					// ... see if any good angles exist
                    var goodAngles = [];
                    var sortedInterList = [];
                    // Note we don't touch the realThreats list b/c the full list may yet come in handy for something below.
                    // Alternatively, add ", realThreats.pop()" to the increment clause of the for loop.
					for (;goodAngles.length == 0 && stupidList.length > 0; stupidList.pop()) {
	                    for (var i = 0; i < stupidList.length; i++) {
	                        sortedInterList = addAngle(sortedInterList, stupidList[i]);

	                        if (sortedInterList.length == 0) {
	                            break;
	                        }
	                    }
	                    var offsetI = 0;
	                    if (sortedInterList.length > 0 && sortedInterList[0][1]) {
	                        offsetI = 1;
	                    }
	                    for (var i = 0; i < sortedInterList.length; i += 2) {
	                        var angle1 = sortedInterList[(i + offsetI).mod(sortedInterList.length)][0];
	                        var angle2 = sortedInterList[(i + 1 + offsetI).mod(sortedInterList.length)][0];
	                        var diff = (angle2 - angle1).mod(360);
	                        goodAngles.push([angle1, diff]);
	                    }
					}
					// no good angles after all that means there are no bad angles either (by construction) so any angle is good.
					// If there are any threats at all, the
					if (goodAngles.length == 0) {
						goodAngles.push([0,359]);
						if (realThreats.length>0) console.log ("BAD ASSUMPTION SOMEWHERE... threats exist but no good angle was found!!");
					}
					else {
						// draw good angles
						for (var i = 0; i < goodAngles.length; i++) {
							var line1 = followAngle(goodAngles[i][0], player[k].x, player[k].y, 100 + player[k].size);
							var line2 = followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), player[k].x, player[k].y, 100 + player[k].size);
							drawLine(player[k].x, player[k].y, line1[0], line1[1], 1);
							drawLine(player[k].x, player[k].y, line2[0], line2[1], 1);

							drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 1);

							drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
							drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
						}
					}
					// would it be better to delete individual food items, then cluster rather than clustering firsT?
                    var clusterAllFood = clusterFood(allPossibleFood, player[k]);

					// purge food too close to  threats or with intervening threats
					// we look here at all threats b/c we don't want to route across a threat even if we are
					// currently outside its threat range.  Using realThreats would consider only those that
					// are within their threat range.
					//
					// watching the bot play, it appears this misses some cases but not all
					//
                    for (var i = 0; i < allPossibleThreats.length; i++) {
						var splitThreat = canSplit(player[k], allPossibleThreats[i])
						var threatRange = player[k].size + (splitThreat ? allPossibleThreats[i].size + splitDistance : allPossibleThreats[i].size + 2*player[k].size);
                        for (var j = clusterAllFood.length - 1; j >= 0 ; j--) {
							// Does path to food pass too close to a threat?
							// "Too close" means path to food crosses within the circle of threatRange (including being directly w/in that circle)

							var closestV = lineSegmentIntersectsCircle (
								player[k].x, player[k].y,
								clusterAllFood[j][0], clusterAllFood[j][1],
								allPossibleThreats[i].x, allPossibleThreats[i].y,
								threatRange
							)
							if ((closestV.x == player[k].x) && (closestV.y == player[k].y)) {
								// player[k] is in threat zone. Check if the would-be food is, too.  If so, it will be removed.
								// If not, it will stay in consideration.
								closestV.x = clusterAllFood[j][0];
								closestV.y = clusterAllFood[j][1];
							}
							if (computeDistance (allPossibleThreats[i].x, allPossibleThreats[i].y,closestV.x,closestV.y) <= threatRange) {
								clusterAllFood.splice(j, 1);
							}
                        }

					}

					// calcualte and draw obstacle angles
                    var sortedObList = [];
                    for (var i = 0; i < obstacleList.length; i++) {
                        sortedObList = addAngle(sortedObList, obstacleList[i]);

                        if (sortedObList.length == 0) {
                            break;
                        }
                    }

                    var obOffsetI = 1;
                    if (sortedObList.length > 0 && sortedObList[0][1]) {
                        obOffsetI = 0;
                    }

                    var obstacleAngles = [];
                    for (var i = 0; i < sortedObList.length; i += 2) {
                        var angle1 = sortedObList[(i + obOffsetI).mod(sortedObList.length)][0];
                        var angle2 = sortedObList[(i + 1 + obOffsetI).mod(sortedObList.length)][0];
                        var diff = (angle2 - angle1).mod(360);
                        obstacleAngles.push([angle1, diff]);
                    }

                    for (var i = 0; i < obstacleAngles.length; i++) {
                        var line1 = followAngle(obstacleAngles[i][0], player[k].x, player[k].y, 50 + player[k].size);
                        var line2 = followAngle((obstacleAngles[i][0] + obstacleAngles[i][1]).mod(360), player[k].x, player[k].y, 50 + player[k].size);
                        drawLine(player[k].x, player[k].y, line1[0], line1[1], 6);
                        drawLine(player[k].x, player[k].y, line2[0], line2[1], 6);

                        drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 6);

                        drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                        drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                    }

					var biggest = goodAngles.reduce (function (biggest,angle,i) {return angle[1]>biggest[1]?angle:biggest;},[0,0])
					var perfectAngle = (biggest[0] + biggest[1] / 2).mod(360);
					var FOOD_ANGLE_TOLERANCE = 0;
					var LHS = biggest[0]+FOOD_ANGLE_TOLERANCE;
					var RHS = LHS+biggest[1]-FOOD_ANGLE_TOLERANCE;
					var dist = 300;
					var drawLineColor = 7;
					// Hunt within the perfect angle constraint
					var foodTarget = clusterAllFood.reduce (function (best, next, n, arr) {
						clusterBearing = next[3] + (LHS>next[3]&&RHS>359?360:0);
						if ((clusterBearing >= (LHS)) && (clusterBearing <= (RHS)) && (next[2] > best[2])) {
							best = next;
						}
						return best;
					}, [0,0,0,[]]);

					if (foodTarget[2] > 0) {
						dist = computeDistance(player[k].x,player[k].y, foodTarget[0], foodTarget[1]);
						drawLineColor = 1;
						perfectAngle = foodTarget[3];
						for (var l = 0; l < foodTarget[4].length; l++) {
					        drawPoint(allPossibleFood[foodTarget[4][l]][0], allPossibleFood[foodTarget[4][l]][1], 1, "");
						}
						foodTargetRecord.push([getUpdate(),foodTarget]);
					}

					perfectAngle = shiftAngle(obstacleAngles, perfectAngle, biggest);

					var line1 = followAngle(perfectAngle, player[k].x, player[k].y, dist);

					drawLine(player[k].x, player[k].y, line1[0], line1[1], drawLineColor);
					tempMoveX = line1[0];
					tempMoveY = line1[1];
                } // for
				lastOthers = {};
				for (var l = 0; l < allOthers.length; l++) {
					lastOthers[allOthers[l].id] = [allOthers[l].x, allOthers[l].y];
				}
            } // if player length >0

			positionRecord.push([player[0].x,player[0].y]);
			updateRecord.push(getUpdate());
			targetRecord.push([tempMoveX,tempMoveY]);
            return [tempMoveX, tempMoveY];
        } // if debugDump
    }

    function screenToGameX(x) {
        return (x - getWidth() / 2) / getRatio() + getX();
    }

    function screenToGameY(y) {
        return (y - getHeight() / 2) / getRatio() + getY();
    }

    function drawPoint(x_1, y_1, drawColor, text) {
        f.drawPoint(x_1, y_1, drawColor, text);
    }

    function drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
        f.drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor);
    }

    function drawLine(x_1, y_1, x_2, y_2, drawColor) {
        f.drawLine(x_1, y_1, x_2, y_2, drawColor);
    }

    function drawCircle(x_1, y_1, radius, drawColor) {
        f.drawCircle(x_1, y_1, radius, drawColor);
    }

    function screenDistance() {
        var temp = f.getScreenDistance();
        return temp;
    }

    function getDarkBool() {
        return f.getDarkBool();
    }

    function getMassBool() {
        return f.getMassBool();
    }

    function getMemoryCells() {
        return f.getMemoryCells();
    }

    function getCellsArray() {
        return f.getCellsArray();
    }

    function getCells() {
        return f.getCells();
    }

    function getPlayer() {
        return f.getPlayer();
    }

    function getWidth() {
        return f.getWidth();
    }

    function getHeight() {
        return f.getHeight();
    }

    function getRatio() {
        return f.getRatio();
    }

    function getOffsetX() {
        return f.getOffsetX();
    }

    function getOffsetY() {
        return f.getOffsetY();
    }

    function getX() {
        return f.getX();
    }

    function getY() {
        return f.getY();
    }

    function getPointX() {
        return f.getPointX();
    }

    function getPointY() {
        return f.getPointY();
    }

    function getMouseX() {
        return f.getMouseX();
    }

    function getMouseY() {
        return f.getMouseY();
    }

    function getUpdate() {
        return f.getLastUpdate();
    }
})(window, jQuery);
