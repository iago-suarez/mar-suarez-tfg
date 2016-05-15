/**
 * Created by iago on 16/07/15.
 */


const VIDEO_CENTER_POINT = {x: 100, y: 280}; //Pixels
const VIDEO_WINDOW_SIZE = 150; //Pixels

/********************************************************************************/
var video;
var loop_running = false;
var systemStarted = false;
var zoomVD;

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

function updateStatus() {
    if (!video.paused) {
        loop_running = true;

        var time = Date.now();
        zoomVD.updateState();

        updateIndex = (updateIndex + 1) % lastUpdateTimes.length;
        lastUpdateTimes[updateIndex] = Date.now() - time;
        //Waits the fps time least data processing time
        var updateTime = Math.floor((1000 / zoomVD.fps) - arrayMean(lastUpdateTimes));
        //console.log("(fps: " + zoomVD.fps + ")estimateTime: " + updateTime);
        return setTimeout(updateStatus, updateTime);
    } else {
        loop_running = false;
        console.log("EXIT!!");
    }
}

function adjustCanvas(video) {
    $('#video-player').width(window.innerWidth -30);
    //window.resizeTo(window.innerWidth, $('body').height() +30);
    $('#canvas-container')
        .height($(video).height())
        .width($(video).width())
        .offset({top: $(video).offset().top, left: $(video).offset().left});
    $('.drawing-layer').attr('height', zoomVD.window_size)
        .attr('width', zoomVD.window_size);

    zoomVD.updateState();
}

/**
 * Sets the handlers for the video events
 *
 * @param video
 */
function bindVideoEvents(video) {
    adjustCanvas(video);

    $(video).bind('timeupdate', function () {
        zoomVD.updateState();
    });

    $(video).bind('play', function () {
        //Checks if the loop is still running
        //if (!loop_running) {
        updateStatus();
        //}
    });
}



/**
 * Given the center to the window, this function calc the
 * distance in pixels to the top margin and left margin of
 * the video for a windows with size window_size
 * @param center
 * @param window_size
 * @param video
 * @returns {{left: number, top: number}}
 */
function centerToLeftTop(center, window_size, video) {
    var x = center.x - window_size / 2;
    //If the box is over the video size adjust it
    if (x < 0) {
        x = 0;
    } else if ((x + window_size) > video.videoWidth) {
        x = video.videoWidth - window_size;
    }
    var y = center.y - window_size / 2;
    //If the box is over the video size adjust it
    if (y < 0) {
        y = 0;
    } else if ((y + window_size) > video.videoHeight) {
        y = video.videoHeight - window_size;
    }

    if (video.videoWidth < window_size) {
        // The video is less wide than the canvas element
        x = -(Math.abs(video.videoWidth - window_size) / 2);

    } else if (video.videoHeight < window_size) {
        // The video is less high than the canvas element
        y = -(Math.abs(video.videoHeight - window_size) / 2);
    }
    return {left: x, top: y};
}

/*******************************************************************************/


function ZoomVideoDetections(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement
    this.maxZoom = 50;//Math.max(this.detection.maxSize.h, this.detection.maxSize.w);
    this.minZoom = Math.max(this.videoElement.videoHeight, this.videoElement.videoWidth);
    this.window_size = VIDEO_WINDOW_SIZE;//this.maxZoom * 2;
    this.center = VIDEO_CENTER_POINT; //Object with x and y fields
    this.zoomedOut = false;

    /**
     * Updates the zoom state in function of the time and the detection position
     */
    this.updateState = function () {
        var context = this.canvasElement.getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        var pos = centerToLeftTop(
            this.center, 
            this.window_size, 
            video);

        context.drawImage(video, -pos.left, -pos.top);
    };
}

$(document).ready(function () {

    video = document.getElementById('video-player');

    $(video).ready(function () {
        if (systemStarted) {
            //console.log("ready h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
    });

    $(video).resize(function () {

        if (!systemStarted) {

            //Create the videoDetections object from the xml result and add its observers
            zoomVD = new ZoomVideoDetections(video, document.getElementById("suspicious-layer"));

            systemStarted = true;
            bindVideoEvents(video);

            video.play();
        } else {
            //Here we have the necessary data of the video
            console.log("resize1 h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
        console.log("resize1 h: " + video.videoHeight + ", w: " + video.videoWidth);
        adjustCanvas(video);
    });

    $(window).resize(function () {
        if (systemStarted) {
            console.log("resizeW h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
    });
});
