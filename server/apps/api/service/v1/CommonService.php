<?php
// +----------------------------------------------------------------------
// | api服务的公共代码
// +----------------------------------------------------------------------
// | 包含一些可复用的多表联合查询类代码 以及 与model关联的校验性代码
// | 单表查询类和简单关联类的代码请放置到 apps/mommon/model 的对应表内
// +----------------------------------------------------------------------
// | Author: zjh
// +----------------------------------------------------------------------
// | Date：2018-04-09 
// +----------------------------------------------------------------------

namespace apps\api\service\v;

/**
 * 当前服务模块的公共代码
 *
 * @author  zjh
 * @version 1.0 2018-04-09
 */

use apps\api\service\v\InnerService;

class CommonService extends InnerService {

	private static $instance;

	public static function instance() {
		if ( self::$instance == NULL ) {
			self::$instance = new CommonService();
		}

		return self::$instance;
	}

}