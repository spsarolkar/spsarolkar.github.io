---
layout: post
title:  "Google cloud kubernetes example"
date:   2018-10-06 18:02:15 +0530
categories: docker microservices google-cloud kubernetes
---

We will convert the microservice we built in [earlier post](https://spsarolkar.github.io/docker/microservices/2018/09/30/Building-Microservices-Using-Docker.html) and we will port it in google cloud platform using kubernetes. All the source code is available on [Github](https://github.com/spsarolkar/google-cloud-kubernetes-example)

Our microservice consists of following parts

* Redis database for session management across multiple UI instances
* Backend rest service which generates the message text written using Django
* Fortune Teller front end written in Spring with Oauth2 authorization using Google account

#### Redis database master and slave configuration
We will create the deployment of master and slave using existing images available on Google registry.

##### Redis master
We will configure the single instance deployment of redis master, below is the configuration for the same

redis-master.yml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-master
  namespace: web
spec:
  selector:
     matchLabels:
        app: redis
        role: primary
        tier: backend
  replicas: 1
  template:
    metadata:
      labels:
         app: redis
         role: primary
         tier: backend
    spec:
      containers:
      - name: redis
        image: gcr.io/google_containers/redis:e2e
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
        ports:
        - containerPort: 6379
```

On Kubernetes we will create the deployment of redis master using below command

```bash
kubectl apply -f redis-master.yml
```

Redis master will be exposed on external port `port: 6379` with below service configuration

redis-master-service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-master
  namespace: web
spec:
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis
    role: primary
    tier: backend
```


```bash
kubectl apply -f redis-master-service.yml
```

##### Redis slave

We will need redis-slave which would be doing actual work behind the scenes, in case of slave we will have 2 replicas. Redis slave will register itself on master using environment variable `REDIS_MASTER_SERVICE_HOST`

redis-slave.yml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-replica
  namespace: web
spec:
  selector:
    matchLabels:
        app: redis
        role: replica
        tier: backend
  replicas: 2
  template:
    metadata:
      labels:
        app: redis
        role: replica
        tier: backend
    spec:
      containers:
      - name: replica
        image: gcr.io/google-samples/gb-redisslave@sha256:57730a481f97b3321138161ba2c8c9ca3b32df32ce9180e4029e6940446800ec
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
        env:
        - name: GET_HOSTS_FROM
          value: env
        - name: REDIS_MASTER_SERVICE_HOST
          value: redis-master
        ports:
        - containerPort: 6379
```
```
kubectl apply -f redis-slave.yml
```
redis-slave-service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
     name: redis-replica
     namespace: web
     labels:
        app: redis
        role: replica
        tier: backend
spec: 
     ports:
     - port: 6379
     selector:
       app: redis
       role: replica
       tier: backend
```
```
kubectl apply -f redis-slave-service.yml
```

####  Cowsay rest service

We will have cowsay rest service exposing its rest endpoint which will in turn be used in the front end.

cowsay.yml
```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: cowsay
  namespace: web
spec:
  replicas: 2 
  template:
    metadata:
      labels:
        app: cowsay
    spec:
      containers:
      - name: cowsay
        image: asia.gcr.io/fortune-teller-215315/cowsay@sha256:7f8e43af9af53cf59265836814eb21b9260b478f4ae5e4e8244ef322c20307ef
        imagePullPolicy: IfNotPresent
        livenessProbe:
           failureThreshold: 3
           httpGet:
              path: /
              port: 8000
              scheme: HTTP
           initialDelaySeconds: 3
           periodSeconds: 3
           successThreshold: 1
           timeoutSeconds: 1
        readinessProbe:
           failureThreshold: 1
           httpGet:
              path: /
              port: 8000
              scheme: HTTP
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
```bash
kubectl apply -f cowsay.yml
```

cowsay-service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cowsay
  namespace: web
  labels:
    app: cowsay
spec:
  ports:
     - name: http
       protocol: TCP
       port: 8000
       targetPort: http
  selector:
      app: cowsay
```
```bash
kubectl apply -f cowsay-service.yml
```


####  Fortune Teller front end

We need deployment and service configuration for our application. Deployment file contains the configuration with respect to docker image, number of replicas of the runtime pods and other details like CPU /memory requirement. Our deployment file looks like below

cowsay-ui.yml
```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: cowsay-ui
  namespace: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cowsay-ui
  template:
    metadata:
      labels:
        app: cowsay-ui
    spec:
      containers:
      - name: cowsay-ui
        image: asia.gcr.io/fortune-teller-215315/fortune-teller-ui@sha256:416792ad7f37af47c1f775d6289ab63744df90fe7afd3cd3fcb5c8dc7b96270c 
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
        resources:
          limits:
             cpu: 50m
             memory: 500Mi
          requests:
             cpu: 50m
             memory: 500Mi
        env:
          - name: COWSAY_SERVER_NAME
            value: 'cowsay'
          - name: COWSAY_SERVER_PORT
            value: '8000'
          - name: REDIS_SERVER_NAME
            value: 'redis-master'
          - name: REDIS_SERVER_PORT
            value: '6379'
```

As you can see above configuration contains the docker image details. In this case we are referring to image from Google registry but images from dockerhub should also work fine. We also mentioned the `REDIS` and backend `cowsay` service details.

We can create the deployment using below command on Kubernetes cluster

```
kubectl apply -f cowsay-ui.yml
```

Once deployment is finished our front end container will be started. We need expose this to external world using `LoadBalancer` service as below

cowsay-ui-service.yml
```
apiVersion: v1
kind: Service
metadata:
  name: cowsay-ui
  namespace: web
  labels: 
    app: cowsay-ui
spec:
  type: LoadBalancer
  ports:
     - name: http
       protocol: TCP
       port: 80
       targetPort: 8080
  selector:
      app: cowsay-ui
```

```
kubectl apply -f cowsay-ui-service.yml
```

To check all the services running on kubernetes use command `kubectl get service`

```
$ kubectl get service
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
cowsay          ClusterIP      10.39.241.184   <none>           8000/TCP       3d
cowsay-ui       LoadBalancer   10.39.253.234   35.200.227.184   80:32099/TCP   3d
redis-master    ClusterIP      10.39.250.176   <none>           6379/TCP       4d
redis-replica   ClusterIP      10.39.240.117   <none>           6379/TCP       4d
```

This will show you all the services running and their respective IP addresses. Also it will show external ip address for container exposed as a `LoadBalancer` service

I have currently hosted the application on [http://gcp-kube-demo.sunilsarolkar.com](http://gcp-kube-demo.sunilsarolkar.com). I will keep it alive until I can afford it.
