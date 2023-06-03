const sub_title = document.querySelector('.text-sub');
sub_title.innerHTML =`  ‘공짜시간’은 7시에 일어나 활동한 12주간의 기록입니다.<br>
원래 없는 것과 같았던 오전 시간을 활용해 아침을 먹고, 움직였습니다.<br>
사진 두 개 중 위에는 매일 챙겨 먹은 아침식사를, 아래에는 한 일을 기록했습니다.<br>
하나씩 사진을 업로드할 때마다 하루 24시간에 추가되는 시간을 볼 수 있습니다.`;

const swiperEl = document.querySelector('swiper-container')

    Object.assign(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
    //   pagination: {
    //     clickable: false,
    //   },
      breakpoints: {
        "@0.00": {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        "@0.75": {
          slidesPerView: 2,
          spaceBetween: 0,
        },
        "@1.00": {
          slidesPerView: 3,
          spaceBetween: 0,
        },
        "@1.50": {
          slidesPerView: 4,
          spaceBetween: 0,
        },
      },
    });

swiperEl.initialize();


const value = [
7.00,
7.00,
7.00,
6.49,
7.00,
6.23,
7.00,
7.00,
7.17,
7.00,
6.39,
6.27,
6.01,
6.20,
7.00,
6.27,
6.50,
7.00,
6.36,
7.39,
7.27,
6.50,
7.07,
6.37,
7.18,
7.00,
7.18,
7.56,
7.09,
6.40,
7.00,
7.00,
7.00,
6.51,
6.58,
7.01,
5.30,
5.50,
6.42,
7.18,
6.56,
6.15,
7.00,
7.44,
6.50,
7.09,
6.15,
6.07,
]

const mapList = new Map();

console.log(value.length);

for (let i =0;i<48;i++) { 
    mapList.set(`${i+1}`,`${value[i]}`);
     
}

for (let i =0;i<48;i++) { 
    console.log(mapList.get(`${i+1}`));
}

const here = document.querySelector('#here');

for (let i =1; i<=48; i++) {
    let id = "selCount" + String(i);
    console.log(id);
    let element = document.getElementById(id);

    element.addEventListener("click", function() {
        // 이벤트 핸들러 동작
        here.innerHTML = ` ${12-parseFloat(element.getAttribute("data-value"))} 시간`;
      });

}