# INVInsight
INVInsight makes things easy.

++ 相关目录说明
	++ client   -- 小程序前台目录
	++ server   -- 小程序后台目录，采用php代码，使用 thinkphp 5.0 框架

++ 通过 git 下载代码后，请进入server目录，使用composer下载相关的依赖
	++ 请先自行安装 composer 
	++ php composer.phar install  -- 安装依赖
	++ php composer.phar update   -- 更新依赖

++ 文件 project.config.json 为项目的配置文件，可能会因个人配置的不同而产生变动，建议下载代码后对该文件取消git跟踪
	++ 取消跟踪方式：进入当前目录，打开git的命令窗口并输入 git update-index --assume-unchanged project.config.json

++ 搭建本地测试环境
	++ 搭建http服务器，根目录请配置为 server/public
	++ 请到腾讯官方下载 小程序开发工具 ，然后 新建项目-》 项目的目录选择为当前代码所在目录-》确定 ，即可在本地创建小程序相关项目
	++ 在线真机测试，请点击工具右上角的上传按钮上传前台代码，点击 腾讯云 选择 “上传测试代码” 上传后台代码

++ 在线测试采用腾讯免费提供的腾讯云服务器开发环境
	++ 因该开发环境的域名并非已配置的合法域名，所以使用该环境做小程序的真机测试时，需打开调试模式并重启小程序，即可略过域名的检测而直接通信。（调试打开方式：点击手机上小程序右上角的 “横三点”按钮，找到 打开调试 选项，点击打开）