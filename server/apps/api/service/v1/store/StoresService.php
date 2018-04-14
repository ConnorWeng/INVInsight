<?php
namespace apps\api\service\v\store;

/**
 * 店铺信息
 *
 * @author  zjh
 * @version 1.0 2018-04-09
 */

use apps\api\service\v\InnerService;
use apps\common\model\InvStore;

class StoresService extends InnerService
{

    /**
     * 允许的请求方式
     * 可以为：get、post、put、delete、patch
     */
    public $allowRequestMethod = [
        'get' => 'GET - 取得店铺信息集合',
    ];

    /**
     * 传参 如:
     * "title" => ['标题' , '默认值' ]
     * "title" => ['标题' , '默认值' ,"是否必要或类型约束"]
     * "status" => ['状态' , 1 , ["0" => '禁用' , 1 => '启用'] ]     // 固定数值约束，该变量只有 0 和 1 两个值
     */
    public $defaultParams = [
        'get' => [

        ],
    ];

    /**
     * 返回结果示例 如:
     *
     * 'user_id'     => '用户ID',
     * "gender"      => [ "性别", "formatGender" ] ,    // formatGender 为一个格式化函数，代表需要将该值进行一定的格式化
     * 既适用于单个数组，也适用于数组列表中的每一个数组元素
     */
    public $defaultResponse = [
        'get' => [

            'store_id'  => "店铺id",
            'store_name' => '档口名称',
            'owner_name' =>'档主姓名',
            'store_logo' => '档口logo',
            'description' => '档口描述',
            'region' => '档口所在区域',
            'address' => '档口具体地址',
            'zipcode' => '邮编',
            'tel' => '电话',
            'phone' => '移动电话',
            'im_ww' => '旺旺号',
            'im_wx' => '微信号',
            'add_time' => ['开店时间',"formatTime"],
            'end_time' => ['闭店时间','formatTime'],
            "uri"        => ["当前uri", "formatUri"],
        ],
    ];

    private static $instance;

    public static function instance($params = [])
    {
        if (self::$instance == null) {
            self::$instance         = new StoresService();
            self::$instance->params = $params;
            self::$instance->bCodes = require_once __DIR__."/ErrorCode.php";
            self::$instance->debug  = true;    // 开启调试模式，包括日志的输出
        }

        return self::$instance;
    }

    /**
     * 接口响应方法
     */
    public function response()
    { 
        //业务日志记录开始
        $this->log("--------------------- begin","begin -----------------");
        
        //记录接口调用信息
        $this->logStat( $this->params );

        return parent::response();
    }



/*-----------------------------------------------------------------------------------------------------------*/
//                                         业务处理模块
/*-----------------------------------------------------------------------------------------------------------*/
//      业务处理入口函数分别可以有： get() , post() , put() , delete() , patch()
/*-----------------------------------------------------------------------------------------------------------*/
//      信息返回函数： $this->bError($bcode) 《返回错误信息》 , $this->success($data [,$msg] ) 《返回正确信息》
//      错误码 $bcode 的设置请移步到同目录下的 ErrorCode.php 文件内设置
/*-----------------------------------------------------------------------------------------------------------*/
//      函数 $this->success($data [,$msg]) 会自行根据 $this->defaultResponse 的设置在输出前格式化数据
//      属性 $this->defaultResponse 为空时，直接输出数据，不进行格式化
/*-----------------------------------------------------------------------------------------------------------*/
//      上面的属性 $this->allowRequestMethod 用于控制允许的请求方法
//      上面的属性 $this->defaultParams 用于控制接口入参的类型和必要性
/*-----------------------------------------------------------------------------------------------------------*/
//      记录日志：log($key,$value [,$filename]);   $value可以为数组；  
//      $filename 一般不需要，默认文件名为当前类名(需要做一些处理)  如：UsersIdService (类名) ==> users_id (文件名)  
/*-----------------------------------------------------------------------------------------------------------*/


    /**
     * [get 业务处理入口]
     * @return  Array  处理结果
     */ 
    public function get()
    {
        $limit = 10;
        $list = InvStore::all(function ($query) use($limit){
            $query->order('store_id desc')
                  ->limit($limit);
        });
        if($list) {
            return $this->success($list);
        }else{
            return $this->bError(1000);
        }
        
    }


    /**
     * [post 业务处理入口]
     * @return  Array  处理结果
     */ 
    public function post()
    {

    }





/*---------------------------------------------------------------------------------------------------------*/

    /**
     * 格式化资源路径
     * @param   [type]  $value  [description]
     * @param   array   $row    [description]
     * @return  [type]          [description]
     */     
    public function formatUri($value, $row = [])
    {
        $v = $this->params['apiVersion'];
        return base_uri() . 'api/' . $v . '/store/stores/' . $row['store_id'];
    }

}
