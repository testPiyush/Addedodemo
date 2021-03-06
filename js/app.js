/**
 * app.js
 * This file contains code for video album functionality
 * @version 1.0
 * @author    Piyush ranjan <piyush.ranjan.for143@gmail.com>
 * @licensor  Piyush ranjan (This code is confidencial. Can not be used in any application and can not be shared with anyone)
 * @site      Video Album Demo
 * @namespace app
 *
 */
var app = app || function(){
        /**
         * Global Variable declearation.
         */
        var video = document.getElementById('player'),sources = video.getElementsByTagName('source'),
        videoList = document.querySelector('.video-list ul'),
        videoListViewport = document.getElementsByClassName("video-list")[0].offsetWidth,
        currentPage = '',
        availableVideoList;
        
        /**
         * This function handles keypress action to run appropriate function on keypress
         * @memberof app
         * @method _handleKeyUp
         * @param {number} keyCode - ascii code of key pressed.
         * @returns void
         * @namespace app._handleKeyUp
         */
        var _handleKeyUp = function(keyCode){
            var selectedVideo = (document.getElementsByClassName('selected').length) ? document.getElementsByClassName('selected')[0]: null;
            if (keyCode == 39 && selectedVideo.nextElementSibling) {   
                selectedVideo.nextElementSibling.className = 'selected';
                selectedVideo.className = '';
                _adjustOnScreen();

            } else if(keyCode == 37 && selectedVideo.previousSibling) {
                selectedVideo.previousSibling.className = 'selected';
                selectedVideo.className = '';
                _adjustOnScreen();
            } else if(keyCode == 13 && selectedVideo){
                _playVideo();
            }


        },    
        
        /**
         * This function renders video list for both history and available videos
         * @param {string} url - API url to get video list in JSON
         * @returns void
         * @memberof app
         * @method _renderVideoList
         * @namespace app._renderVideoList
         */
        _renderVideoList = function(url){
            videoList.innerHTML = '';
          $.get(url,function(response){
              var videoListHtml = [], videoListToRander = [];
              if(currentPage==='/'){
                   availableVideoList =  response.entries;
                   videoListToRander = availableVideoList;
              }else{
                  videoListToRander = JSON.parse(response);
              }
              $.each(videoListToRander,function(index, value){
                    
                  var videoUrl = (value.contents.length)? value.contents[0].url :'',
                  title = value.description,
                  name = value.title,
                  image = (value.images.length)? value.images[0].url :'',
                  imageWidth = (value.images.length)? value.images[0].width :0,
                  imageheight = (value.images.length)? value.images[0].height :0;
                    videoListHtml.push('<li data-videoUrl="'+videoUrl+'" data-index="'+index+'">');
                        videoListHtml.push('<a href="javascript:void(0)" title="'+title+'">');
                            videoListHtml.push('<img src="'+image+'" alt="'+name+'" title="'+name+'" height="'+imageheight+'" width="'+imageWidth+'" />');
                            videoListHtml.push(name);
                        videoListHtml.push('</a>');
                    videoListHtml.push('</li>');

              });
              if(!_isTouchDevice()){
                  videoList.style.width = (videoListToRander.length*228) + 'px';
              }
              
              videoList.innerHTML = videoListHtml.join('');
          });
        },
        /*
         * This function returns true if current device is a touch screen device
         * @returns boolean _isTouchDevice
         * @memberof app
         * @method _isTouchDevice
         * @namespace app._isTouchDevice
         */
        _isTouchDevice= function() {  
                try {  
                  document.createEvent("TouchEvent");  
                  return true;  
                } catch (e) {  
                  return false;  
                }  
        },
        /**
         * This function work for all video related functionality like to play, pause, load etc..
         * @memberof app
         * @method _playVideo
         * @param void
         * @returns void
         * @namespace app._playVideo
         */
        _playVideo = function(){
            var selectedVideo = (document.getElementsByClassName('selected').length) ? document.getElementsByClassName('selected')[0]: null,
            videoUrl = selectedVideo.dataset.videourl,
            mainPlayBtn = document.querySelector('.overlay-btn .fa'),
            overlay = document.getElementsByClassName('overlay-btn')[0],
            bottonPlayBtn = document.querySelector('.pay-btn .fa'),
            selectedVideoIndex = selectedVideo.dataset.index,
            videoCtrl = document.getElementsByClassName('video-controls')[0];
            sources[0].src = videoUrl;
            video.load();
            video.play();
            mainPlayBtn.className = 'fa fa-pause-circle-o';
            bottonPlayBtn.className = 'fa fa-pause';

            video.webkitEnterFullscreen();
            videoCtrl.style.display = 'block';
            
            if(currentPage==='/' && availableVideoList.length && availableVideoList[selectedVideoIndex]){
                $.ajax({
                    url: "http://localhost:3000/video",
                    type: "POST",
                    dataType:'json',
                    contentType: 'application/json',
                    data: JSON.stringify(availableVideoList[selectedVideoIndex]),
                    success: function (response) {
                       console.log(response);     
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR);
                       console.log(textStatus, errorThrown);
                    }

                });
            }
            video.addEventListener('ended',function(e){
                this.webkitExitFullScreen();
                video.pause();
                mainPlayBtn.className = 'fa fa-play-circle-o';
                bottonPlayBtn.className = 'fa fa-play';
                sources[0].src = "";
                video.load();
                videoCtrl.style.display = 'none';
            },false);
            video.addEventListener('webkitfullscreenchange',function(e){
                if(!document.webkitIsFullScreen){
                    video.pause();
                   mainPlayBtn.className = 'fa fa-play-circle-o';
                    bottonPlayBtn.className = 'fa fa-play';
                    sources[0].src = "";
                    video.load();
                    videoCtrl.style.display = 'none';
                }

            },false);


        },
        
        /**
         * This function adjust and make selected video visible on screen on arrow navigation video selection
         * @memberof app
         * @method _adjustOnScreen
         * @param void
         * @returns void
         * @namespace app._adjustOnScreen
         */
        _adjustOnScreen = function(){

            var selectedVideo = document.getElementsByClassName("selected")[0],
            minVisiblePos = videoList.offsetLeft,
            maxVisiblePos = minVisiblePos+ videoListViewport,
            videoWidth = selectedVideo.offsetWidth,
            scrollWidth = 0,
            selectedVideoPosition =0;
    
            selectedVideoPosition = selectedVideo.offsetLeft;
            
            if(selectedVideoPosition < minVisiblePos){
                scrollWidth = selectedVideoPosition;
             }else if(selectedVideoPosition+videoWidth > maxVisiblePos){
                 scrollWidth = -(((selectedVideoPosition+videoWidth)-maxVisiblePos)+minVisiblePos);
             }else{
                 scrollWidth = false;
             }
             if(scrollWidth){
                 videoList.style.left = scrollWidth + 'px';
             }

        },
        
        /**
         * This function binds all dom event and take required actions
         * @memberof app
         * @method _bindEvents
         * @param void
         * @returns void
         * @namespace app._bindEvents
         */
        _bindEvents = function(){
            $(document).off("keydown").on('keydown',function(e){ 
                e.stopPropagation()
                _handleKeyUp(e.keyCode);
            });
            $(document).on('click','.video-list li', function(){
                $('.video-list li.selected').removeClass('selected');
                $(this).addClass('selected');

            });
            $(document).on('click','.overlay-btn, .pay-btn .fa', function(){
                if($('.overlay-btn .fa').hasClass('fa-pause-circle-o')){
                    video.pause();
                    $('.overlay-btn .fa').removeClass('fa-pause-circle-o').addClass('fa-play-circle-o');
                    $('.pay-btn .fa').removeClass('fa-pause').addClass('fa-play');
                }else{
                    video.play();
                    $('.overlay-btn .fa').removeClass('fa-play-circle-o').addClass('fa-pause-circle-o');
                    $('.pay-btn .fa').removeClass('fa-play').addClass('fa-pause');
                    console.log(video.duration);
                }
            });

            $(document).on('click','.bottom-ctrl .time-bar', function(e) {
              var pos = (e.pageX  - (this.offsetLeft + this.offsetParent.offsetLeft)) / this.offsetWidth;
              video.currentTime = pos * video.duration;
           });
            // As the video is playing, update the progress bar
           video.addEventListener('timeupdate', function() {
                   // For mobile browsers, ensure that the progress element's max attribute is set
                   $('.bottom-ctrl .current-time').css('width',Math.floor((video.currentTime / video.duration) * 100) + '%');
           });
            var timeout = null;

            $(document).on('mousemove','.video-player', function() {
                if (timeout !== null) {
                    $('.bottom-ctrl').show();
                    $('.overlay-btn .fa').show();
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function() {
                   $('.bottom-ctrl').hide();
                   $('.overlay-btn .fa').hide();
                }, 1000);
            });

            $("body").mousewheel(function(event, delta) {

                    var scrollWidth = (delta * 30) +(videoList.offsetLeft);
                    if(scrollWidth<=0 && scrollWidth > -((videoList.offsetWidth+50) - videoListViewport)){
                        videoList.style.left = scrollWidth + 'px';
                    }
                    event.preventDefault();
            });
            $(document).on('touchend','.video-list li', function(){
                $('.video-list li').removeClass('selected');
                $(this).addClass('selected')
                _playVideo();
            })
        };
        
       /**
        * This function is first function which got called when page loaded and this is resposible to initiate the application
        * @memberof app
        * @method _init
        * @constructor
        * @param void
        * @namespace app._init
        */
        _init = function(){
          window.addEventListener("hashchange", function(){
               var page = window.location.hash,
               apiUrl = 'https://demo2697834.mockable.io/movies',
               historyApiUrl='http://localhost:3000/video';
               page = page.split('#');
               page = (page.length>1)? page[1] : '/';
               if(page==='history'){
                   _renderVideoList(historyApiUrl);
               }else{
                   _renderVideoList(apiUrl);
                  
               }
               currentPage = page;
                
          }, false);
          
          window.onload= function(){
               /**
                * @memberof app
                * @method Emit hashchange event to refresh the page even when hash is not changing
                * @eventevt
                */
               window.dispatchEvent(new HashChangeEvent("hashchange"));
               _bindEvents();
          };
        };
        return{
          init:_init
        };

};
/**
 * Bootstraping application.
 */

$(document).ready(function(){
  var myApp = app();
  myApp.init();
});