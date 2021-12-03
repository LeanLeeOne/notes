const HEADER =
  "<a href='https://github.com/LeanLeeOne/notes' target='_blank' rel='noopener noreferrer' class='git-hub-link'>" +
  "Github" +
  "<svg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' focusable='false' x='0px' y='0px' viewBox='0 0 100 100' width='15' height='15' class='icon outbound'><path fill='currentColor' d='M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z'></path> <polygon fill='currentColor' points='45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9'></polygon></svg>" +
  "</a>";
const FOOTER =
  "<div class='footer'>" +
  "<a class='beian' href='https://beian.miit.gov.cn/' target='_blank'>鲁ICP备18052178号</a>" +
  "<span class='copyright'>@2021</span>" +
  "<a href='http://leanlee.top/resume/' class='resume' rel='noopener'>" +
  "By 李晓辉" +
  "</a>" +
  "</div>";

$(() => {
  let className = $(document.documentElement).attr("class");
  appendTitle(className);
  avoidFlashing(className);
  appendElement(HEADER);
  appendElement(FOOTER);
});

// 补充标题前缀
function appendTitle(className) {
  if (!className || className === "index_second") {
    document.title = "笔记 | " + document.title;
  }
}

function avoidFlashing(className) {
  // 返回时还是会执行动画
  if (true) {
    return;
  }

  if (className.indexOf("index_first") > -1) {
    setTimeout(() => {
      $(document.documentElement).css("animation", "none");
    }, 3100);
  }
  if (className.indexOf("index_second") > -1) {
    setTimeout(() => {
      $(document.documentElement).css("animation", "none");
    }, 6100);
  }

  window.onbeforeunload = function () {
    $(document.documentElement).css("animation", "none");
    $(document.documentElement).css("animation", "none");
  };
}

function appendElement(element){
  let body = $(document.body);
  body.append(element);
}
