(function(window){
    function Player($audio){
        return new Player.prototype.init($audio);
    }
    Player.prototype={
        constructor:Player,
        musicList: [],
        init:function($audio){
            this.$audio = $audio;//获取jq包装对象
            this.audio = $audio.get(0);//获取原生对象
        },
        currentIndex: -1,
        playMusic: function (index,music) {

            //判断是否是同一首音乐
            if (this.currentIndex == index){
                if (this.audio.paused){
                    this.audio.play();
                }else {
                    this.audio.pause();
                }
            }else {
                //不是同一首
                this.$audio.attr("src",music.link_url);
                this.audio.play();
                this.currentIndex=index;
            }
        },
        nextIndex: function () {
            var index = this.currentIndex+1
            if (index>this.musicList.length-1){
                index=0;
            }
            return index;
        },
        preIndex: function () {
            var index = this.currentIndex-1
            if (index<0){
                index=this.musicList.length-1;
            }
            return index;
        },
        changeMusicList: function (index) {
            this.musicList.splice(index,1);
            //如果删了playing song 前面的就同时更新currentIndex,避免下标异常
            if (index<this.currentIndex){
                this.currentIndex--;
            }
        },
        // TODO 回调函数
        // 回调把一个函数作为参数传递给另一个函数，并在其父函数完成后执行。
        //当歌曲放的时候时间变化会触发该事件
        timeRun: function (callback) {
            var $this = this;//存的是player
            this.$audio.on("timeupdate", function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime, duration);
                var next = false;
                if ($this.audio.ended){
                    next=true;
                }
                //修改时间
                callback(currentTime,duration,timeStr,next);
            });
        },
        formatDate: function (currentTime, duration) {
            var endMin = parseInt(duration / 60); // 2
            var endSec = parseInt(duration % 60);
            if(endMin < 10){
                endMin = "0" + endMin;
            }
            if(endSec < 10){
                endSec = "0" + endSec;
            }

            var startMin = parseInt(currentTime / 60); // 2
            var startSec = parseInt(currentTime % 60);
            if(startMin < 10){
                startMin = "0" + startMin;
            }
            if(startSec < 10){
                startSec = "0" + startSec;
            }
            return startMin+":"+startSec+" / "+endMin+":"+endSec;
        },
        musicSeekTo: function (rateProgress) {
            if (!isNaN(rateProgress)){
                //注意!! 这里BUG修了一小时
                //Failed  the 'currentTime' property 'HTMLMediaElement' provided double value is non-finite.
                var num = this.audio.duration * rateProgress;
                if (num>=0&&num<=this.audio.duration){
                    this.audio.currentTime = num;
                }
            }
        },
        volumeBackup: 0.5
        ,
        // 0~1 , 0.1 0.9
        musicVolume: function (value) {
            if (!isNaN(value)&&value>=0&&value<=1){
                if (value!=0&&value!=undefined){
                    this.audio.volume=value;
                    this.volumeBackup=value;
                }else if (value==0){
                    this.audio.volume=value;
                }
            }
        }
    }
    Player.prototype.init.prototype=Player.prototype;
    window.Player=Player;
})(window);