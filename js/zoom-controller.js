/**
 * Created by iago on 16/07/15.
 */

//This is the size of the first window, this was set manualliy
var TOP_LEFT_POINT = {x: 663, y: 18}; //Pixels video 1
var VIDEO_WINDOW_SIZE = {w: 595, h: 335}; //Pixels (Note: You have to respect the aspect ratio)

/********************************************************************************/
var video;
var loop_running = false;
var systemStarted = false;
var my_manager;
//That variable select which video is focus on
var videoNumber = 1;
var fullScreenOn;

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
 * Here we should control if fullsize or not
 */
function updateStatus() {
    if (!video.paused) {
        //TODO: PA QUE EL LOOP?
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
 * @param {type} video
 * @returns {undefined}
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
    this.canvasElement = canvasElement;

    /**
     * Updates the zoom state in function of the time and the detection position
     */
    this.updateState = function () {
        //seleccionamos el video que toca ver segun el radiobutton
        selectVideo();
        console.log("selectVideo");
        var context = this.canvasElement.getContext('2d');
        context.fillStyle = 'black';
        //The image to draw will fill the full canvas size
        context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        context.drawImage(video, -TOP_LEFT_POINT.x, -TOP_LEFT_POINT.y);
    };
}

/**
 * adapt the cambas to fullscreem or normal screem
 * 
 * @returns {undefined}
 */
function adaptCanvas() {
    fullScreenOn = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    if (fullScreenOn) {
        // browser is fullscreen
        //adapta el cambas al tamaño, dandole la profuncidad neesaria en el CSS
        $('.drawing-layer').css('z-index', 2147483647);
    } else {
        $('.drawing-layer').css('z-index', "");
    }
}
/**
 * choose the value of radiobutton
 * @param {type} ctrl
 * @returns {unresolved}
 */
function getRadioButtonSelectedValue(ctrl) {
    for (i = 0; i < ctrl.length; i++)
        if (ctrl[i].checked)
            return ctrl[i].value;
}
/**
 * Select the video to see with the value of radiobutton.
 * @returns {undefined}
 */
function selectVideo() {
    videoNumber = getRadioButtonSelectedValue(document.fVideos.video);
    //console.log(videoNumber);
    if (parseInt(videoNumber) === 1) {
        //console.log("Entramos en 1");
        TOP_LEFT_POINT = {x: 663, y: 18}; //Pixels video 1
    } else if (parseInt(videoNumber) === 2) {
        //console.log("Entramos en ");
        TOP_LEFT_POINT = {x: 663, y: 370}; //Pixels video 2
    } else if (parseInt(videoNumber) === 3) {
        //console.log("Entramos en 3");
        TOP_LEFT_POINT = {x: 663, y: 718}; //Pixels video 3
    }
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
    });

    $(window).resize(function () {
        //console.log("Entramos en window resize");
        if (systemStarted) {
            //adaptamos el canvas a fullscreem o pantalla normal
            adaptCanvas();
            adjustCanvas(video);
        }
    });
});
