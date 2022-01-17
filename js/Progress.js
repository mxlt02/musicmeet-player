(function(window){
    function Progress($progressBar,$progressLine,$progressDot){
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
    }
    //TODO 工程
    Progress.prototype={
        constructor:Progress,
        init:function($progressBar,$progressLine,$progressDot){
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        //体验优化,按下鼠标的时候或者移动的时候不要让进度条自动跑
        movingProgress : false,
        progressClick:function(callback){
            var $this = this;
            this.$progressBar.mousedown(function (event) {
                $this.movingProgress=true;
                //获取背景距离窗口边缘的距离
                var  normalLeft = $(this).offset().left;
                //获取点击事件发生点距离窗口边缘的距离
                var eventLeft = event.pageX;
                //设置前景宽度
                $this.$progressLine.css("width",eventLeft-normalLeft);
                $this.$progressDot.css("left",eventLeft-normalLeft);

                //============
                $this.progressMove(function (rateProgress) {
                    callback(rateProgress);
                },this);

            });
        },
        progressMove:function(callback,x){
            var $this = this;
            //监听鼠标抬起事件
            $(document).mouseup(function () {
                $this.movingProgress=false;
                $(document).off("mousemove");
                $(document).off("mouseup");
                var rateProgress = (parseInt($this.$progressLine.css("width"))/$this.$progressBar.width())
                callback(rateProgress);

            });
            $(document).mousemove(function (event) {
                $this.movingProgress=true;

                //获取背景距离窗口边缘的距离
                var  normalLeft = $(x).offset().left;
                //获取点击事件发生点距离窗口边缘的距离
                var eventLeft = event.pageX;
                var result = eventLeft-normalLeft;
                //设置前景宽度
                //这么多代码都是为了不让 进度条断层
                //?,假设你的鼠标在mousemove还没执行完前移动到了超过进度条100%的地方,是否会出现拉不动的情况
                //这样写完美解决
                if (result>=parseInt($this.$progressBar.css("width"))){
                    $this.$progressLine.css("width","100%");
                    $this.$progressDot.css("left","100%");
                }else if(result<=0){
                    $this.$progressLine.css("width",0);
                    $this.$progressDot.css("left",0);
                }else{
                    $this.$progressLine.css("width",result);
                    $this.$progressDot.css("left",result);
                }

            });
        },
        //设置进度条
        setProgress: function (value) {
            if ((value>=0||value<=100)&&!this.movingProgress){
                this.$progressLine.css("width",value+"%");
                this.$progressDot.css("left",value+"%");
            }
        }
    }
    Progress.prototype.init.prototype=Progress.prototype;
    window.Progress=Progress;
})(window);