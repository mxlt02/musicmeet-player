$(function () {
    //自定义滚动条
    $(".content_in_left_list").mCustomScrollbar({
        scrollInertia:40
    });
    var $audio = $("audio");
    var player = new Player($audio);
    getSongList();
    //1.加载歌曲列表
    function getSongList(){
        $.ajax({
            url:"./source/musiclist.json",
            dataType:"json",
            success:function (data) {
                player.musicList = data;
                var $musicList = $(".content_in_left_list ul");
                $.each(data,function (index,music) {
                    var $item = createMusicItem(index,music);

                    $musicList.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error:function (e) {
                console.log(e)
            }

        });

    }
    var flag = false;
    var lyric;
    //2初始化界面信息
    function initMusicInfo(music) {
        var $music_img = $(".song_info_img img");
        var $song_name = $(".song_info_name a");
        var $singer_name = $(".song_info_singer a");
        var $song_album = $(".song_info_album a");
        var $bar_song_name = $(".music_progress_name a:nth-child(1)");
        var $bar_singer_name = $(".music_progress_name a:nth-child(2)");
        var $bar_time = $(".music_progress_time");
        var $bg = $(".mask_bg");
        $music_img.attr("src",music.cover);
        $song_name.text(music.name);
        $singer_name.text(music.singer);
        $song_album.text(music.album);
        $bar_song_name.text(music.name);
        $bar_singer_name.text(music.singer);
        if (!flag){
            $bar_time.text("00:00 / "+music.time);
            flag=true;
        }
        $bg.css({
            "background": "url('"+music.cover+"') no-repeat 0 0",
            "background-size": "cover"
        });
    }
    //2.3.初始化歌词
    function initMusicLyric(music) {
        // console.log(music);
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".lyric");
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            $.each(lyric.lyrics,function (index,ele) {
                var $item = $("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            })
        });
    }
    // 3.初始化进度条
    var progress;
    //是否放过歌
    var flagPlay = false;
    initProgress();
    function initProgress(){
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar,$progressLine,$progressDot);
        progress.progressClick(function (rateProgress) {
            if (!flagPlay){
                flagPlay=true;
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }
            player.musicSeekTo(rateProgress);
        });

        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        var voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function (volume) {
            player.musicVolume(volume);
        });

    }
    //4.初始化事件监听,按钮的点击都在里面
    initEvents();
    function initEvents() {
       //事件委派机制
       $(".content_in_left_list").delegate(".list_music","mouseenter",function () {
           //显示子菜单
           $(this).find(".list_menu").stop().fadeIn(100);

           //隐藏时长
           $(this).find(".list_time span").stop().fadeOut(0);

           $(this).find(".list_time a").stop().fadeIn(0);
       });
       $(".content_in_left_list").delegate(".list_music","mouseleave",function () {
           //隐藏子菜单
           $(this).find(".list_menu").stop().fadeOut(100);
           $(this).find(".list_time a").stop().fadeOut(0);

           //显示时长
           $(this).find(".list_time span").stop().fadeIn(50);
       });
       //2事件委派监听复选框的点击事件
       $(".content_in_left_list").delegate(".list_check","click",function () {
           $(this).toggleClass("list_checked");
       });
       //3事件委派监听歌曲列表的播放的点击事件
        var $musicPlay = $(".music_play");
        var $item;
        $(".content_in_left_list").delegate(".list_menu_play","click",function () {
           $item = $(this).parents('.list_music');
            flagPlay=true;
           //让歌词跑到头部;
            $('.lyric').css('marginTop','0');
           $(this).toggleClass('list_menu_play2');
           $item.siblings().find('.list_menu_play').removeClass('list_menu_play2');

           if($(this).attr('class').indexOf('list_menu_play2')!=-1){
               $musicPlay.addClass('music_play2');
               $item.find('div').css('color','#fff');
               $item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
               $item.find('.music_number').addClass('music_number2');
               //如果点了不同的歌就切换歌词
               if ($item.get(0).index!=player.currentIndex){
                   initMusicLyric($item.get(0).music);

                   //3.2更新信息
                   initMusicInfo($item.get(0).music);
               }
           }
           else{
               $musicPlay.removeClass('music_play2');
               $item.find('div').css('color','rgba(255,255,255,0.5)');
               $item.find('.music_number2').removeClass('music_number2');
           }

           $item.find('.list_number').toggleClass('list_number2');
           $item.siblings().find('.list_number').removeClass('list_number2');


            //3.1播放歌曲
            player.playMusic($item.get(0).index,$item.get(0).music);

            //更新歌词
           //TODO BUG3
           //


       });
       //footer->toolbar
       //4 播放暂停
       $musicPlay.click(function () {
            //判断有没有播放过音乐
           if (player.currentIndex==-1){
               //没放过
               $(".list_music").eq(0).find(".list_menu_play").trigger("click");
           }else {
               //放过
               $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
           }
           // initMusicLyric($item.get(0).music);
           //已经操作过,对应76行
           flagPlay=true;
           // initMusicLyric($item.get(0).music);
           // alert($item.get(0).index+"   ,"+player.currentIndex);
           // if ($item.index==player.currentIndex){
           //
           // }
           // $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
       });
       //TODO BUG1
       //上一首
       $(".music_previous").click(function () {

           //TODO BUG2
           nextMusic(true);

       });
       //下一首
       $(".music_next").click(function () {
           //TODO BUG1
           nextMusic();

       });
       //7.删除歌曲按钮
       $(".content_in_left_list").delegate(".list_music_delete","click",function () {

            var $item = $(this).parents(".list_music");
            //必须是循环播放模式,同时这首歌正在播放才会阻止本次删除事件并闪烁图标,动画在index.css  423行左右
               if ($('.music_mode').attr('class').indexOf('3')!=-1&&$item.get(0).index==player.currentIndex){
                $('.music_mode').css('transition','1s');
                $('.music_mode').css({
                    'animation':'twinkling 2.5s 1','transition':'1s'
                });
                setTimeout(function () {
                    $('.music_mode').css({
                        'transition':'none','animation':'none'
                    });
                },2600);
                //如果是单曲循环模式就不删歌,让单曲循环按钮闪烁
                // setTimeout(function () {
                //     $('.music_mode').css('opacity','0');
                //     setTimeout(function () {
                //         $('.music_mode').css('opacity','1');
                //         setTimeout(function () {
                //             $('.music_mode').css('opacity','0');
                //             setTimeout(function () {
                //                 $('.music_mode').css('opacity','1');
                //                 setTimeout(function () {
                //                     $('.music_mode').css('transition','none');
                //                 },600)
                //             },600)
                //         },600)
                //     },600)
                // },600)

            }else{

                //判断删除的歌曲是否正在播放,true->自动下一曲
                if ($item.get(0).index==player.currentIndex){
                    $(".music_next").trigger("click");
                }
                $item.remove();
                player.changeMusicList($item.get(0).index);
                //重新排序
                $(".list_music").each(function (index,music) {
                    music.index = index;
                    $(music).find(".list_number").text(index+1);
                });
            }

       });

       //监听全选按钮list_titile list_check i
        $('.list_check_all').click(function () {
            var musicList =  $('.content_in_left_list');
            if ($(this).attr('class').indexOf('list_checked')==-1){
                for (var i = 0; i< musicList.length; i++){
                    $(musicList[i]).find('.list_check').addClass('list_checked');
                }
                $(this).addClass('list_checked');
            }else {
                for (var i = 0; i< musicList.length; i++){
                    $(musicList[i]).find('.list_check').removeClass('list_checked');
                }
                $(this).removeClass('list_checked');
            }
        });

       //TODO 获取下一首放什么的函数!!!
        function nextMusic(isPrevious) {//isLast是否点击了上一首 按钮
            //判断当前歌曲模式
            //TODO 歌曲模式 循环 随机什么的
            //已经操作过,对应76行
            flagPlay=true;
            if ($('.music_mode').attr('class').indexOf('3')!=-1){//循环

                // TODO 未修复的BUG;

                //  因为切换速度过快导致audio没加载好产生的报错,想修复他先要修复播放完暂停异常的BUG,没错这是套娃
                $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
                $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
                console.log('你好,我是开发者->赵,这条报错是我意料之内的Error,是由于网络较慢资源没加载完成的错误,它不会对你造成任何影响哦!');
                // 更新歌词
                initMusicLyric($item.get(0).music);
            }else if($('.music_mode').attr('class').indexOf('2')!=-1){//随机
                //生成随机数
                var index = 0;
                //避免重复歌曲
                while ((index = Math.floor(Math.random()*($(".list_music").length-0)+0))==player.currentIndex);
                $(".list_music").eq(index).find(".list_menu_play").trigger("click");
                // 更新歌词
                initMusicLyric($(".list_music").eq(index).get(0).music);
            }else{
                //列表循环
                //TODO warning
                //不为空就说明是 上一首 下一首按钮调用的
                if (isPrevious!=undefined&&isPrevious){
                    $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
                    // 更新歌词
                    // initMusicLyric($(".list_music").eq(player.preIndex()).get(0).music);
                    initMusicLyric($item.get(0).music);
                }else {
                    $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
                    // 更新歌词
                    initMusicLyric($item.get(0).music);
                    // initMusicLyric($(".list_music").eq(player.nextIndex()).get(0).music);
                }
            }
        }
        //自定义歌曲走多行才滚动
        var runLine=1;
        //8.监听播放速度,进程
        player.timeRun(function (currentTime,duration,timeStr,next) {
            if (next){
                //判断当前歌曲模式
                //TODO 歌曲模式 循环 随机什么的
                nextMusic();

            }else {
                $(".music_progress_time").text(timeStr);
                //设置进度条
                progress.setProgress(currentTime/duration*100);
                //实现歌词同步
                var index = lyric.currentIndex(currentTime);
                // console.log(index);
                var $item =$(".lyric li").eq(index);
                $item.addClass("current");
                $item.siblings().removeClass("current");
                //TODO 这里30是行高
                //计算合理的位置
                if (index<=runLine)return;
                var px = -index+runLine;
                if (runLine==4){
                    px*=16+30;
                }else{
                    px*=30;
                }

                $(".lyric").css({
                    marginTop:px
                });
            }
        });

        //监听右下角一堆菜单事件
        // TODO 纯净模式
        $(".music_only").click(function () {
            if ($(this).attr("class").indexOf("music_only2")==-1){
                $(this).addClass("music_only2");
                $(".song_lyric_container").addClass("pure");
                $(".song_info").css("opacity","0");
                $(".content_in_left").css("opacity","0");
                //记得同时修改上面runtime的值
                runLine=4;
            }else {
                $(this).removeClass("music_only2");
                $(".song_lyric_container").removeClass("pure");
                $(".song_info").css("opacity","1");
                $(".content_in_left").css("opacity","1");
                runLine=1;
            }
        });
        var modeIndex = 1;
        //TODO 音乐模式,列表循环
        $('.music_mode').click(function () {
            modeIndex++;
            if (modeIndex==2){
                $(this).addClass('music_mode2');
            }else if (modeIndex==3){
                $(this).removeClass('music_mode2');
                $(this).addClass('music_mode3');
            }else if (modeIndex==4){
                $(this).removeClass('music_mode3');
                modeIndex=1;
            }
        });


        //10.声音按钮
        $(".music_voice_icon").click(function () {
            $(this).toggleClass("music_voice_icon2");
            if ($(this).attr("class").indexOf("music_voice_icon2")!=-1){
                player.musicVolume(0);
            }else {
                player.musicVolume(player.volumeBackup);
            }
        });
        $(document).keyup(function (event) {
            if (event.keyCode==32){
                $musicPlay.trigger("click");
            }
        });
   }



    //创建单个歌曲的方法
    function createMusicItem(index,music){
        var $item = $("<li class=\"list_music\">\n" +
            "                        <div class=\"list_check\"><i></i></div>\n" +
            "                        <div class=\"list_number\">"+(index+1)+"</div>\n" +
            "                        <div class=\"list_name\">"+music.name+"\n" +
            "                            <div class=\"list_menu\">\n" +
            "                                <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "                                <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"list_singer\">"+music.singer+"</div>\n" +
            "                        <div class=\"list_time\">\n" +
            "                            <span>"+music.time+"</span>\n" +
            "                            <a href=\"javascript:;\" title=\"删除\" class='list_music_delete'></a>\n" +
            "                        </div>\n" +
            "                    </li>");
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }
    // 监听播放的进度
    //TODO 回调函数

    //TODO bug3
    //监听播放的进度
});