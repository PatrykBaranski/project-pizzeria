import { select, templates } from "../settings.js";

class Home {
  constructor() {
    const thisHome = this;
    thisHome.getElements();
    thisHome.initCarousel();
  }

  getElements() {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.carousel = document.querySelector(select.home.carousel);
    thisHome.dom.carouselCells = document.querySelectorAll(
      select.home.carouselCell
    );
    thisHome.dom.carouselBtnsContainer = document.querySelector(
      select.home.btnsContainer
    );
  }

  initCarousel() {
    const thisHome = this;
    const { carouselCells, carouselBtnsContainer } = thisHome.dom;
    const activePage = document.querySelector(".carousel-cell.active");

    carouselCells.forEach((elem, i) => {
      elem.style.transform = `translateX(${i * 100}%)`;
      elem.dataset.index = i;
      carouselBtnsContainer.innerHTML += templates.carouselBtn({ index: i });
    });

    const carouselBtns = document.querySelectorAll(".carousel-button");

    carouselBtns.forEach((btn) => {
      if (btn.dataset.index === activePage.dataset.index)
        btn.classList.add("active");
    });

    carouselBtnsContainer.addEventListener("click", (e) => {
      if (!e.target.classList.contains("carousel-button")) return;

      const clickedBtn = e.target;
      const buttonIndex = clickedBtn.dataset.index;

      carouselCells.forEach((elem, i) => {
        // if (elem.dataset.index === buttonIndex) elem.classList.add("active");
        elem.style.transform = `translateX(${(i - buttonIndex) * 100}%)`;
      });

      carouselBtns.forEach((btn) => btn.classList.remove("active"));
      clickedBtn.classList.add("active");
    });
  }
}
export default Home;
