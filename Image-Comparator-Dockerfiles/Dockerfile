# Image-Comparator Dockerfile
FROM ubuntu

# These are essential
RUN apt update -y;
RUN apt install python3.10 -y;
RUN apt-get install python3-pip -y;
RUN apt-get install vim -y;
RUN apt-get install curl -y;

# Requirements
COPY requirements.txt /
RUN pip install -r requirements.txt

ENTRYPOINT ["bash"]