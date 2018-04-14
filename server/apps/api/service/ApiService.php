<?php
namespace apps\api\service;

/**
 * API 服务
 *
 * @author  zjh
 * @version 1.0 2018-04-10
 */

class ApiService
{

    public $debug   = false;
    public $error   = '';
    public $errCode = 500;

    //出错代码表(参考或调整http状态码)
    public $code = [
        0   => 'success', // 成功码必须放在数组的首位

        //客户端问题
        400 => 'param error',
        401 => 'not login',
        403 => 'please login',
        404 => 'operator not found',
        405 => 'no allow request method',
        406 => 'error signature',
        450 => 'error timestamp',
        499 => 'unknown error',

        //服务端问题
        500 => 'internal server error',
        503 => 'service unavailable',

        //业务层问题
        999 => 'business level issue', //业务层统一错误码必须放在数组的末尾
    ];

    private static $instance;

    public static function instance()
    {
        if (self::$instance == null) {
            self::$instance = new ApiService();
        }

        return self::$instance;
    }

    /**
     * 接口层的错误返回
     * @param   number  $code  接口层错误码
     * @param   string  $msg   错误信息
     * @return  array         错误返回信息组
     */
    public function apiError($code, $msg = '')
    {
        $msg = (string) $msg;
        if (empty($msg)) {
            return api_result($code, $this->code[$code]); //返回默认设置的信息
        } else {
            return api_result($code, trim($msg)); // 返回自定义的具体信息
        }

    }

    /**
     * 数据签名
     *
     * @param $inputArr
     *
     * @return string
     */
    public function signature($inputArr)
    {
        ksort($inputArr);

        $new_arr = [];
        foreach ($inputArr as $key => $val) {
            $val = htmlspecialchars_decode($val);
            if (is_array($val)) {
                $val = json_encode($val, JSON_UNESCAPED_UNICODE);
            }
            $new_arr[] = "$key=$val";
        }

        $signature = http_build_query($inputArr) . '&secret=' . config('api.apisecret');
        //逗号转义回来
        // $signature = str_replace('%2C',',',$signature);
        $this->log('签名:', $signature,'api_log');

        return md5($signature);
    }

    /**
     * 校验签名
     *
     * @param $metaData
     * @param $signature
     *
     * @return bool
     */
    public function validSignature($metaData, $signature)
    {
        if(!config('api.validate')){   // 跳过验证
            return true;
        }

        if (empty($signature)) {
            return false;
        }

        if (isset($metaData['file_data'])) {
            unset($metaData['file_data']);
        }

        $newSignature = $this->signature($metaData);
        $this->log('server signature', $newSignature,'api_log');

        return $signature == $newSignature;
    }

    /**
     * 验证时间戳
     *
     * @param $timestamp
     *
     * @return bool
     */
    public function validTimestamp($timestamp)
    {
        if(!config('api.validate')){   // 跳过验证
            return true;
        }
        $this->log('server time', time(),'api_log');
        $this->log('client time', $timestamp,'api_log');
        $this->log('time_diff', abs(time() - $timestamp),'api_log');
        if (empty($timestamp)) {
            return false;
        }

        return abs(time() - $timestamp) < config('api.timeGap');
    }

    /**
     * 记录日志
     *
     * @param $key
     * @param $value 可以为字符串，也可以为数组
     * @param $filename 文件名称，可以不输，默认为资源名称
     * @param $suffix 文件后缀名，默认为txt
     */
    public function log($key, $value = '',$filename = '', $suffix = 'txt')
    {
        if (!$this->debug) {
            return;
        }

        //zjh 目录不存在则先创建目录
        $month = date("Ym");
        $date = date('_Y_m_d');

        //如果文件名为空，则取当前服务的资源的类名作为目录名和文件名
        if(empty($filename)){
            $array     = explode('\\', get_class($this));  // 获取当前类名
            $resources = array_pop($array);

            $dirFile = preg_replace("/([A-Z])/", "_\\1", $resources);
            $dirFile = strtolower($dirFile);
            $dirFile = ltrim($dirFile,'_');

            if(strrpos($dirFile, '_service') === strlen($dirFile) - 8){
                $dirFile = substr($dirFile,0,strrpos($dirFile, '_service'));
            }

        }else{
            $dirFile = strtolower($filename);
        }

        if(!is_dir(ROOT_PATH.'/public/logs/'.$month.'/'.$dirFile)){
            api_mkdir(ROOT_PATH.'/public/logs/'.$month.'/'.$dirFile);
        }

        // 完整文件名
        $fullFilename = ROOT_PATH.'/public/logs/'.$month.'/'.$dirFile.'/'.$dirFile.$date.'.'.$suffix;

        if (!file_exists($fullFilename)) {
            file_put_contents($fullFilename, '');
            chmod($fullFilename, 0777);
        }

        $value = is_array($value) ? print_r($value, true) : $value;

        $text = "【" . date('Y-m-d H:i:s') . "】 ";
        $text .= " $key = $value  \r\n";

        file_put_contents($fullFilename, $text, FILE_APPEND);
    }


    /**
     * 删除过期的日志（配置文件内可设置日志的生命周期）
     * @return  [type]  [description]
     */
    public function rmlog()
    {
        $day = date("d");  
        //为了接口的效率，只在月初的1号去判断一下是否有过期日志并删除
        if($day != 1){ 
            return;
        }

        $life = (int)config('api.loglife');
        $life = abs($life);
        $dir = ROOT_PATH.'/public/logs';

        $arr = scandir($dir);  
        $all = count($arr)-3;//所有文件总数除./和../和index.htm
        if($all <= $life){   //简单判断，日志都在生命周期内，则不用再做删减操作
            return;
        }

        $month = date("Ym");
        $date = date_create($month);
        date_modify($date,"-".$life."month");
        // 过期的月份
        $expiredMonth = date_format($date,"Ym");
        
        if (is_dir($dir)) {
            $d = @dir($dir);
            if ($d) {
                while (false !== ($entry = $d->read())) {
                    if ($entry != '.' && $entry != '..' && $entry <= $expiredMonth) {
                        $entry = $dir . '/' . $entry;
                        if (is_dir($entry)) {
                            api_rmdir($entry);
                        }
                    }
                }
                $d->close();
            }
        }

    }


}
