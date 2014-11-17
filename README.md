# bone-cli
> bone的命令行工具

###安装
通过npm安装，这是全局模块，安装后可以在命令行中使用`bone`命令

```sh
npm install -g bone-cli
```

bone-cli会载入你项目目录下的[bone](https://github.com/wyicwx/bone)模块，并给bone对象上添加commander对象(commander对象是[Commander](https://github.com/tj/commander.js)的一个实例)

###开始

你需要在你的项目的根目录下创建`bonefile.js`文件，bone-cli会自动载入这个文件
```js
var bone = require('bone');
```
**注意**：bonefile.js不需要调用`bone.setup`函数来设置bone根目录，bone-cli会使用bonefile.js所在的文件夹路径初始化bone


通过bone命令查看相应帮助
```sh
$ bone --help
```

###添加自己的命令



###依赖模块

+ [bone-build](https://github.com/wyicwx/bone-build) 给bone-cli添加build命令的支持

