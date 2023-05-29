FROM python:3.10-bullseye

WORKDIR /code
COPY . /code
RUN chmod 777 *.sh
RUN ./pre_train.sh
RUN ./prepare_pre_trained_model.sh
RUN ./prepare_pre_trained_model.sh