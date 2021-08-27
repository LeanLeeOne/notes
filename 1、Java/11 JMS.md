JMS，Java Message Service，消息通道分为两种：

1. Queue，点对点的队列，Producer向指定的队列发送消息，Customer从指定的队列接收消息。
2. Topic，一对多的主题订阅，Producer向指定的主题中发送消息，订阅该主题的消费者均可接收到完整的消息副本。