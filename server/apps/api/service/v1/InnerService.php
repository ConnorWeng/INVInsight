<?php
namespace apps\api\service\v;

/**
 * 当前版本内的 API 服务
 *
 * @author  zjh
 * @version 1.0 2018-04-09
 */

use apps\api\service\ApiService;
use think\Db;
use think\Exception;
use think\exception\HttpException;
use think\Log;

define('PARAM_REQUIRED', 'required');
define('PARAM_DIGIT', 'digit');
define('PARAM_POSITIVE', 'positive');

class InnerService extends ApiService
{

    public $params             = [];
    public $defaultParams      = [];
    public $defaultResponse    = [];
    public $allowRequestMethod = [];
    public $bCodes             = []; // 业务层错误码列表

    public $userId = '';

    private static $instance;

    public static function instance()
    {
        if (self::$instance == null) {
            self::$instance = new InnerService();
        }

        return self::$instance;
    }

    /**
     * 检查 请求方式是否允许
     *
     * @param array $allowRequestMethod
     *
     * @return bool
     */
    private function checkRequestMethod()
    {
        if(!config('api.validate')){   // 跳过验证
            return true;
        }

        $requestMethod = strtolower(request()->method());

        $this->log("method",$requestMethod);
        
        if (empty($this->allowRequestMethod)) {
            return false;
        }

        return isset($this->allowRequestMethod[$requestMethod]);
    }

    /**
     * 验证全部参数
     *
     * @return bool
     */
    public function validParams()
    {
        if(!config('api.validate')){   // 跳过验证
            return true;
        }

        $method = strtolower(request()->method());
        if(empty($this->defaultParams[$method])){
            return true;
        }
        foreach ($this->defaultParams[$method] as $key => $defined) {
            //如果是非必填参数 则赋值为 默认值,以避免程序错误
            if (!isset($defined[2])) {
                //检查是否填写必填参数
                if (!isset($this->params[$key])) {
                    if (isset($defined[1])) {
                        $this->params[$key] = $defined[1];
                    } else {
                        $this->error = "请填写 $key ";

                        return false;
                    }
                }
                continue;
            }

            //如果未定义验证规则 继续下一个变量
            if ($defined[2] == 'file') {
                continue;
            }

            //检查是否填写必填参数
            if (!isset($this->params[$key])) {
                if (isset($defined[1])) {
                    $this->params[$key] = $defined[1];
                } else {
                    $this->error = "请填写 $key ";

                    return false;
                }
            }
            $value = trim($this->params[$key]);
            $rule  = $defined[2];

            if (is_array($rule)) {
                if (!isset($rule[$value])) {
                    $this->error = "请填写正确的 $key ";

                    return false;
                }
            } else {
                switch ($rule) {
                    case PARAM_REQUIRED:
                        //判断必填
                        if ($value === '' && empty($value)) {
                            $this->error = "请填写 $key ";

                            return false;
                        }
                        if ($key == 'merId') {
                            $this->merId = $value;
                        }
                        break;
                    case PARAM_DIGIT:
                        //判断是数字
                        if (!is_numeric($value)) {
                            $this->error = " $key 不是是数字";

                            return false;
                        }
                        break;
                    case PARAM_POSITIVE:
                        //判断是否是正数
                        if (!is_numeric($value) || $value
                            <= 0) {
                            $this->
                                error = " $key 必须大于0";

                            return false;
                        }
                        break;
                }
            }
        }

        return true;
    }

    /**
     * 验证用户
     *
     * @return mixed
     */
    public function validToken()
    {
        if(!config('api.validate')){   // 跳过验证
            return true;
        }

        $this->userId = '';

        if (!isset($this->params['token']) || empty($this->params['token'])) {
            //参数错误
            $this->error   = '请填写token';
            $this->errCode = 400;

            return false;
        } else {

            // 查找用户登录信息表，token是否有对应的登录信息
            $MemberData = 0; //一会修改 zjh

            if (empty($MemberData)) {
                //数据未找到
                $this->error   = '认证失败';
                $this->errCode = 403;

                return false;
            }

            $this->userId = $MemberData['user_id'];

            return true;
        }
    }


    /**
     * 格式化数据
     *
     * @param $data
     * @param $defaultResponse
     *
     * @return array
     */
    public function formatData($data, $defaultResponse = [])
    {
        if (empty($data)) {
            return [];
        }

        if (empty($defaultResponse)) {
            $method          = strtolower(request()->method());
            if(empty($this->defaultResponse[$method])){
                return $data;
            }
            $defaultResponse = $this->defaultResponse[$method];
        }

        if (empty($defaultResponse)) {
            return $data;
        }

        $newData = [];
        if (isset($data[0])) {
            foreach ($data as $item) {
                $newData[] = $this->formatDataForRow($defaultResponse, $item);
            }
        } else {
            $newData = $this->formatDataForRow($defaultResponse, $data);
        }

        return $newData;
    }

    /**
     * 格式化一行数据
     *
     * @param $defaultResponse
     * @param $data
     *
     * @return array
     */
    private function formatDataForRow($defaultResponse, $data)
    {
        $newData = [];
        foreach ($defaultResponse as $key => $defined) {
            if (isset($data[$key]) && is_array($data[$key])) {
                foreach ($data[$key] as $k => $row) {
                    $newData[$key][$k] = $this->formatDataForRow($defined, $row);
                }
            } else {
                if (is_array($defined) && isset($defined[1]) && method_exists($this, $defined[1])) {
                    $formatter     = $defined[1];
                    $value         = isset($data[$key]) ? $data[$key] : '';
                    $newData[$key] = $this->$formatter($value, $data);
                } else {
                    $newData[$key] = isset($data[$key]) ? $data[$key] : '';
                }
            }
        }

        return $newData;
    }

    //格式化 图标
    public function formatIcon($value, $row = [])
    {
        if (filter_var($value, FILTER_VALIDATE_URL, FILTER_FLAG_SCHEME_REQUIRED)) {
            return $value;
        }

        return full_img_uri($value);
    }

    //格式化 手机号
    public function formatPhone($value, $row = [])
    {
        return substr_replace($value, '****', 3, 4);
    }

    //格式化时间戳
    public function formatTime($value, $row = [])
    {
        if(!empty($value)){
             return date("Y-m-d H:i:s",$value);
        }else{
            return date("Y-m-d H:i:s",0);
        }
       
    }


    /**
     * 成功返回
     * @param   array   $data  返回的数据
     * @param   string  $msg   定制成功的提示信息
     * @return  array         成功返回的信息组
     */
    public function success($data=[],$msg='')
    {
    
        reset($this->code);   // 指针指向错误码表的第一个值

        $code = key($this->code);
        $msg = (string)$msg;
        if(empty($msg)){
            $msg = $this->code[$code];
            $msg = empty($msg)?'success':$msg;
        }

        // 格式化数据
        $data = $this->formatData($data);

        return api_result($code,trim($msg),$data);     
    }


    /**
     * 定制业务层错误返回码
     * 错误码的设置请到同目录级下的 ErrorCode.php 文件里定义
     * 如：输入 1001 ，则函数返回 user.users.id.1001
     * @param   number  $code  自定义码值
     * @return  array         返回定制后的返回码 以及 对应的错误信息
     */
    public function bcode($code)
    {
        if (!isset($code)) {
            $code = 0;
        }
        $array     = explode('\\', get_class($this));
        $resources = array_pop($array);
        $service   = array_pop($array);

        $prefix = preg_replace("/([A-Z])/", "_\\1", $resources);
        $prefix = $service.'.'.ltrim($prefix,'_');
        $prefix = strtolower($prefix);

        if(strrpos($prefix, '_service') === strlen($prefix) - 8){
            $prefix = substr($prefix,0,strrpos($prefix, '_service'));
        }

        if(strrpos($prefix, '_id') === strlen($prefix) - 3){
            $prefix = substr($prefix,0,strrpos($prefix, '_id'));
            $prefix .= '.id';
        }

        try {

            $msg = $this->bCodes[$prefix][$code];

        } catch (\Exception $e) {

            throw new Exception('[' . $prefix . '.' . $code . '] 该业务层错误码没有被定义，请检查');
        }

        return [
            'subcode' => $prefix . '.' . $code,
            'msg'     => $msg,
        ];
    }

    /**
     * 业务层错误返回
     * @param   number  $bcode  业务层错误码  (在文件ErrorCode.php内定制)
     * @return  array          返回错误信息组
     */
    public function bError($bcode)
    {
        end($this->code); // 指针指向错误码表的最后一个值

        $code = key($this->code);

        $msg = $this->code[$code];
        $msg = empty($msg) ? 'business level issue' : $msg;

        $bcode = (int) $bcode;
        $issue = $this->bcode($bcode);

        return api_result($code, trim($msg), [], $issue);
    }


    /**
     * 接口响应函数
     * @return  array  返回信息
     */
    public function response()
    {

        //检查请求方式
        if (!$this->checkRequestMethod()) {
            return $this->apiError(405);
        }

        // 校验参数
        if (!$this->validParams()) {
            return $this->apiError(400, $this->error);
        }

        //检验token
        if (!$this->validToken()) {
            return $this->apiError($this->errCode, $this->error);
        }

        if(!config('api.validate')){   // 跳过验证,则将入参都输出
            print_r($this->params);
        }

        //处理业务
        switch (request()->method()) {
            case 'GET':
                return empty( $this->get() ) ? $this->apiError(503,'get service unavailable') : $this->get() ;
            case 'POST':
                return empty( $this->post() ) ? $this->apiError(503,'post service unavailable') : $this->post() ;
            case 'PUT':
                return empty( $this->put() ) ? $this->apiError(503,'put service unavailable') : $this->put() ;
            case 'DELETE':
                return empty( $this->delete() ) ? $this->apiError(503,'delete service unavailable') : $this->delete() ;
            case 'PATCH':
                return empty( $this->patch() ) ? $this->apiError(503,'patch service unavailable') : $this->patch() ;
            default:
                return $this->apiError(405);
        }
    }


    /**
     * get 的响应方法
     *
     * @return array
     */
    public function get()
    {
        return $this->apiError(503,'get service unavailable');
    }
    /**
     * post 的响应方法
     *
     * @return array
     */
    public function post()
    {
        return $this->apiError(503,'post service unavailable');
    }
    /**
     * put 的响应方法
     *
     * @return array
     */
    public function put()
    {
        return $this->apiError(503,'put service unavailable');
    }
    /**
     * delete 的响应方法
     *
     * @return array
     */
    public function delete()
    {
        return $this->apiError(503,'delete service unavailable');
    }
    /**
     * patch 的响应方法
     *
     * @return array
     */
    public function patch()
    {
        return $this->apiError(503,'patch service unavailable');
    }


    /**
     * 记录接口调用信息
     * @param   array  $param  接口相关参数
     * @return  [type]          [description]
     */
    public function logStat($param)
    {
        $data = [
            'device'            => $param['device'],
            'device_os_version' => $param['deviceOsVersion'],
            'app_version'       => $param['appVersion'],
            'api_version'       => $param['apiVersion'],
            'uri'               => request()->url(true),
            'ip'                => request()->ip(0, true),
        ];

        $exist = Db::query('show tables like "sys_api_log"');
        if($exist){
            db('sys_api_log')->insert($data);
        }
    }
    

}
