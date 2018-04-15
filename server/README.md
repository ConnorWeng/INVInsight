> +++++ 2018-04-15 更新说明：+++++

#### 新增了命令 csm (create service and model)
>    通过命令可自动创建 service文件 、 model文件 以及 错误码文件

------------
- **命令格式**：

`php think csm 资源uri 数据库model 数据库表主键id`
- **例如**：

`php think csm  api/v1/user/users/id InvUser user_id`
- **其中**：

> 1、资源uri 有两种形式：

```php
- 指定资源(如：api/v1/user/users/id)  <uri 最后面的 id 固定为字符串 'id' ，不能变动>
- 资源集合(如：api/v1/user/users)
    
```
> 2、资源uri 和 数据库model 是必要参数

> 3、 数据库表主键id 为可选，忽略时，生成的文件中指向资源路径的id字段默认为 'id'


------------

- 通过上面的命令，会自动在 apps/api/service/v1/user/目录下生成 service文件 UsersIdService.php 和 错误码文件 ErrorCode.php 

- 在 apps/common/model 目录下生成数据库模型文件 InvUser.php 

------------

> **好处：通过该命令行生成文件后，可以直接进行业务代码的编写，无需再自行创建model层和service层等相关文件，不用再通过拷贝然后调整的方式去改动命名空间和类名等细节。非常方便！**