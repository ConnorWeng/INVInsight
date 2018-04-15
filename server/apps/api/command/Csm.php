<?php
// +----------------------------------------------------------------------
// | cli 模式创建 service 和 model 
// +----------------------------------------------------------------------
// | Author: zjh <temp2016good@163.com>
// +----------------------------------------------------------------------
// | Date: 2018-04-15
// +----------------------------------------------------------------------

namespace apps\api\command;

use think\App;
use think\Config;
use think\console\Command;
use think\console\Input;
use think\console\input\Argument;
use think\console\input\Option;
use think\console\Output;

class Csm extends Command
{
    protected function configure()
    {

    	//设置参数
        // $this->addArgument('uri', Argument::REQUIRED); //必传参数
        // $this->addArgument('model', Argument::REQUIRED); //必传参数
        // $this->addArgument('id', Argument::REQUIRED); //必传参数
        
        $this->addArgument('uri', Argument::OPTIONAL); //可选参数
        $this->addArgument('model', Argument::OPTIONAL); //可选参数
        $this->addArgument('id', Argument::OPTIONAL);//可选参数
        
        //选项定义
        // $this->addOption('message', 'm', Option::VALUE_REQUIRED, 'test'); //选项值必填
        // $this->addOption('status', 's', Option::VALUE_OPTIONAL, 'test'); //选项值选填

        $this->setName('csm')->setDescription('create service and model');
    }

    protected function execute(Input $input, Output $output)
    {
    	$check = $this->checkParams($input,$output);
    	if(!$check){
    		return false;
    	}

        //创建model文件
        $re = $this->buildModel($input,$output);
        if(!$re){
            $output->writeln("<error> Fata : Build Model fail ! </error>\r\n");
            return false;
        }

        // 创建service文件
        $re = $this->buildService($input,$output);
        if(!$re){
            $output->writeln("<error>Fata : Build Service fail !</error>\r\n");
            return false;
        }

        //创建业务层错误码文件
        $re = $this->buildErrorCode($input,$output);
        if(!$re){
            $output->writeln("<error>Fata : Build ErrorCode fail !</error>\r\n");
            return false;
        }

    }


    /*------------------------------------- 创建model文件 ---------------------------------------------*/



    /**
     * 创建model （主程序）
     * @param   Input   $input   [description]
     * @param   Output  $output  [description]
     * @return  [type]           [description]
     */
    protected function buildModel(Input $input, Output $output)
    {
        // 获取参数
        $uri = trim($input->getArgument('uri'));
        $model = ucfirst(trim($input->getArgument('model')));
        $id = trim($input->getArgument('id'));

        $name = trim($model);

        $classname = $this->getModelClassName($name);

        $pathname = $this->getModelPathName($classname);


        if (is_file($pathname)) {
            $output->writeln('<error>' . $name . " Model already exists!</error>\r\n");
            return true;
        }

        if (!is_dir(dirname($pathname))) {
            mkdir(strtolower(dirname($pathname)), 0755, true);
        }

        file_put_contents($pathname, $this->buildModelFile($classname));

        $output->writeln('<info> \^o^/ ' . $name . " Model created successfully. \^o^/ </info>\r\n");

        return true;

    }

    /**
     * 创建modle文件
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function buildModelFile($name)
    {
        $stub = file_get_contents($this->getModelStub());

        $namespace = trim(implode('\\', array_slice(explode('\\', $name), 0, -1)), '\\');

        $class = str_replace($namespace . '\\', '', $name);

        return str_replace(['{%className%}', '{%namespace%}', '{%app_namespace%}'], [
            $class,
            $namespace,
            App::$namespace,
        ], $stub);

    }

    /**
     * 获取model模板
     * @return  [type]  [description]
     */
    protected function getModelStub()
    {
        return __DIR__ . '/stubs/model.stub';
    }

    /**
     * 获取model的类名
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function getModelClassName($name)
    {
        $appNamespace = App::$namespace;

        if (strpos($name, $appNamespace . '\\') === 0) {
            return $name;
        }

        if (Config::get('app_multi_module')) {
            if (strpos($name, '/')) {
                list($module, $name) = explode('/', $name, 2);
            } else {
                $module = 'common';
            }
        } else {
            $module = null;
        }

        if (strpos($name, '/') !== false) {
            $name = str_replace('/', '\\', $name);
        }

        return $this->getModelNamespace($appNamespace, $module) . '\\' . $name;
    }


    /**
     * 获取model的命名空间
     * @param   [type]  $appNamespace  [description]
     * @param   [type]  $module        [description]
     * @return  [type]                 [description]
     */
    protected function getModelNamespace($appNamespace, $module)
    {
        $prefix = $module ? ($appNamespace . '\\' . $module) : $appNamespace;

        return $prefix. '\model';
    }


    /**
     * 获取要创建的model文件路径
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function getModelPathName($name)
    {
        $name = str_replace(App::$namespace . '\\', '', $name);

        return APP_PATH . str_replace('\\', '/', $name) . '.php';
    }



    /*-------------------------------------- 创建service文件 -----------------------------------*/


    /**
     * 创建service (主程序)
     * @param   Input   $input   [description]
     * @param   Output  $output  [description]
     * @return  [type]           [description]
     */
    protected function buildService(Input $input, Output $output)
    {
        // 获取参数
        $uri = trim($input->getArgument('uri'));
        $model = ucfirst(trim($input->getArgument('model')));
        $id = trim($input->getArgument('id'));

        //获取model的类名
        $modelClassname = $this->getModelClassName($model);

        // 获取要创建的service文件所需要的参数
        $serviceParams = $this->getServiceParams($uri);
        if($serviceParams === false){
            $output->writeln("<error>Resources uri is illegal ,please check the first parameter again !</error>\r\n");
            return false;
        }

        //将$id也填到数组
        if(empty($id)){
            $id='id';
        }
        $serviceParams['id'] = $id;
        //将model类名也填到数组
        $serviceParams['modelClassname'] = $modelClassname;

        if (is_file($serviceParams['file'])) {
            $output->writeln('<error>' . $serviceParams['classname'] . " Model already exists!</error>\r\n");
            return true;
        }

        if (!is_dir($serviceParams['path'])) {
            mkdir(strtolower($serviceParams['path']), 0755, true);
        }

        file_put_contents($serviceParams['file'], $this->buildServiceFile($serviceParams));

        $output->writeln('<info> \^o^/ ' . $serviceParams['classname'] . " Service created successfully. \^o^/ </info>\r\n");

        return true;

    }

     /**
     * 创建Service文件
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function buildServiceFile($params)
    {
        $stub = file_get_contents($this->getServiceStub());

        $path               = $params['path'];
        $file               = $params['file'];
        $namespace          = $params['namespace'];
        $classname          = $params['classname'];
        $service            = $params['service'];
        $resources          = $params['resources'];
        $id                 = $params['id'];
        $modelClassname     = $params['modelClassname'];

        return str_replace(
            ['{%className%}', 
            '{%namespace%}', 
            '{%app_namespace%}', 
            '{%model%}', 
            '{%service%}',
            '{%resources%}', 
            '{%id%}'
            ], 
            [$classname,
            $namespace,
            App::$namespace,
            $modelClassname,
            $service,
            $resources,
            $id
        ], $stub);

    }



    /**
     * 获取要创建的service文件所需要的参数
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function getServiceParams($name)
    {
        $name =  strtolower($name);
        $array = explode('/', $name); 
        $array = array_filter($array);   // 清除空值
        if(count($array)<=3 || count($array) > 5){ 
            return false;
        }

        $resources = '';
        for ($i=3; $i < count($array) ; $i++) { 
            $temp = explode('_', $array[$i]);  
            $result = '';  
            foreach($temp as $value){  
                $result.= ucfirst($value);  
            } 
            $resources .= $result; 
        }

        $path = APP_PATH . $array[0].'/service/'.$array[1].'/'.$array[2];
        $file = APP_PATH . $array[0].'/service/'.$array[1].'/'.$array[2].'/'.$resources.'Service.php';

        $appNamespace = App::$namespace;
        $namespace = $appNamespace."\\". $array[0]."\\service\\v\\".$array[2];
        $classname = $resources.'Service';

        $service = $array[2];
        $resources = $array[3];

        //error_code 相关
        $code_file = $path.'/ErrorCode.php';
        $code_prefix = $service.'.'.$resources;
        if(isset($array[4])){
            $code_prefix .= '.'.$array[4];
        }

        return [
            'path' => $path,
            'file' => $file,
            'code_file'=>$code_file,
            'code_prefix'=>$code_prefix,
            'namespace'=>$namespace,
            'classname'=>$classname,
            'service'=>$service,
            'resources'=>$resources
        ];   
    }


    /**
     * 获取service模板
     * @return  [type]  [description]
     */
    protected function getServiceStub()
    {
        return __DIR__ . '/stubs/service.stub';
    }




    /*-------------------------------------- 创建业务层错误码文件 -----------------------------------*/


    /**
     * 创建错误码  (主程序)
     * @param   Input   $input   [description]
     * @param   Output  $output  [description]
     * @return  [type]           [description]
     */
    protected function buildErrorCode(Input $input, Output $output)
    {
        // 获取参数
        $uri = trim($input->getArgument('uri'));
        $model = ucfirst(trim($input->getArgument('model')));
        $id = trim($input->getArgument('id'));

        // 获取要创建的service文件所需要的参数
        $serviceParams = $this->getServiceParams($uri);
        if($serviceParams === false){
            $output->writeln("<error>Resources uri is illegal ,please check the first parameter again !</error>\r\n");
            return false;
        }

        if (is_file($serviceParams['code_file'])) {
            $output->writeln("<error>Error_Code_File already exists!</error>\r\n");
            return true;
        }

        if (!is_dir($serviceParams['path'])) {
            mkdir(strtolower($serviceParams['path']), 0755, true);
        }

        file_put_contents($serviceParams['code_file'], $this->buildErrorCodeFile($serviceParams));

        $output->writeln("<info> \^o^/ Error_Code_File created successfully. \^o^/ </info>\r\n");

        return true;
    }


    /**
     * 创建错误码文件
     * @param   [type]  $name  [description]
     * @return  [type]         [description]
     */
    protected function buildErrorCodeFile($params)
    {
        $stub = file_get_contents($this->getErrorCodeStub());

        $code_prefix     = $params['code_prefix'];

        return str_replace(['{%code%}'], [$code_prefix], $stub);

    }

    /**
     * 获取业务层错误码初始化模板
     * @return  [type]  [description]
     */
    protected function getErrorCodeStub()
    {
        return __DIR__ . '/stubs/error_code.stub';
    }





    /**
     * 检查命令的参数是否缺失
     * @param   Input   $input   [description]
     * @param   Output  $output  [description]
     * @return  [type]           [description]
     */
    protected function checkParams(Input $input, Output $output)
    {
    	$params = "\r\nCommand : [ php think csm uri model id ]\r\n";

    	$params .= " [uri] should be like : api/v1/user/users/id  or  api/v1/user/users \r\n";
    	$params .= " [model] should be like : InvUser \r\n";
    	$params .= " [id] should be like : user_id \r\n";

    	$params .= "\r\nCommand parameters : \r\n";

    	$uri = trim($input->getArgument('uri'));
    	$params .= ' [ resources (uri) => '.$uri." ]\r\n";

        $model = trim($input->getArgument('model'));
        $params .= ' [ database (model) => '.$model." ]\r\n";

        $id = trim($input->getArgument('id'));
        $params .= ' [ database primary key (id) => '.$id." ]\r\n\r\n";

        $flag = true;

        if(!$uri){
        	$params .= "Error : Missing parameter [ uri ]  !\r\n"; 
        	$flag = false;
        }

        if(!$model){
        	$params .= "Error : Missing parameter [ model ] ! \r\n"; 
        	$flag = false;
        }

        // if(!$id){
        // 	$params .= "Error : Missing parameter [ id ] ! \r\n"; 
        // 	$flag = false;
        // }

        if(!$flag){
        	$params .= "\r\nWarning : 2 parameters [ uri , model ] are must required !! \r\n"; 
        }

        $output->writeln($params);
        return $flag;
    }
}