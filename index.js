/**
 * 1. Render Songs --> OK
 * 2. Scroll Top --> OK
 * 3. Play / pause / seek --> OK
 * 4. CD rotate --> OK
 * 5. Next / prev --> OK
 * 6. Random --> OK
 * 7. Next / Repeat when ended --> OK
 * 8. Active song --> OK
 * 9. Scroll active song into view --> OK
 * 10 .Play song when click --> OK
 */

const $ = document.querySelector.bind(document); 
const $$ = document.querySelectorAll.bind(document);

const STORAGE_KEY = "DUONG_PVP";

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const progress = $("#progress")
const playBtn = $('.btn-toggle-play')
const nextBtn = $(".btn-next");
const preBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
    songs : [
        {
            name: 'Trọng Hạ Chưa Bao Giờ Quên Tôi',
            singer: 'Tiểu Vũ',
            path: './asset/music/music1.mp3',
            image: './asset/img/pic1.jpg'
        },
        {
            name: 'Nắng Chiều Cùng Những Chú Mèo',
            singer: 'Tiểu Vũ',
            path: './asset/music/music2.mp3',
            image: './asset/img/pic2.jpg'
        },
        {
            name: 'Ánh Sao Khắp Trời',
            singer: 'Tiểu Vũ',
            path: './asset/music/music3.mp3',
            image: './asset/img/pic3.jpg'
        },
        {
            name: 'Ranh Giới Bầu Trời',
            singer: 'Tiểu Vũ',
            path: './asset/music/music4.mp3',
            image: './asset/img/pic4.jpg'
        },
        {
            name: 'Tiệc Trà Sao',
            singer: 'Tiểu Vũ',
            path: './asset/music/music5.mp3',
            image: './asset/img/pic5.jpg'
        },
        {
            name: 'Mạn Thực Trưa Hè',
            singer: 'Tiểu Vũ',
            path: './asset/music/music6.mp3',
            image: './asset/img/pic6.jpg'
        },
        {
            name: 'Nỗi Nhớ Của Phong Tín Tử',
            singer: 'Tiểu Vũ',
            path: './asset/music/music7.mp3',
            image: './asset/img/pic7.jpg'
        },
        {
            name: 'Thôi Tinh Hồ',
            singer: 'Tiểu Vũ',
            path: './asset/music/music8.mp3',
            image: './asset/img/pic8.jpg'
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `)
        playList.innerHTML = htmls.join('')

    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong',{
            get: function() {
                return this.songs[this.currentIndex]
            }
        });
    },
    handleEvents: function(){
        
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Zoom CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();



        // Click Play button
        playBtn.onclick = function() {
            if (_this.isPlaying){
                audio.pause();
            } else {
                audio.play();
            }
        };

        // When play button is clicked
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add("playing");
            cdThumbAnimate.play();
            _this.render();
            _this.scrollToActive();
        };
        // When pause button is clicked
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };
        // Time update
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const currentProgress = (audio.currentTime / audio.duration)*100;
                progress.value = currentProgress;
            }
        };
        // Seek audio
        progress.onchange = function(e) {
            const seekTimes = e.target.value * audio.duration / 100;
            audio.currentTime = seekTimes;
        };
        // When nextSong button is clicked
        nextBtn.onclick = function () {
            if (_this.isRandom){
                _this.randomSong();
            } else {
                _this.nextSong();                
            }
            audio.play();
        };

        // When previousSong button is clicked
        preBtn.onclick = function () {
            _this.preSong();
            audio.play();
        };

        // When ramdom button is clicked
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active');
        };

        // When song was ended
        audio.onended = function () {
            if (_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        };
        // When repeat button is clicked
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle("active")
        };
        // Click on play list
        playList.onclick = function (e) {
            const targetSong = e.target.closest('.song:not(.active)')

            if (targetSong || e.target.closest('.option')) {
                // When click on a song
                if (targetSong){
                    _this.currentIndex = Number(targetSong.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // When click on option button
                if (e.target.closest('.option')) {
                    console.log('Still working!');
                }
                
            }
        }
    },
    scrollToActive: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){ 
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    preSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){ 
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // Assign configuration from config to application
        this.loadConfig();

        // Dinh nghia cac thuoc tinh cho object
        this.defineProperties();

        // Lang nghe cac su kien (DOM events)
        this.handleEvents();

        // Tai thong tin bai hat
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
    
}
app.start()