$(() => {
  let className = $(document.documentElement).attr("class");
  appendTitle(className);
  avoidFlashing(className);
  appendFooter();
});

function appendTitle(className) {
  // not index page
  if (!className) {
    document.title = "笔记 | " + document.title;
  }
}

function avoidFlashing(className) {
  // 返回时还是会执行动画
  if(true){return};

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

function appendFooter() {
  let body = $(document.body);
  body.append("\n" +
    "    <div class=\"footer\">\n" +
    "      <a class=\"beian\" href=\"https://beian.miit.gov.cn/\" target=\"_blank\">鲁ICP备18052178号</a>\n" +
    "      <span class=\"copyright\">@2021</span>\n" +
    "      <a href=\"http://leanlee.top/resume/\"\n" +
    "         class=\"resume\"\n" +
    "         rel=\"noopener\">\n" +
    "        By 李晓辉\n" +
    "      </a>\n" +
    "    </div>")
}