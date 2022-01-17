(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        loadLyric: function (callback) { //加载
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    // console.log(data);
                    $this.parseLyric(data);//解析
                    //到这来说明所有数据处理完毕了,调用者可以开始操作了
                    callback();
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        parseLyric: function (data) {
            var $this = this;
            // 清空上一首歌曲的歌词和时间
            $this.times = [];
            $this.lyrics = [];
            var array = data.split("\n");
            // console.log(array);
            // [00:00.92]
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            // 遍历取出每一条歌词
            $.each(array, function (index, ele) {
                // 处理歌词
                var lrc = ele.split("]")[1];
                console.log(lrc);
                // 排除空字符串(没有歌词的)
                if(lrc.length <= 0) return true;//类似continue
                $this.lyrics.push(lrc);
                // 处理时间
                var res = timeReg.exec(ele);//匹配时间
                if(res == null) return true;
                // console.log(res);
                var timeStr = res[1]; // 00:00.92
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2)) ;//toFixed保留几位小数
                $this.times.push(time);
            });
        },
        lastCurrentTime:0
        ,
        currentIndex: function (currentTime) {
            let max = 0;
            // console.log(this.index);
            if (currentTime>this.lastCurrentTime){
                max=this.index;
            }
            for (let i = max; i < this.times.length; i++) {
                if(currentTime >= this.times[i]){
                    this.index=i; // 0  1
                    //this.times.shift(); // 删除数组最前面的一个元素
                    // this.lastCurrentTime=currentTime;
                    // return this.index-1;
                }
            }
            this.lastCurrentTime=currentTime;
            return this.index; // 1
        }
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);