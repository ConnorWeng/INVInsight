<?php
namespace apps\api\controller;

/**
 * 接口响应函数
 *
 * @author  zjh
 * @date 2018-04-02
 */

use apps\api\service\ApiService;

class Index
{
    public $api = NULL;
  
    public function __construct() {
        $this->api        = ApiService::instance();
        $this->api->debug = true;
        $this->api->log("--------------------- begin","begin ---------------------",'api_log');

        //zjh 动态实现二级配置覆盖一级配置中的同名配置
        //这样即可实现直接通过修改 apps/extra/config.php 文件的配置来调整主配置，无需直接修改 apps/config.php 的配置
        $config = config('config');
        foreach ($config as $key => $value) {
            config($key,$value);
        }
    }

    public function index($version , $service , $resources , $id = null)
    {
        //取 http 头
        $header = [
          'timestamp'       => request()->header( 'timestamp' ) ,
          'signature'       => request()->header( 'signature' ) ,
          'device'          => request()->header( 'device' ) ,
          'deviceOsVersion' => request()->header( 'device-os-version' ) ,
          'appVersion'      => request()->header( 'app-version' ) ,
          'apiVersion'      => $version ,
        ];

        //取api
        $api = $this->api;

        // 记录日志：头部信息
        $api->log('header',request()->header(),'api_log');   
        $api->log( 'headerData' ,$header ,'api_log' );
        $api->log( 'request ' , request()->method() ,'api_log');

        // 检查时间戳
        if ( ! $api->validTimestamp( $header['timestamp'] ) ) {
          exit( json( $api->apiError( 450 ) )->send() );
        }

        // 取参数
        $params = input( strtolower( request()->method() ) . '.' );

        // 记录日志：参数
        $api->log( 'params' , $params ,'api_log');

        //取时间戳
        $params['timestamp'] = $header['timestamp'];

        //填入指定资源 zjh
        if(isset($id)){
            $params[$resources] = $id;
        }
        
        //检查签名
        if ( ! $api->validSignature( $params , $header['signature'] ) ) {
          exit( json( $api->apiError( 406 ) )->send() );
        }

        //合并参数
        $params = array_merge( $params , $header );

        //记录日志：合并后的参数
        $api->log( 'merge_params' , $params ,'api_log');

        // 参数错误
        if ( ! is_array( $params ) || empty( $params ) ) {
          exit( json( $api->apiError( 400 ) )->send() );
        }

        $result = $this->response( $version , $service , $resources , $params ,$id);
        
        //删除过期日志
        $api->rmlog();

        return json( $result );

    }

    /**
   * 响应辅助函数
   *
   * @param $version
   * @param $directory
   * @param $action
   * @param $params
   *
   * @return array
   */
    private function response( $version , $service , $resources , $params ,$id) {

        //资源名称，下划线转驼峰
        $array = explode('_', $resources);  
        $result = '';  
        foreach($array as $value){  
            $result.= ucfirst($value);  
        } 
        $resources  = $result; 


        $version = strtolower( $version );

        // zjh 查询时指定了资源
        if(isset($id)){
            $resources  .= 'Id';
        }

        $subVer = substr($version, 1);
        // zjh 只针对由v开头形成的版本的服务
        if(stripos($version,'v') === 0 &&  is_numeric($subVer)){

            // zjh 注册自动加载函数，实现只载入当前使用的版本，不载入其他版本，避免类名冲突
            spl_autoload_register(function ($className) use($version)
            {
                if(isset($version)){
                    $className = str_replace("\\v\\","\\".$version."\\",$className);
                }

                include ROOT_PATH."/{$className}.php";

            }, true, false);

            $class   = '\\apps\\api\\service\\' . 'v' . '\\' . $service . '\\' . $resources . 'Service';
        }else{

            $class   = '\\apps\\api\\service\\' . $version . '\\' . $service . '\\' . $resources . 'Service';
        }

        //记录日志：服务的资源文件
        $this->api->log( 'service file' , $class ,'api_log');

        //检查是否存在响应文件
        if ( ! class_exists( $class ) ) {
          return $this->api->apiError( 404 );
        }

        //初始化响应类
        $instance = $class::instance( $params );
        
        return $instance->response();
    }
  
}
