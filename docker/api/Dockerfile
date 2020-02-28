FROM node:10-slim

COPY ./init.sh /init.sh

RUN chmod +x /init.sh

WORKDIR /usr/src/api

EXPOSE 3000

CMD ["/init.sh"]