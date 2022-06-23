## grubby

修改内核参数，修改完后需要重启



## ps

查看进程。



## netstat

`-a`：显示所有选项，默认不显示Listen相关。

`-t`：仅显示TCP相关选项。

`-u` ：仅显示UDP相关选项。

`-n` ：拒绝显示别名，能显示数字的全部转化成数字。

`-l` ：仅列出有在 Listen (监听) 的服務状态。

`-p`：显示建立相关链接的程序名。

`-r`：显示路由信息，路由表。

`-e`：显示扩展信息，例如`uid`等。

`-s`：按各个协议进行统计。

`-c`：每隔一个固定时间，执行该`netstat`命令。



## cron

Linux默认会自动启动`crond`进程，[无需用户手动启动、关闭](http://blog.chinaunix.net/uid-25785357-id-3434344.html)。

用户只需将要执行的任务写入`cron`的配置文件中，之后`crond`进程会自动读取并执行这些定时任务。

### 配置文件

`cron`的[配置文件有4种](https://www.runoob.com/w3cnote/linux-crontab-tasks.html)：

1. `/var/spool/cron`：存放有每个用户的配置的任务，以创建者的名字命名。
2. `/etc/crontab`：负责调度、维护任务。
3. `/etc/cron.d`：存放要执行的`crontab`文件或脚本。
4. `/etc/cron.daily`、`/etc/cron.hourly`、`/etc/cron.monthly`、`/etc/cron.weekly`：其中的脚本会按每时、每天、每周、每月执行一次。

### 表达式

`cron`有2种表达式：

1. `Minute Hour DayOfMonth Month DayOfWeek Year Command`
2. `Minute Hour DayOfMonth Month DayOfWeek Command`

##### 符号

表达式中的时间除了能指定数值，还可以搭配以下符号：

- `*`：所有可能的值，如，每月、每小时。
- `,`：用逗号隔开一组值，如，`1,2,5,7,8,9`。
- `-`：一个整数范围，如，`2-6`表示`2,3,4,5,6`。
- `/`：间隔频率，可以和`*`、`/`搭配使用，如，`0-23/2`表示每两小时执行一次，`*/10`表示每十（分钟、秒）执行一次。

### crontab

`crontab`是`cron table`的简写，它是`cron`的配置文件，使用`crontab -e`可对其进行编辑，其中的[每条任务的格式](https://segmentfault.com/a/1190000021815907)为：

```shell
Minute Hour DayOfMonth Month DayOfWeek Comand
```

> `crontab`的格式与`cron`表达式略有差异，是从<span style=background:#c2e2ff>分钟</span>开始。

### 其它定时任务的实现

#### Quartz

可从数据库中读取配置。

单例可用数据库控制，多例可结合**Zookeeper**、**Red Lock**对并发数进行控制。

#### [@Scheduled](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Scheduled.html)

支持[更丰富的符号](https://www.jianshu.com/p/1defb0f22ed1)。

#### RocketMQ

#### Redis

实现方式：为Key设置过期时间，并开启键空间通知。

[注意](https://juejin.cn/post/6844903924093157389#heading-3)，但是`expired`事件并不是在Key过期时就触发，而是在Key被定期清理时，或者当Key被访问时才会触发。



## 发行版本[[3]](https://blog.51cto.com/u_494981/1383655)

Linux发行版本有RedHat和Debian两大派系。

### RedHat

- 常见的安装包格式为`rpm`，对应的安装命令是`rpm -参数`。
- 包管理工具为<span style=background:#c2e2ff>yum</span>。
- 有CentOS、Fedora等派生版本。

### Debian

- 常见的安装包格式`deb`，对应的安装命令是`dpkg -参数`。
- 包管理工具为<span style=background:#c2e2ff>apt-get</span>。
- 有Debian、Ubuntu等派生版本。



## 安装软件

软件安装分为<u>源代码编译安装</u>和<u>安装包自动安装</u>，而软件之间往往存在着<span style=background:#c9ccff>依赖关系</span>，即，安装某一软件之前需要先安装某些软件。

### 源代码编译安装

开发者往往将源代码打包为`tar`包，使用者下载、解压后，需要使用`./configure`、`make`、`make install`来安装软件。

不难看出，<u>源代码编译安装</u>的方式较为繁琐，于是便有了安装包。

### 安装包自动安装

开发者将源代码预先编译好，并将其封装为`rpm`、`deb`等格式的文件，即，安装包，这样，使用者仅需执行安装包便可完成软件的安装。

但安装包的“自动安装”不包括软件之间<span style=background:#c9ccff>依赖关系</span>的自动处理，使用者仍然需要手动处理软件之间的<span style=background:#c9ccff>依赖</span>，而这对使用者来说是一件很繁琐的事情。

> 比如，想要编译安装**Nginx**，需要先安装`gcc`和`pcre`，而`gcc`又依赖了其它的软件，也就是说，安装**Nginx**需要以下软件（源码、安装包）：
>
> `cloog-ppl-0.15.7-1.2.el6.x86_64.rpm`、`cpp-4.4.7-23.el6.x86_64.rpm`、`cpp-4.8.5-28.el7.x86_64.rpm`、`gcc-4.4.7-23.el6.x86_64.rpm`、`gcc-4.8.5-28.el7.x86_64.rpm`、`gcc-c++-4.4.7-23.el6.x86_64.rpm`、`gcc-c++-4.8.5-28.el7.x86_64.rpm`、`glibc-2.17-222.el7.x86_64.rpm`、`glibc-common-2.17-222.el7.x86_64.rpm`、`glibc-devel-2.17-222.el7.x86_64.rpm`、`glibc-headers-2.17-222.el7.x86_64.rpm`、`gmp-6.1.2-8.fc29.x86_64.rpm`、`kernel-headers-3.10.0-862.el7.x86_64.rpm`、`lib64mpc3-1.1.0-1.mga7.x86_64.rpm`、`lib64mpfr1-2.4.2-2mdv2010.1.x86_64.rpm`、`lib64mpfr6-4.0.1-1.mga7.x86_64.rpm`、`libgcc-4.4.7-23.el6.x86_64.rpm`、`libgcc-4.8.5-28.el7.x86_64.rpm`、`libgomp-4.4.7-23.el6.x86_64.rpm`、`libgomp-4.8.5-28.el7.x86_64.rpm`、`libstdc++-4.4.7-23.el6.x86_64.rpm`、`libstdc++-4.8.5-28.el7.x86_64.rpm`、`libstdc++-devel-4.4.7-23.el6.x86_64.rpm`、`libstdc++-devel-4.8.5-28.el7.x86_64.rpm`、`mpfr-3.1.1-4.el7.x86_64.rpm`、`nginx-1.16.1.tar.gz`、`pcre-8.35.tar.gz`、`ppl-0.10.2-11.el6.x86_64.rpm`、`zlib-1.2.11.tar.gz`

正是因为手动处理<span style=background:#c9ccff>依赖</span>如此繁琐，于是便有了<span style=background:#c2e2ff>yum</span>、<span style=background:#c2e2ff>apt-get</span>等管理工具来自动处理<span style=background:#c9ccff>依赖</span>。



## 查看日志

直接登上服务器，用`head`、`tail`、`less`、`more`等命令进行查看，也可以结合`awk`、`sed`、`grep`等文本处理工具进行简单的分析。

