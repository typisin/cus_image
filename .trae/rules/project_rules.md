用英文生成所有页面中的描述和文字信息

添加Development本地变量规则：使用Vercel CLI添加环境变量

始终使用本地的Vercel环境来运行和检查项目，不要用python，保持跟vercel线上环境在变量和路由配置的一致性

全站注入 adsense
    - 在每个页面的 <head> 中仅加载一次以下脚本： <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2211656389763853" crossorigin="anonymous"></script>
    - 禁止重复注入或动态二次插入