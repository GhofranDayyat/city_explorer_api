DROP TABLE IF EXISTS locations;


CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query text,
  formatted_query text,
  latitude NUMERIC,
  longitude NUMERIC
)

