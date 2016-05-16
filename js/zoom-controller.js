/**
 * Created by iago on 16/07/15.
 */

//This is the size of the first window, this was set manualliy
var TOP_LEFT_POINT = {x: 663, y: 18}; //Pixels
var VIDEO_WINDOW_SIZE = {w: 595, h: 335}; //Pixels (Note: You have to respect the aspect ratio)

/********************************************************************************/
var video;
var loop_running = false;
var systemStarted = false;
var my_manager;

var updateIndex = 0;
var lastUpdateTimes = Array.apply(null, new Array(10)).map(Number.prototype.valueOf, 0);

var videoDetections;

function arrayMean(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += parseInt(arr[i], 10);
    }
    return sum / arr.length;
}

/**
 * If the video is runnig, call to the my_manager.updateState() for each frame.
 */
function updateStatus() {
    if (!video.paused) {
        loop_running = true;

        var time = Date.now();
        my_manager.updateState();

        updateIndex = (updateIndex + 1) % lastUpdateTimes.length;
        lastUpdateTimes[updateIndex] = Date.now() - time;
        //Waits the fps time least data processing time
        var updateTime = Math.floor((1000 / my_manager.fps) - arrayMean(lastUpdateTimes));
        //console.log("(fps: " + my_manager.fps + ")estimateTime: " + updateTime);
        return setTimeout(updateStatus, updateTime);
    } else {
        loop_running = false;
        console.log("EXIT!!");
    }
}

/**
 * Set the canvas element size to be the video size
 */
function adjustCanvas(video) {
    // This container define the real size of the canvas element, because
    // it has the css widt and height set to 100%
    $('#canvas-container')
        .height($(video).height())
        .width($(video).width())
        .offset({top: $(video).offset().top, left: $(video).offset().left});

    // This attribute se the size of the canvas content
    // NOTE: The aspect ratio must respect the video aspect ratio
    $('.drawing-layer')
        .attr('height', VIDEO_WINDOW_SIZE.h)
        .attr('width', VIDEO_WINDOW_SIZE.w);

    my_manager.updateState();
}

/**
 * Sets the handlers for the video events
 *
 * @param video
 */
function bindVideoEvents(video) {
    adjustCanvas(video);

    $(video).bind('timeupdate', function () {
        my_manager.updateState();
    });

    $(video).bind('play', function () {
        updateStatus();
    });
}

/*******************************************************************************/


function ZoomManager(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement

    /**
     * Updates the zoom state in function of the time and the detection position
     */
    this.updateState = function () {
        var context = this.canvasElement.getContext('2d');
        context.fillStyle = 'black';
        //The image to draw will fill the full canvas size
        context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        context.drawImage(video, -TOP_LEFT_POINT.x, -TOP_LEFT_POINT.y);
    };
}

$(document).ready(function () {

    video = document.getElementById('video-player');

    $(video).ready(function () {
        if (systemStarted) {
            adjustCanvas(video);
        }
    });

    $(video).resize(function () {

        if (!systemStarted) {

            //Create the videoDetections object from the xml result and add its observers
            my_manager = new ZoomManager(video, document.getElementById("zoom-layer"));

            systemStarted = true;
            bindVideoEvents(video);

            video.play();
        } else {
            //Here we have the necessary data of the video
            adjustCanvas(video);
        }
        adjustCanvas(video);
    });

    $(window).resize(function () {
        if (systemStarted) {
            adjustCanvas(video);
        }
    });
});
