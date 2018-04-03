<?php
namespace apps\api\controller;

/**
 * 接口响应函数
 *
 * @author  zjh
 * @date 2018-04-02
 */

use apps\api\Api;

class Index
{
    public $api = NULL;
  
    public function __construct() {
        $this->api        = Api::instance();
        $this->api->debug = FALSE;
    }

    public function index($version , $directory , $action = 'index')
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

        //记录header
        $api->log('header',request()->header());
        $api->log( 'headerData' ,$header );

        // 检查时间戳
        if ( ! $api->validTimestamp( $header['timestamp'] ) ) {
          exit( json( $api->getError( 405 ) )->send() );
        }


        $api->log( 'request ' , request()->method() );
    }
}
