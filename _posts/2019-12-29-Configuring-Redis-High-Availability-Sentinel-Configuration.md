---
layout: post
title:  "Redis High Availability Solution using Redis Sentinel and docker"
date:   2019-12-29 17:45:00 +0530
categories: Redis High-Availability Sentinel kubernetes
---

In this post we will configure the Redis high availability server using kubernetes. Below will be our final configuration for redis cluster.

![Redis-High-Availability-server-block-diagram]

[Redis-High-Availability-server-block-diagram]:/images/redis-high-availability-server/Redis-High-Availability-server-block-diagram.png

For each block present above we will have seperate docker container. So we have below list of images

1. master-sentinel: This will be single copy of container which will run resid master node and redis sentinel node
2. replica-sentinel: This will be multiple(two in our case above) copy of container which will run redis replica node and redis sentinel node

###### **Creating Docker image for master-sentinel**
To configure master-sentinel image we need to two redis instances running, one with master configuration and one with sentinel configuration. So there will be two seperate configurations for both thes instances.

1. **redis-master.conf**

    This configuration file will be used for starting Redis as a master node. As we are running the redis inside docker container it will aquire the local ip address assigned by Kubernetes, redis replica and redis sentinel processes on different container will need docker pod ip address to connect to this master node. So we need special configuration --cluster-announce-ip, --cluster-announce-port and --sentinel announce-ip, --sentinel announce-port that will be provided as a environment variable by Kubernetes deployment configuration.
    As we need master to listen connections from other docker machines we need to comment the line ```bind 127.0.0.1``` in default configurations of redis.
    ```
    # bind 127.0.0.1
    ```

    Also protected mode should be turned off by commenting ```protected-mode yes```
    ```
    # protected-mode yes
    ```

    We also need configuration added from command line so that process outside container will be able to connect to master node.
    ```
        --cluster-announce-ip $MY_POD_IP
        --cluster-announce-port $MASTER_ANNOUNCE_PORT
    ```

2. **redis-sentinel.conf**
    We will be configurting ht sentinel configuration from command line while starting the sentinel process from start script using below arguments

    ```
    --sentinel announce-ip $MY_POD_IP --sentinel announce-port $SENTINEL_ANNOUNCE_PORT

    --sentinel monitor mymaster $MY_POD_IP $MASTER_ANNOUNCE_PORT 2

    --sentinel down-after-milliseconds mymaster 30000

    --sentinel parallel-syncs mymaster 1

    --sentinel failover-timeout mymaster 180000
    ```

    Please note that we have hardcoded the master group ```mymaster```. We need to use this while connecting from client.
3. **start.sh**

    We need start script that will start both instances of redis(master and sentinel) with configuration discussed above.

    ```bash
    redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip $MY_POD_IP --cluster-announce-port $MASTER_ANNOUNCE_PORT
    ```
    Note that we are using environment variable for ```--cluster-announce-ip``` and ```--cluster-announce-port``` this needs to be a part of kubernetes deployment cofiguration

    ```bash
    redis-server /usr/local/etc/redis/sentinel.conf --sentinel announce-ip $MY_POD_IP --sentinel announce-port $SENTINEL_ANNOUNCE_PORT --sentinel monitor mymaster $MY_POD_IP $MASTER_ANNOUNCE_PORT 2 --sentinel down-after-milliseconds mymaster 30000 --sentinel parallel-syncs mymaster 1 --sentinel failover-timeout mymaster 180000
    ```


###### **Creating docker image for replica-sentinel**

For creating image for replica-sentinel we need docker replica and docker sentinel running in same container and both should be connecting to redis master instance inside master-sentinel image.
We will have configurations for redis-replica and redis-sentinel for the same.

1. **redis-replicator.conf**

    We need redis-master to be able to connect to redis-replicator so we need below configuration commented
    ```
    # bind 127.0.0.1
    ```
    Also we need to turn off protected mode by commenting below line

    ```
    # protected-mode yes
    ```


    We will also use below configuration from command line arguments
    ```
    --replica-announce-ip $MY_POD_IP
    --replicaof $REDIS_MASTER_SERVICE_HOST $REDIS_MASTER_SERVICE_PORT

    ```
    We need to pass $MY_POD_IP, $REDIS_MASTER_SERVICE_HOST and $REDIS_MASTER_SERVICE_PORT environment varialbles from kubernetes deployment configurations
2. **redis-sentinel.conf**

    Sentinel configuration will be similar to the sentinel configuration inside master-sentinel, only different is instead of connecting to master node on the same machine it will read the master hostname from environment variable,

    ```
    --sentinel monitor mymaster $REDIS_MASTER_SERVICE_HOST $REDIS_MASTER_SERVICE_PORT 2
    ```

    Rest of the configuration is same as sentinel in master-sentinel image.

3. **start.sh**

    Finally we will have start.sh starting the replica and sentinel processes

    Starting replica instance
    ```
    redis-server /usr/local/etc/redis/redis-replicator.conf --replica-announce-ip $MY_POD_IP --replicaof $REDIS_MASTER_SERVICE_HOST $REDIS_MASTER_SERVICE_PORT &> /var/log/redis-replica.log &
    ```

    Starting sentinel instance
    ```
    redis-server /usr/local/etc/redis/sentinel.conf --sentinel announce-ip $MY_POD_IP --sentinel announce-port $SENTINEL_ANNOUNCE_PORT --sentinel monitor mymaster $REDIS_MASTER_SERVICE_HOST $REDIS_MASTER_SERVICE_PORT 2 --sentinel down-after-milliseconds mymaster 30000 --sentinel parallel-syncs mymaster 1 --sentinel failover-timeout mymaster 180000
    ```

###### **Kubernetes configuration for master-sentinel and replica-sentinel**
For deploying the redis cluster on Kubernetes we need to create deployment and services as below
![Kubernetes-deployment-redis-high-availability]

[Kubernetes-deployment-redis-high-availability]:/images/redis-high-availability-server/Kubernetes-deployment-redis-high-availability.png

**master-sentinel deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-primary
  namespace: web
  labels:
    app: redis-primary
spec:
  selector:
     matchLabels:
        app: redis-primary
  replicas: 1
  template:
    metadata:
      labels:
         app: redis-primary
    spec:
      containers:
      - name: redis
        image: spsarolkar/master-sentinel:1.0
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
        env:
          - name: MY_POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
          - name: MASTER_ANNOUNCE_PORT
            value: "6379"
          - name: SENTINEL_ANNOUNCE_PORT
            value: "26379"
        ports:
        - containerPort: 6379
          name: redis-master
        - containerPort: 26379
          name: redis-sentinel
```

**master-sentinel service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-primary
  namespace: web
spec:
  ports:
  - port: 6379
    targetPort: 6379
    name: redis-master
  - port: 26379
    targetPort: 26379
    name: redis-sentinel
  selector:
    app: redis-primary
```

**replica-sentinel deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-secondary
  namespace: web
  labels:
    app: redis-secondary
spec:
  selector:
    matchLabels:
      app: redis-secondary
  replicas: 2
  template:
    metadata:
      labels:
        app: redis-secondary
    spec:
      containers:
      - name: replica
        image: spsarolkar/replica-sentinel:1.0
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
        env:
        - name: REDIS_MASTER_SERVICE_HOST
          value: redis-primary
        - name: REDIS_MASTER_SERVICE_PORT
          value: "6379"
        - name: SENTINEL_ANNOUNCE_PORT
          value: "26379"
        - name: MY_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        ports:
        - containerPort: 26379
          name: redis-sentinel
```

**replica-sentinel service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-secondary
  namespace: web
spec:
  ports:
  - port: 26379
    targetPort: 26379
  selector:
    app: redis-secondary
```

###### **Connecting to redis from client application**

To use this high availability cluster we need client capable of connecting to redis sentinel. In the example application we will use spring based configuration for connecting to redis sentinel.

I have created simple application using spring that has one deamon service and one front end service. The application block diagram is as below

![FortuneTeller-cowsay-block-diagram]

[FortuneTeller-cowsay-block-diagram]:/images/redis-high-availability-server/FortuneTeller-cowsay-block-diagram.png

1. **Fortune Teller UI**

    This is simple spring boot application configured to use open id from google for authorization purpose. We have configured the HTTP session to connect to redis sentinel using below configuration

    ```java
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        RedisSentinelConfiguration config = new RedisSentinelConfiguration()
                .master(appConfig.getRedisSentinelMasterGroup())
                .sentinel(appConfig.getRedisMasterSentinelName(),appConfig.getRedisMasterSentinelPort())
                .sentinel(appConfig.getRedisReplicaSentinelName(),appConfig.getRedisReplicaSentinelPort());
        LettuceConnectionFactory connection = new LettuceConnectionFactory(config);
        return connection;
    }
    ```

    **fortune-teller deployment**
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: fortune-teller
      namespace: web
      labels:
        app: fortune-teller
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: fortune-teller
      template:
        metadata:
          labels:
            app: fortune-teller
        spec:
          containers:
          - name: fortune-teller
            image: spsarolkar/fortune-teller:2.0
            imagePullPolicy: IfNotPresent
            ports:
            - containerPort: 8080
              name: http
            resources:
              limits:
                 cpu: 500m
                 memory: 700Mi
              requests:
                 cpu: 100m
                 memory: 300Mi
            env:
              - name: COWSAY_SERVER_NAME
                value: 'cowsay-deamon'
              - name: COWSAY_SERVER_PORT
                value: '8000'
              - name: REDIS_MASTER_NAME
                value: 'redis-primary'
              - name: MASTER_SENTINEL_PORT
                value: '26379'
              - name: REDIS_REPLICA_NAME
                value: 'redis-secondary'
              - name: REPLICA_SENTINEL_PORT
                value: '26379'
              - name: REDIS_SENTINEL_MASTER_GROUP
                value: 'mymaster'
    ```
    **fortune-teller-service**
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: fortune-teller-service
      namespace: web
    spec:
      type: LoadBalancer
      ports:
         - name: http
           protocol: TCP
           port: 80
           targetPort: 8080
           nodePort: 31737
      selector:
          app: fortune-teller
    ```

2. **Cowsay deamon**

    This is rest API built using Django python framework. Front end will call rest service exposed by this deamon and will produce the fortune messages.

    **cowsay-deployment**
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: cowsay-deployment
      namespace: web
      labels:
        app: cowsay-deployment
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: cowsay-deployment
      template:
        metadata:
          labels:
            app: cowsay-deployment
        spec:
          containers:
          - name: cowsay-deployment
            image: spsarolkar/cowsay-deamon:1.0
            imagePullPolicy: IfNotPresent
            ports:
            - containerPort: 8000
              name: http
            resources:
              limits:
                 cpu: 200m
                 memory: 300Mi
              requests:
                 cpu: 200m
                 memory: 300Mi
    ```
    **cowsay-service**
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: cowsay-deamon
      namespace: web
    spec:
      ports:
         - name: http
           protocol: TCP
           port: 8000
           targetPort: http
      selector:
          app: cowsay-deployment
    ```

I have deployed example application on minikube and is accesible from link [http://gcp-kube-demo.sunilsarolkar.com:31737/](http://gcp-kube-demo.sunilsarolkar.com:31737/)