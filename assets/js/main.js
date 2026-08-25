/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("navMenu"),
  navToggle = document.getElementById("navToggle"),
  navClose = document.getElementById("navClose");

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("showMenu");
  });
}

/*===== MENU HIDDEN =====*/

/* Validate if constant exists */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("showMenu");
  });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll(".navLink");

const linkAction = () => {
  const navMenu = document.getElementById("navMenu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("showMenu");
};
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/

const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionsClass = document.querySelector(
        ".navMenu a[href*=" + sectionId + "]"
      );

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      sectionsClass.classList.add("activeLink");
    } else {
      sectionsClass.classList.remove("activeLink");
    }
  });
};
window.addEventListener("scroll", scrollActive);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const scrollUp = document.getElementById("scrollUp");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
  this.scrollY >= 350
    ? scrollUp.classList.add("showScroll")
    : scrollUp.classList.remove("showScroll");
};
window.addEventListener("scroll", scrollUp);
/*=============== DARK / LIGHT / AUTO THEME ===============*/
const themeButton = document.getElementById("themeButton");
const darkTheme = "dark-theme";
// The cycle order the button walks through on each click
const themeModes = ["auto", "light", "dark"];
const themeIcons = {
  auto: "ri-macbook-line",
  light: "ri-sun-line",
  dark: "ri-moon-line",
};
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// Previously selected mode (if the user chose one); anything else falls back to auto
const storedTheme = localStorage.getItem("selected-theme");
let themeMode = themeModes.includes(storedTheme) ? storedTheme : "auto";

// In auto we follow the OS setting, otherwise the chosen mode wins
const applyTheme = () => {
  const isDark =
    themeMode === "dark" || (themeMode === "auto" && systemDark.matches);
  document.body.classList.toggle(darkTheme, isDark);

  Object.values(themeIcons).forEach((icon) =>
    themeButton.classList.remove(icon)
  );
  themeButton.classList.add(themeIcons[themeMode]);
  themeButton.title = `Theme: ${themeMode}`;
};

applyTheme();

// Follow the OS while the user is on auto
systemDark.addEventListener("change", () => {
  if (themeMode === "auto") applyTheme();
});

// Cycle auto -> light -> dark on every click and remember the choice
themeButton.addEventListener("click", () => {
  themeMode = themeModes[(themeModes.indexOf(themeMode) + 1) % themeModes.length];
  localStorage.setItem("selected-theme", themeMode);
  applyTheme();
});

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("backgroundHeader")
    : header.classList.remove("backgroundHeader");
};
window.addEventListener("scroll", scrollHeader);

/*=============== SCROLL REVEAL ANIMATION ===============*/
const scrollReveal = ScrollReveal({
  origin: "top",
  distance: "40px",
  duration: 1000,
  delay: 150,
  easing: "cubic-bezier(0.5, 0, 0, 1)",
  reset: false,
});
scrollReveal.reveal(`.homeData,.projectContainer,.footerContainer`);
scrollReveal.reveal(`.homeInfo div`, {
  delay: 400,
  origin: "bottom",
  interval: 100,
});
scrollReveal.reveal(`.skillContent:nth-child(1)`, {
  origin: "left",
});
scrollReveal.reveal(`.skillContent:nth-child(2)`, { origin: "right" });
scrollReveal.reveal(`.qualificationContainer`, {
  interval: 100,
});

// Dynamic year Footer
let year = new Date().getFullYear();
document.getElementById(
  "footerCopy"
).innerHTML = `Developed and maintained by <a href="https://github.com/anubhavlal07" target="_blank">Anubhav Lal</a> <br> &copy; ${year} All Rights Reserved.`;
