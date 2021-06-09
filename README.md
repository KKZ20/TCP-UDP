# 数据包多层传输演示

## 一、 本地运行过程

-   安装 [Node.js](https://nodejs.org/en/) ，LTS版本即可
-   安装yarn
    -   [根据不同操作系统，执行相应步骤](http://yarnpkg.top/Installation.html)
    -   执行`yarn --version`来确认是否安装成功

-   获取本项目
    -   运行`git clone https://github.com/KKZ20/TCP-UDP.git`拉取项目代码
    -   如果已经有这个项目代码了（比如查作业的可爱哥哥）则略过这一步

-   进入项目文件夹(`cd TCP-UDP`或者`cd TCP-UDP-master`，看你本地文件夹名字叫啥），安装依赖，按下面步骤依次执行
    -   执行`yarn add antd`安装Ant-Deisgn组件库依赖
    -   执行`npm install rc-queue-anim --save`安装Ant-Motion动画库依赖（进出场动画）
    -   执行`npm install rc-animate --save`安装Ant-Motion动画库依赖（css样式动画）
-   执行`yarn start`，即可在[本地3000端口]( [http://localhost:3000](http://localhost:3000/))查看！Enjoy it！

另外也可通过直接访问10.60.102.252:20129来在线查看！

## 二、 程序设计总体说明

### 1. 总体目录结构

```
|--node_modules      // 项目工程使用的库，根据package.json安装，非常大，按照上面运行过程执行后可生成
   |--...
   |--...(多个文件不一一例举)
|--public            // 资源文件
   |--index.html     // 页面导航
   |--...(多个文件不一一例举)
|--src
   |--backend 2      // 各种协议头信息计算（重点关注！）
      |--Bridge.js   // 从页面获取数据，并传给各个协议头进行处理和计算
      |--Ethernet.js // 以太网头信息计算
      |--IP.js       // IP头信息计算
      |--TCP.js      // TCP头信息计算
      |--UDP.js      // UDP头信息计算
      |--test.js     // 测试用文件
   |--App.css            // 主页面样式
   |--App.js             // 主页面实现（重点关注！）
   |--App.test.js        // 工程创建时产生的文件
   |--index.css			 // 工程创建时产生的文件
   |--logo.svg           // 工程创建时产生的文件
   |--reportWebVitals.js // 工程创建时产生的文件
   |--setupTests.js      // 工程创建时产生的文件
|--.gitignore             // git提交时忽略追踪的配置
|--package-lock.json      // 项目使用依赖的配置文件（锁定所有模块的版本号）
|--package.json           // 项目使用依赖的配置文件（项目所使用的模块）
|--yarn.lock              // 扁平化展示项目使用依赖的配置文件
|--README.md              // You're now reading this!
```



### 2. 算法部分



### 3. 界面演示部分

界面演示采用React框架以及Ant-Design、Ant-Motion等依赖，总体页面结构如下图：

<img src=".\img\image-20210609102517594.png" alt="image-20210609102517594" style="zoom:50%;" />

有关具体实现请查看代码文件中的注释，此处不再赘述。



## 三、 使用说明

### 1. 总体操作流程图

<img src=".\img\image-20210609110601211.png" alt="image-20210609110601211" style="zoom:50%;" />

### 2. 实例演示

