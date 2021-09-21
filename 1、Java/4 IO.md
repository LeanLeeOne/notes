### 遍历文件和目录

Java中IO的最小单位为byte（字节）。

<span style=background:#b3b3b3>File.listFile(FileFilter ff)</span>可以对输出结果进行过滤。

对目录进行复杂的拼接、遍历时，使用Path类更方便。

Files、Paths工具类能更加方便的操作文件，但是只适用于小文件，大文件还得用文件流来处理。



### 字节流

<span style=background:#e6e6e6>InputStream/OutputStream</span>是抽象类，而非接口。

<span style=background:#e6e6e6>BufferedInputStream/BufferedOutputStream</span>带缓存，能减少用户态和核心态之间的切换，效率高。

<span style=background:#e6e6e6>ByteArrayInputStream/ByteArrayOutputStream</span>可以在内存中创建一个<span style=background:#e6e6e6>InputStream/OutputStream</span>对象，常用于测试。

<span style=background:#e6e6e6>InputStream/OutputStream</span>采用<span style=background:#c2e2ff>Filter模式</span>（也称Decorator，<span style=background:#c2e2ff>装饰器模式</span>）来解决子类爆炸问题，同时，ByteArrayInputStream、FileInputStream、StringBufferInputStream等类体现了<span style=background:#c2e2ff>适配器模式</span>。

1. <span style=background:#b3b3b3>InputStream.read()</span>方法是一个个字节地读，并返回字符地int值，效率低；<span style=background:#b3b3b3>InputStream.read(byte[] b)</span>可以一次性读取多个字节到缓冲区，从而提高效率。
   1. 不同**OS**的文件路径不同，但我们可以把文件放入**Classpath**，然后使用相对路径进行读取。
   2. 使用<span style=background:#b3b3b3>Class.getResourceAsStream(String path)</span>能直接从**Classpath**中读写资源
   3. 从**Classpath**中读取文件时，需要判空，读取完成后要及时释放资源，可以用try(resource){}语法简化资源释放。

3. 一般来说，大部分情况下不需要主动调用<span style=background:#b3b3b3>OutputStream.flush()</span>，因为当缓冲区满，或者调用close()时会自动调用flush()。

Jar文件本质上就是Zip文件，只不过增加了一些固定的描述文件。



### 字符流

**Reader**类是带解码器的**InputStream**，能根据字符集编码，将字节转换为字符。

**Wirter**类则是基于**OutputStream**，能根据字符集编码，将字符转换为字节。



### 序列化

序列化是指将对象转换成**二进制**数据的过程，在Java中是用**字节数组**实现的。

Java中对象要实现序列化，需要类实现**Serializable**接口。

序列化过程中要写入大量的类型信息。

经**transient**、**static**关键字修饰的字段不参与序列化。



### 反序列化

反序列化是将**二进制**数据转换成Java对象的过程，该过程不经过**构造方法**。

反序列化过程中，可能会抛出异常：

1. **ClassNotFoundException**，找不到对应的类。
2. **InvalidClassException**，类型不匹配。

针对**InvalidClassException**我们可以通过给**Serializable**接口的静态变量serialVersionUID，来快速标识类的版本：

1. 即类版本不一致时，直接抛出异常；版本一致时在判断属性类型是否一致等。
2. 当我们修改序列化类后，最好也更新版本标识。

反序列化存在安全漏洞：通过重载<span style=background:#b3b3b3>Serializable.readObject()</span>和**反射**，来实现序列化后执行相关代码，进而引发相关问题。

所以，更好的序列化方式是通过JSON这样的通用方式来进行，序列化的内容只有基本类型组成的数据，不包含类型信息。

RMI、JNDI中的数据传输是完全基于Java序列化的。