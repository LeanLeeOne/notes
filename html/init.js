$(()=>{
  let className = $(document.documentElement).attr("class");
  if(!className){
    console.log("not index page");
  }

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
});