$(".skillSlider").slick({
  dots: false,
  infinite: true,
  speed: 5000,
  touchMove: false, // Disable touch move
  swipe: false, // Disable swipe
  slidesToShow: 2,
  autoplay: true,
  autoplaySpeed: 5,
  centerMode: true,
  variableWidth: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 1,
      },
    },
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ],
});
var menuBtn = document.getElementById("menu-btn");
var header = document.getElementsByTagName("header")[0];
var body = document.getElementsByTagName("body")[0];
menuBtn.addEventListener("click", function () {
  menuBtn.classList.toggle("active");
  header.classList.toggle("active");
  body.classList.toggle("bodyActive");
});

//
const aboutSection = document.querySelector(".about-section");
const containerFluid = document.querySelector(".container-fluid");

aboutSection.addEventListener("mousemove", (e) => {
  const rect = aboutSection.getBoundingClientRect();
  const x = e.clientX - rect.left; // x position within the element
  const y = e.clientY - rect.top; // y position within the element

  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  containerFluid.style.setProperty("--x", `${xPercent}%`);
  containerFluid.style.setProperty("--y", `${yPercent}%`);
});

//
$(window).scroll(function () {
  if (jQuery("html, body").scrollTop() >= 10) {
    $(".fixed").addClass("scrll");
  } else {
    $(".fixed").removeClass("scrll");
  }
});
$(window).scroll(function () {
  if (jQuery("html, body").scrollTop() >= 10) {
    $(".socialIcons").addClass("scrll");
  } else {
    $(".socialIcons").removeClass("scrll");
  }
});

var scroll = window.requestAnimationFrame || function(callback) {
  window.setTimeout(callback, 1000 / 60);
};

var elementsToShow = document.querySelectorAll('.show-on-scroll');

function loop() {
  elementsToShow.forEach(function(element) {
    if (isElementInViewport(element)) {
      element.classList.add('is-visible');
    } else {
      element.classList.remove('is-visible');
    }
  });
  scroll(loop);
}

function isElementInViewport(element) {
  var rect = element.getBoundingClientRect();
  var viewHeight = window.innerHeight || document.documentElement.clientHeight;

  return (
    (rect.top <= 0 && rect.bottom >= 0) ||
    (rect.bottom >= viewHeight && rect.top <= viewHeight) ||
    (rect.top >= 0 && rect.bottom <= viewHeight)
  );
}

loop();


var animation_char_come_items = document.querySelectorAll(".has_char_anim");
  animation_char_come_items.forEach((t) => {
  var a = 0.05,
  e = 20,
  r = !1,
  o = 1,
  i = 0.5,
  s = "power2.out";
  if (
  (t.getAttribute("data-stagger") && (a = t.getAttribute("data-stagger")),
  t.getAttribute("data-translateX") &&
    (e = t.getAttribute("data-translateX")),
  t.getAttribute("data-translateY") &&
    (r = t.getAttribute("data-translateY")),
  t.getAttribute("data-on-scroll") && (o = t.getAttribute("data-on-scroll")),
  t.getAttribute("data-delay") && (i = t.getAttribute("data-delay")),
  t.getAttribute("data-ease") && (s = t.getAttribute("data-ease")),
  1 == o)
  ) {
  if (e > 0 && !r) {
    let r = new SplitText(t, { type: "chars, words" });
    gsap.from(r.chars, {
      duration: 1,
      delay: i,
      x: e,
      autoAlpha: 0,
      stagger: a,
      ease: s,
      scrollTrigger: { trigger: t, start: "top 85%" },
    });
  }
  if (r > 0 && !e) {
    let e = new SplitText(t, { type: "chars, words" });
    gsap.from(e.chars, {
      duration: 1,
      delay: i,
      y: r,
      autoAlpha: 0,
      ease: s,
      stagger: a,
      scrollTrigger: { trigger: t, start: "top 85%" },
    });
  }
  if (e && r) {
    let o = new SplitText(t, { type: "chars, words" });
    gsap.from(o.chars, {
      duration: 3,
      delay: i,
      y: r,
      x: e,
      autoAlpha: 0,
      ease: s,
      stagger: a,
      scrollTrigger: { trigger: t, start: "top 85%" },
    });
  }
  if (!e && !r) {
    let e = new SplitText(t, { type: "chars, words" });
    gsap.from(e.chars, {
      duration: 1,
      delay: i,
      x: 50,
      autoAlpha: 0,
      stagger: a,
      ease: s,
      scrollTrigger: { trigger: t, start: "top 85%" },
    });
  }
  } else {
  if (e > 0 && !r) {
    let r = new SplitText(t, { type: "chars, words" });
    gsap.from(r.chars, {
      duration: 1,
      delay: i,
      x: e,
      ease: s,
      autoAlpha: 0,
      stagger: a,
    });
  }
  if (r > 0 && !e) {
    let e = new SplitText(t, { type: "chars, words" });
    gsap.from(e.chars, {
      duration: 1,
      delay: i,
      y: r,
      autoAlpha: 0,
      ease: s,
      stagger: a,
    });
  }
  if (e && r) {
    let o = new SplitText(t, { type: "chars, words" });
    gsap.from(o.chars, {
      duration: 1,
      delay: i,
      y: r,
      x: e,
      ease: s,
      autoAlpha: 0,
      stagger: a,
    });
  }
  if (!e && !r) {
    let e = new SplitText(t, { type: "chars, words" });
    gsap.from(e.chars, {
      duration: 1,
      delay: i,
      ease: s,
      x: 50,
      autoAlpha: 0,
      stagger: a,
    });
  }
  }
  });


 const anim_reveal = document.querySelectorAll(".has_text_reveal_anim");
  anim_reveal.forEach((t) => {
  var a = 1.5,
  e = 1,
  r = 0.02,
  o = 0.05;
  t.getAttribute("data-duration") && (a = t.getAttribute("data-duration")),
  t.getAttribute("data-on-scroll") && (e = t.getAttribute("data-on-scroll")),
  t.getAttribute("data-stagger") && (r = t.getAttribute("data-stagger")),
  t.getAttribute("data-delay") && (o = t.getAttribute("data-delay")),
  (t.split = new SplitText(t, {
    type: "lines,words,chars",
    linesClass: "anim-reveal-line",
  })),
  (t.anim =
    1 == e
      ? gsap.from(t.split.chars, {
          scrollTrigger: { trigger: t, start: "top 85%" },
          duration: a,
          delay: o,
          ease: "circ.out",
          y: 80,
          stagger: r,
          opacity: 0,
        })
      : gsap.from(t.split.chars, {
          duration: a,
          delay: o,
          ease: "circ.out",
          y: 80,
          stagger: r,
          opacity: 0,
        }));
  });

let text_animation = gsap.utils.toArray(".has_text_move_anim");
  text_animation.forEach((t) => {
  var a = 0.5;
  t.getAttribute("data-delay") && (a = t.getAttribute("data-delay"));
  const e = gsap.timeline({
    scrollTrigger: {
      trigger: t,
      start: "top 85%",
      duration: 1.5,
      scrub: !1,
      markers: !1,
      toggleActions: "play none none none",
    },
  }),
  r = new SplitText(t, { type: "lines" });
  gsap.set(t, { perspective: 400 }),
  r.split({ type: "lines" }),
  e.from(r.lines, {
    duration: 1,
    delay: a,
    opacity: 0,
    rotationX: -80,
    force3D: !0,
    transformOrigin: "top center -50",
    stagger: 0.1,
  });
  });


  // const slices = [...document.querySelectorAll(".uncover_slice")];
  // const tl = gsap.timeline({ delay: 0 }); // Add a 2-second delay to the timeline

  // tl.addLabel('start')
  //   .to(".uncover_slice", 1, {
  //     height: 0,
  //     ease: 'power4.InOut',
  //     stagger: { amount: 0.33 }
  //   }, 'start')
  //   .to(".myimg", 1.2, {
  //     scale: 1.3,
  //     ease: 'power4.InOut',
  //   }, 'start');

  // // Function to start the animation
  // function startAnimation() {
  //   tl.play();
  // }

  // // Trigger the animation when the window finishes loading
  // window.addEventListener('load', startAnimation);