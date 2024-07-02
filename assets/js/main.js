$('.skillSlider').slick({
dots: false,
infinite: true,
speed: 5000,
slidesToShow:7,
autoplay:true,
autoplaySpeed:10,
centerMode: true,
variableWidth: true,
responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 1
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});
var menuBtn= document.getElementById('menu-btn');
var header = document.getElementsByTagName('header')[0];
var body = document.getElementsByTagName('body')[0];
menuBtn.addEventListener("click", function(){
    menuBtn.classList.toggle("active");
    header.classList.toggle("active");
    body.classList.toggle("bodyActive");
});

// 
const aboutSection = document.querySelector('.about-section');
const containerFluid = document.querySelector('.container-fluid');

aboutSection.addEventListener('mousemove', (e) => {
    const rect = aboutSection.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    containerFluid.style.setProperty('--x', `${xPercent}%`);
    containerFluid.style.setProperty('--y', `${yPercent}%`);
});
