CREATE TABLE stock (
  stock_id SERIAL primary key unique,
  setor varchar(255) NOT NULL,
  sub_setor varchar(255),
  empresa varchar(100) NOT NULL,
  ativo varchar(10) NOT NULL,
  segmento_corporativo varchar,
  segmento_setorial varchar(255) NOT NULL
);

\COPY stock (setor, sub_setor, empresa, ativo, segmento_corporativo, segmento_setorial) FROM '/docker-entrypoint-initdb.d/setorial_b3_simplificado.csv' WITH (FORMAT csv);