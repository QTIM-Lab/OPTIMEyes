FROM nginx:stable

# Install vim
RUN apt-get update -y;
RUN apt install vim -y;

# remove the default conf
RUN rm /etc/nginx/conf.d/default.conf

#  copy the nginx.conf in our filesystem into the image filesystem "conf.d"
COPY vueflask.conf /etc/nginx/conf.d