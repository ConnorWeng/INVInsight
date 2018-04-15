<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

/**
 *
 * zjh 腾讯云测试服务器没法手动设置根目录为public，为了测试，故在当前目录下加上文件 .htaccess 以及 index.php
 * zjh 部署正式服务器时，安全起见，可将当前目录下的 .htaccess 和 index.php 删除，根目录设置为public
 * 另外，测试服务器用的http解析服务器为nginx，并且不支持path_info，所以暂时使用 $_SERVER['PATH_INFO'] = $_SERVER['REQUEST_URI']; 来替代path_info
**/

// [ 应用入口文件 ]
if (!isset($_SERVER['PATH_INFO'])) {
        $_SERVER['PATH_INFO'] = $_SERVER['REQUEST_URI'];
    }
// 定义应用目录
define('APP_PATH', __DIR__ . '/apps/');
// zjh 重新定义app的命名空间
define('APP_NAMESPACE', 'apps');
// 加载框架引导文件
require __DIR__ . '/thinkphp/start.php';
